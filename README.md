# Render Test

A tiny static "Hello World" frontend plus a minimal .NET backend, used to test deploying a full front/backend stack on [Render](https://render.com).

## Frontend (`/`)

Plain HTML/CSS/JS, no build step.

Features:
- Animated gradient title with a waving emoji
- Floating canvas particle doodles in the background
- A "mood" button that generates a random doodle mood
- A small click counter
- A live clock
- A backend status indicator that pings the .NET API's `/health` endpoint

### Local preview

```bash
npx serve .
```

## Backend (`/backend`)

Minimal ASP.NET Core (.NET 9) Web API, containerized with the included `Dockerfile`.

Endpoints:
- `GET /` – hello message
- `GET /health` – health check
- `GET /api/hello?name=...` – greeting with timestamp

### Local run

```bash
cd backend
dotnet run
```

### Local Docker build

```bash
cd backend
docker build -t render-test-backend .
docker run -p 8080:8080 render-test-backend
```

## Deploying on Render

This repo includes a [`render.yaml`](./render.yaml) blueprint that defines both services:

- **render-test-frontend** – static site, publish directory `.`
- **render-test-backend** – Docker web service built from `backend/Dockerfile`

In the Render dashboard, use **New > Blueprint**, point it at this repo, and both services will be created together. After the backend deploys, update `API_BASE` in `script.js` with its actual `.onrender.com` URL (or set up a custom domain) and push again.
