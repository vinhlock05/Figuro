# Figuro - E-commerce for Custom Anime Figures

Monorepo with:
- `frontend/` React + Vite (SPA)
- `backend/` Node.js + Express + Prisma (API)
- `voice-agent/` FastAPI (Voice processing: STT/TTS/NLP)

## Quick start (Docker)

Prereqs: Docker + Docker Compose

```bash
cp backend/env.example backend/.env
docker compose up --build
```

URLs:
- Frontend: http://localhost:3000
- Backend (Express): http://localhost:3001
- Voice Agent (FastAPI): http://localhost:8000

## Local dev (without Docker)

Frontend:
```bash
cd frontend
npm install
npm run dev
```

Backend:
```bash
cd backend
npm install
cp env.example .env
# update DATABASE_URL, JWT_SECRET, etc.
npm run db:generate
npm run dev
```

Voice Agent:
```bash
cd voice-agent
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Configuration

Backend `.env` keys:
- `DATABASE_URL` (Postgres)
- `JWT_SECRET`
- `REDIS_URL` (optional)
- `FRONTEND_URL`
- `VOICE_AGENT_BASE_URL` (e.g., `http://voice-agent:8000` in Docker or your deployed URL)

Frontend `.env` (optional):
- `VITE_API_BASE_URL` (e.g., `http://localhost:3001`)

## CI/CD

GitHub Actions workflows:
- CI/CD: `.github/workflows/ci-cd.yml`
  - Frontend: lint/build + Docker image push to GHCR
  - Voice Agent: lint/test + Docker image push to GHCR
  - Backend API: Docker image push to GHCR
  - Optional deploys: Vercel (frontend), Render deploy hook (backend)
- CodeQL: `.github/workflows/codeql.yml`
- Dependabot: `.github/dependabot.yml`

Required repository secrets (Settings → Secrets and variables → Actions):
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (frontend deploy)
- `RENDER_DEPLOY_HOOK` (backend deploy hook)

GHCR requires no extra secret; workflow uses `GITHUB_TOKEN` with `packages: write` permission.

## Compose services

- `postgres`: Postgres 16 (dev)
- `redis`: Redis 7 (dev)
- `backend`: Express API, depends on Postgres/Redis
- `voice-agent`: FastAPI voice service
- `frontend`: Nginx serving built SPA, depends on API + voice-agent

## Notes

- Frontend should call backend only; backend proxies requests to voice-agent.
- Health endpoints: backend `/health`, voice-agent `/voice/health`.
