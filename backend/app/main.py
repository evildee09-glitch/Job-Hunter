import hashlib
import logging
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, inspect, or_, select
from sqlalchemy.orm import Session

from . import config
from .db import engine, get_db
from .models import (
    Application, Certification, Document, Education, Employment, Interview, Profile, Project, Skill,
)
from .resume_parser import extract_text, parse_resume
from .security import require_token

log = logging.getLogger("ajh")
app = FastAPI(title="AI Job Hunter API", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# kind -> (model, editable fields)
KINDS = {
    "employment": (Employment, ("title", "company", "start", "end", "description")),
    "skills": (Skill, ("name", "level")),
    "education": (Education, ("school", "degree", "years")),
    "certifications": (Certification, ("name", "issuer", "year")),
    "projects": (Project, ("name", "summary")),
}
PROFILE_FIELDS = ("name", "email", "phone", "location", "summary")
Verification = Literal["verified", "unverified"]  # users cannot self-assign 'ai_suggested'


class FieldsPayload(BaseModel):
    fields: dict[str, str] = {}
    verification: Verification | None = None


def _dict(obj) -> dict:
    out = {}
    for attr in inspect(obj).mapper.column_attrs:
        if attr.key == "profile_id":
            continue
        v = getattr(obj, attr.key)
        out[attr.key] = v.isoformat() if isinstance(v, datetime) else v
    return out


def _profile(db: Session) -> Profile:
    p = db.scalars(select(Profile)).first()
    if p is None:
        p = Profile()
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


def _full(p: Profile) -> dict:
    out = _dict(p)
    for kind in KINDS:
        out[kind] = [_dict(i) for i in getattr(p, kind)]
    out["documents"] = [{k: v for k, v in _dict(d).items() if k != "extracted_text"} for d in p.documents]
    return out


def _apply(obj, allowed: tuple[str, ...], payload: FieldsPayload) -> None:
    for k, v in payload.fields.items():
        if k not in allowed:
            raise HTTPException(422, f"Unknown field: {k}")
        setattr(obj, k, v[:5000])
    if payload.verification:
        obj.verification = payload.verification


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "auth_configured": bool(config.API_TOKEN), "database": engine.dialect.name}


@app.get("/profile", dependencies=[Depends(require_token)])
def get_profile(db: Session = Depends(get_db)) -> dict:
    return _full(_profile(db))


@app.put("/profile", dependencies=[Depends(require_token)])
def put_profile(payload: FieldsPayload, db: Session = Depends(get_db)) -> dict:
    p = _profile(db)
    _apply(p, PROFILE_FIELDS, payload)
    p.version += 1
    db.commit()
    return _full(p)


@app.post("/items/{kind}", dependencies=[Depends(require_token)])
def create_item(kind: str, payload: FieldsPayload, db: Session = Depends(get_db)) -> dict:
    if kind not in KINDS:
        raise HTTPException(404, "Unknown item kind")
    model, allowed = KINDS[kind]
    p = _profile(db)
    item = model(profile_id=p.id, source="user")
    _apply(item, allowed, payload)
    db.add(item)
    p.version += 1
    db.commit()
    return _dict(item)


def _get_item(db: Session, kind: str, item_id: int):
    if kind not in KINDS:
        raise HTTPException(404, "Unknown item kind")
    model, allowed = KINDS[kind]
    item = db.get(model, item_id)
    if item is None:
        raise HTTPException(404, "Item not found")
    return item, allowed


@app.patch("/items/{kind}/{item_id}", dependencies=[Depends(require_token)])
def patch_item(kind: str, item_id: int, payload: FieldsPayload, db: Session = Depends(get_db)) -> dict:
    item, allowed = _get_item(db, kind, item_id)
    _apply(item, allowed, payload)
    _profile(db).version += 1
    db.commit()
    return _dict(item)


@app.delete("/items/{kind}/{item_id}", dependencies=[Depends(require_token)])
def delete_item(kind: str, item_id: int, db: Session = Depends(get_db)) -> dict:
    item, _ = _get_item(db, kind, item_id)
    db.delete(item)
    _profile(db).version += 1
    db.commit()
    return {"deleted": item_id}


@app.post("/resume/import", dependencies=[Depends(require_token)])
def import_resume(file: UploadFile = File(...), db: Session = Depends(get_db)) -> dict:
    name = re.sub(r"[\x00-\x1f]", "", Path(file.filename or "").name)[:200]
    ext = Path(name).suffix.lower()
    if ext not in config.ALLOWED_EXTENSIONS:
        raise HTTPException(415, f"Unsupported file type. Allowed: {', '.join(sorted(config.ALLOWED_EXTENSIONS))}")
    data = file.file.read(config.MAX_UPLOAD_BYTES + 1)
    if len(data) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File is larger than 5 MB")
    if (ext == ".pdf" and not data.startswith(b"%PDF")) or (ext == ".docx" and not data.startswith(b"PK")) or (
        ext == ".txt" and b"\x00" in data
    ):
        raise HTTPException(415, "File contents do not match its extension")
    try:
        text = extract_text(data, ext)
    except Exception:
        log.exception("resume extraction failed")
        raise HTTPException(422, "Could not read this file")
    if len(text.strip()) < 30:
        raise HTTPException(422, "No readable text found (scanned PDFs need OCR, which is not supported yet)")

    parsed = parse_resume(text)
    p = _profile(db)
    stored = f"{uuid.uuid4().hex}{ext}"
    (config.UPLOAD_DIR / stored).write_bytes(data)
    doc = Document(
        profile_id=p.id, filename=name or stored, stored_name=stored, size=len(data),
        sha256=hashlib.sha256(data).hexdigest(), extracted_text=text,
    )
    db.add(doc)
    for f in ("name", "email", "phone", "summary"):  # never overwrite values the user already has
        if not getattr(p, f) and getattr(parsed, f):
            setattr(p, f, getattr(parsed, f))
    existing = {s.name.lower() for s in p.skills}
    counts = {k: 0 for k in KINDS}
    for n in parsed.skills:
        if n.lower() not in existing:
            db.add(Skill(profile_id=p.id, name=n, source="import"))
            existing.add(n.lower())
            counts["skills"] += 1
    for kind, rows in (
        ("employment", parsed.employment), ("education", parsed.education),
        ("certifications", parsed.certifications), ("projects", parsed.projects),
    ):
        model = KINDS[kind][0]
        for row in rows:
            db.add(model(profile_id=p.id, source="import", **row))
            counts[kind] += 1
    p.version += 1
    db.commit()
    return {"document_id": doc.id, "counts": counts, "sections_found": parsed.sections_found,
            "note": "All imported items are unverified. Review and confirm them."}


# ---------------------------------------------------------------- applications

AppStatus = Literal[
    "discovered", "analyzed", "shortlisted", "documents_prepared", "ready_for_review",
    "submitted", "interview", "offer", "rejected", "withdrawn",
]


class ApplicationIn(BaseModel):
    source: str = Field(max_length=24)
    job_ref: str = Field(max_length=120)
    title: str = Field(min_length=1, max_length=300)
    company: str = Field(default="", max_length=200)
    url: str = Field(max_length=500)
    location: str = Field(default="", max_length=200)
    match_score: int | None = Field(default=None, ge=1, le=10)
    status: AppStatus = "shortlisted"
    notes: str = Field(default="", max_length=5000)
    force: bool = False


class ApplicationPatch(BaseModel):
    status: AppStatus | None = None
    notes: str | None = Field(default=None, max_length=5000)
    applied_on: str | None = Field(default=None, pattern=r"^(\d{4}-\d{2}-\d{2})?$")
    follow_up_on: str | None = Field(default=None, pattern=r"^(\d{4}-\d{2}-\d{2})?$")


class InterviewIn(BaseModel):
    at: str = Field(min_length=1, max_length=32)
    kind: str = Field(default="", max_length=80)
    notes: str = Field(default="", max_length=2000)


def _app_dict(a: Application) -> dict:
    out = _dict(a)
    out["interviews"] = [_dict(i) for i in a.interviews]
    return out


def _get_app(db: Session, app_id: int) -> Application:
    a = db.get(Application, app_id)
    if a is None:
        raise HTTPException(404, "Application not found")
    return a


@app.get("/applications", dependencies=[Depends(require_token)])
def list_applications(db: Session = Depends(get_db)) -> list[dict]:
    return [_app_dict(a) for a in db.scalars(select(Application).order_by(Application.id.desc())).all()]


@app.post("/applications", dependencies=[Depends(require_token)])
def create_application(payload: ApplicationIn, db: Session = Depends(get_db)) -> dict:
    if not payload.url.startswith("https://"):
        raise HTTPException(422, "URL must start with https://")
    p = _profile(db)
    dup = db.scalars(
        select(Application).where(
            Application.profile_id == p.id,
            or_(
                Application.url == payload.url,
                and_(
                    func.lower(Application.company) == payload.company.lower(),
                    func.lower(Application.title) == payload.title.lower(),
                ),
            ),
        )
    ).first()
    if dup is not None and dup.url == payload.url:
        raise HTTPException(409, "This exact listing is already tracked")
    if dup is not None and not payload.force:
        raise HTTPException(409, f"Already tracked: {dup.title} at {dup.company}")
    a = Application(profile_id=p.id, **payload.model_dump(exclude={"force"}))
    db.add(a)
    db.commit()
    db.refresh(a)
    return _app_dict(a)


@app.patch("/applications/{app_id}", dependencies=[Depends(require_token)])
def patch_application(app_id: int, payload: ApplicationPatch, db: Session = Depends(get_db)) -> dict:
    a = _get_app(db, app_id)
    for k, v in payload.model_dump(exclude_none=True).items():
        setattr(a, k, v)
    db.commit()
    return _app_dict(a)


@app.delete("/applications/{app_id}", dependencies=[Depends(require_token)])
def delete_application(app_id: int, db: Session = Depends(get_db)) -> dict:
    db.delete(_get_app(db, app_id))
    db.commit()
    return {"deleted": app_id}


@app.post("/applications/{app_id}/interviews", dependencies=[Depends(require_token)])
def add_interview(app_id: int, payload: InterviewIn, db: Session = Depends(get_db)) -> dict:
    a = _get_app(db, app_id)
    db.add(Interview(application_id=a.id, **payload.model_dump()))
    db.commit()
    db.refresh(a)
    return _app_dict(a)


@app.delete("/interviews/{interview_id}", dependencies=[Depends(require_token)])
def delete_interview(interview_id: int, db: Session = Depends(get_db)) -> dict:
    i = db.get(Interview, interview_id)
    if i is None:
        raise HTTPException(404, "Interview not found")
    db.delete(i)
    db.commit()
    return {"deleted": interview_id}


# ---------------------------------------------------------------- data export / deletion


@app.get("/export", dependencies=[Depends(require_token)])
def export_data(db: Session = Depends(get_db)) -> dict:
    return {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "profile": _full(_profile(db)),
        "applications": [_app_dict(a) for a in db.scalars(select(Application)).all()],
    }


@app.delete("/data", dependencies=[Depends(require_token)])
def delete_all_data(confirm: str = "", db: Session = Depends(get_db)) -> dict:
    if confirm != "DELETE":
        raise HTTPException(400, "Pass confirm=DELETE to delete all data")
    files = [d.stored_name for p in db.scalars(select(Profile)).all() for d in p.documents]
    apps = db.scalars(select(Application)).all()
    for a in apps:
        db.delete(a)
    for p in db.scalars(select(Profile)).all():
        db.delete(p)
    db.commit()
    for f in files:
        (config.UPLOAD_DIR / f).unlink(missing_ok=True)
    return {"deleted_applications": len(apps), "deleted_files": len(files)}
