# Strivenest Node/Express Backend (Scaffold)

Standalone Node.js + Express + MongoDB backend that mirrors the FastAPI API. Both the public client site and the admin app talk to the same REST contract (`/api/*`).

## Quick start
```bash
cd node-backend
cp .env.example .env      # adjust secrets
npm install
npm start                 # or: npm run dev
```

Server listens on `PORT=4000` by default and exposes the same endpoints as the FastAPI backend:

- `POST /api/auth/login` → `{ token, user }`
- `GET  /api/auth/me` (Bearer)
- `GET/POST/PUT/DELETE /api/projects`
- `GET/POST/PUT/DELETE /api/services`
- `GET/POST/PUT/DELETE /api/industries`
- `GET/POST/PUT/DELETE /api/jobs`
- `POST /api/contact`, `GET/DELETE /api/contact/:id` (admin for the last two)

## Point the frontend at this backend
Set `REACT_APP_BACKEND_URL` to the host serving Node (e.g. behind a reverse proxy), and start the React app.

## Note about this environment
Inside the Emergent container, supervisor runs the FastAPI backend on port 8001 (mapped to `/api` by the ingress). This Node/Express implementation is delivered as a **portable, standalone alternative** you can host anywhere (Render, Fly, EC2, Docker, etc.). Both stacks share the same MongoDB collections/schema, so you can switch between them with zero code changes on the frontend.
