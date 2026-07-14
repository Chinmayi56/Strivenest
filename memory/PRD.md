# Strivenest Technologies — PRD

## Original Problem Statement
Implement admin login with role-based access so only admins can manage content. Build an admin dashboard to add/edit/delete projects, services, industries, and careers listings. Create a client portal with a contact/quote request form and store submissions in the database. Scaffold a separate Node/Express + MongoDB backend and connect it to both the client site and admin app. Add the remaining homepage blocks like Strivenest Guarantees, Our Process steps, and core team founder details with images. With animations.

## Architecture
- **Frontend**: React 19 (CRA + Tailwind) at `/app/frontend`, uses `REACT_APP_BACKEND_URL`
- **Backend (live)**: FastAPI at `/app/backend` on port 8001 (via supervisor + ingress)
- **Backend (portable scaffold)**: Node/Express + Mongoose at `/app/node-backend` (identical REST contract)
- **DB**: MongoDB (shared collections: users, projects, services, industries, jobs, contact_submissions)
- **Auth**: JWT (24h) + bcrypt, `Authorization: Bearer` via localStorage `sn_token`

## Implemented (Feb 2026)
- Public site pages: Home, About, Services, Projects, Careers, Contact
- Homepage sections: Hero, Services grid, Featured projects, Clients marquee, Our Process (9 steps), Strivenest Guarantees, Founders, CTA — all with framer-motion animations
- Contact / quote form → persists to `contact_submissions`
- Admin auth (`/admin/login`) with role check; seeded admin `admin@strivenest.com` / `strivenest@1234`
- Admin dashboard `/admin/*`: overview, CRUD for projects/services/industries/jobs, submission inbox
- Node/Express backend scaffold with identical `/api/*` contract

## Personas
- **Visitor**: browses services/projects/careers, submits quote request
- **Candidate**: filters jobs by category, applies via mailto
- **Admin**: manages content and reviews client submissions

## Backlog (P1/P2)
- Rich text editor for project/service descriptions
- Image upload to object storage for project thumbnails and founder photos
- Email notification on new contact submission (Resend)
- Public GET filters (pagination for projects/jobs)
- Multi-admin invites / password reset flow
- Analytics dashboard (visits, conversions)
