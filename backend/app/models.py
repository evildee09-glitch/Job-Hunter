from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class Profile(Base):
    """Master profile: the single source of truth. Values start 'unverified' until the user confirms them."""

    __tablename__ = "profiles"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), default="")
    email: Mapped[str] = mapped_column(String(200), default="")
    phone: Mapped[str] = mapped_column(String(80), default="")
    location: Mapped[str] = mapped_column(String(200), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    verification: Mapped[str] = mapped_column(String(16), default="unverified")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    employment: Mapped[list["Employment"]] = relationship(cascade="all, delete-orphan", order_by="Employment.id")
    skills: Mapped[list["Skill"]] = relationship(cascade="all, delete-orphan", order_by="Skill.id")
    education: Mapped[list["Education"]] = relationship(cascade="all, delete-orphan", order_by="Education.id")
    certifications: Mapped[list["Certification"]] = relationship(cascade="all, delete-orphan", order_by="Certification.id")
    projects: Mapped[list["Project"]] = relationship(cascade="all, delete-orphan", order_by="Project.id")
    documents: Mapped[list["Document"]] = relationship(cascade="all, delete-orphan", order_by="Document.id")


class _ItemMixin:
    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    verification: Mapped[str] = mapped_column(String(16), default="unverified")
    source: Mapped[str] = mapped_column(String(16), default="user")  # user | import | ai
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class Employment(_ItemMixin, Base):
    __tablename__ = "employment"
    title: Mapped[str] = mapped_column(String(200), default="")
    company: Mapped[str] = mapped_column(String(200), default="")
    start: Mapped[str] = mapped_column(String(40), default="")
    end: Mapped[str] = mapped_column(String(40), default="")
    description: Mapped[str] = mapped_column(Text, default="")


class Skill(_ItemMixin, Base):
    __tablename__ = "skills"
    name: Mapped[str] = mapped_column(String(80), default="")
    level: Mapped[str] = mapped_column(String(20), default="")


class Education(_ItemMixin, Base):
    __tablename__ = "education"
    school: Mapped[str] = mapped_column(String(200), default="")
    degree: Mapped[str] = mapped_column(String(200), default="")
    years: Mapped[str] = mapped_column(String(40), default="")


class Certification(_ItemMixin, Base):
    __tablename__ = "certifications"
    name: Mapped[str] = mapped_column(String(200), default="")
    issuer: Mapped[str] = mapped_column(String(200), default="")
    year: Mapped[str] = mapped_column(String(10), default="")


class Project(_ItemMixin, Base):
    __tablename__ = "projects"
    name: Mapped[str] = mapped_column(String(200), default="")
    summary: Mapped[str] = mapped_column(Text, default="")


class Document(Base):
    __tablename__ = "documents"
    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), index=True)
    filename: Mapped[str] = mapped_column(String(200))
    stored_name: Mapped[str] = mapped_column(String(80), unique=True)
    kind: Mapped[str] = mapped_column(String(24), default="resume_import")
    size: Mapped[int] = mapped_column(Integer)
    sha256: Mapped[str] = mapped_column(String(64), index=True)
    extracted_text: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
