# Talent Engine

Transform applications into actionable talent insights. Applications -> qualification -> score /100 -> ranking -> prioritization.

## Structure
- `server/` Node.js + Express + MongoDB (Mongoose), JWT, bcrypt, Multer
- `client/` HTML5 + CSS3 + vanilla JavaScript (Fetch API), no framework

## Setup
1. `cd server && cp .env.example .env` (Windows: `copy`), then fill in:
   `MONGO_URI`, `JWT_SECRET` (long random string), `RECRUITER_ACCESS_CODE` (private code required to register), `CLIENT_URL=http://localhost:5173`
2. `npm install`, `npm run seed` (16 fictional demo candidates + 2 demo users), `npm run dev` (API on :5000)
3. In another terminal: `cd client && npx serve . -l 5173`, then open http://localhost:5173

## Demo accounts (change or delete before any public demo)
- recruiter@talentengine.demo / Demo1234!
- admin@talentengine.demo / Demo1234!

## Scoring (100 pts)
Experience 25, Skills 30, Education 15, Languages 10, Availability 10, Profile completeness 10.
Categories: 80-100 Priority, 60-79 Recommended, 40-59 To Review, 0-39 Low Match.
Test: `cd server && npm run test:score`

## Pages
`index.html` landing, `apply.html` application, `login.html` / `register.html`, `dashboard.html` ranking + stats + filters, `candidate.html?id=...` candidate detail with "Why this candidate?".

## Current limits
No automated end-to-end tests; demo candidates have no real CV file; access-code rate limit is in memory; JWT stored in localStorage (use httpOnly cookies in production); `candidates.html`/Settings pages not built.
