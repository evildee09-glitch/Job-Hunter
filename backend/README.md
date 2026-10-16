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

## Deploying on Render (important)

**Free web services have an ephemeral filesystem and spin down after 15 minutes idle. Anything written to disk
(a SQLite file, uploaded resumes) is lost on every restart, redeploy, or spin-down.** To keep your data:

1. Create a **Render Postgres** database and copy its *Internal Database URL*.
2. On your web service set environment variables: `DATABASE_URL` = that URL, `API_TOKEN` = your token.
3. Build command: `pip install -r requirements.txt`
4. Start command: `alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Commit the `migrations/versions/*.py` files to Git so Render can apply them.

The app converts Render's `postgres://` URL to the psycopg driver automatically. A free web service also needs
about 30-60 seconds to wake up on the first request after idle; the app waits up to 60 seconds.
Check Render's current docs for how long free Postgres databases are kept before relying on one.

### Adding the applications tables (this update)

Run these once on your laptop (SQLite), then commit and push the new migration file:

```powershell
alembic upgrade head
alembic revision --autogenerate -m "applications and interviews"
```
