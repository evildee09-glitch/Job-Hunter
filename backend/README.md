# AI Job Hunter backend (Stage 2)

Single-user FastAPI service: master profile database + resume import. SQLite by default.

## First run (Windows PowerShell, from this `backend` folder)

```powershell
py -3.11 -m venv .venv          # Python 3.11 or newer
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env          # then edit .env and set API_TOKEN to a long random value
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --env-file .env
```

Open http://localhost:8000/docs to see the API. `--host 0.0.0.0` lets your phone reach it over Wi-Fi;
only do this on a network you trust, and allow Python through Windows Firewall for Private networks only.
Find your laptop's IP with `ipconfig` (use that, not "localhost", in the phone app).

## Tests

```powershell
python -m unittest discover -s tests -v
```

## What this stage does NOT do yet

No multi-user accounts or login screens (one shared API token), no rate limiting, no HTTPS, no OCR for
scanned PDFs, no AI extraction. Imported data is heuristic and always starts as "unverified".
