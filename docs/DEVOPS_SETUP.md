## DevOps: Full CI/CD and Docker setup

### 1) Docker (local/dev)
- Build and run with Compose:
```bash
docker compose up --build
```
- Services:
  - Frontend: http://localhost:3000
  - Voice Agent API: http://localhost:8000

### 2) Container images (production)
- Frontend: multi-stage Node build + Nginx serve
- Backend: Python slim + audio deps, served by Uvicorn

### 3) CI (GitHub Actions)
- Workflow: `.github/workflows/ci-cd.yml`
- On PRs/Push to `main`:
  - Frontend: install, lint, build, artifact
  - Backend: install, lint (flake8/black/mypy), pytest (optional), docker build, push to GHCR (on push)
  - Optional deploy: Vercel (frontend), Render hook (backend)

### 4) Required secrets
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (frontend deploy)
- `RENDER_DEPLOY_HOOK` (backend deploy)
- `GITHUB_TOKEN` (default) or `GHCR_TOKEN` with packages:write

### 5) Security & maintenance
- CodeQL workflow: `.github/workflows/codeql.yml`
- Dependabot: `.github/dependabot.yml`

### 6) Production deploy alternatives
- Fly.io: replace deploy step with `flyctl deploy` using `FLY_API_TOKEN`
- Docker host/VM: pull images from GHCR and run with Compose/Swarm

### 7) Makefile (optional)
Add simple targets for local dev and CI convenience.


