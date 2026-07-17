# PulseCheck

> **A client–coach wellness tracking platform.** Coaches monitor their clients' weekly health check-ins; clients track their own progress through data-driven metrics and streak analytics.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.9-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5%2F6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/JWT-Auth-F7B731?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

<p align="center">
  <a href="#">Live Demo</a> &nbsp;·&nbsp;
  <a href="#">GitHub Repository</a>
</p>

---

## Overview

PulseCheck is a full-stack wellness coaching platform that connects coaches with their clients through structured weekly data collection.

**The problem it solves:** Fitness and wellness coaches typically rely on manual spreadsheets, DMs, or check-in calls to track client progress. PulseCheck replaces this with a structured, self-service system where clients submit a weekly check-in (weight, sleep, energy, mood, workouts) and coaches get an aggregated view of every client's trends in one place.

**Who it is for:**
- **Fitness coaches and wellness practitioners** who manage multiple clients and need consolidated progress tracking.
- **Clients** who want an easy, structured way to log their weekly wellness data and view their own trends over time.

**Main workflow:**
1. A Coach signs up and receives a dashboard.
2. The Coach adds clients by email address.
3. Each Client receives access to their own check-in form.
4. Clients submit one check-in per calendar week (weight, sleep hours, energy score, mood score, workouts completed, optional notes).
5. Coaches view each client's full history, calculated metrics, and streak data.

---

## Features

### Authentication
- Email and password registration with role selection (`COACH` or `CLIENT`)
- JWT-based authentication stored in HTTP-only cookies (7-day expiry)
- Secure logout that clears the cookie server-side
- Password hashing with bcrypt

### Coach Features
- View a paginated list of all assigned clients
- See each client's last check-in date and check-in status (`checked` / `missing`)
- Add clients to your roster by email address
- View a detailed profile for each client including full check-in history and calculated metrics
- Search and filter the client list by name

### Client Features
- Submit a weekly health check-in with six data fields: weight, sleep hours (0–24), energy score (1–10), mood score (1–10), workouts completed, and optional notes (up to 2,000 characters)
- One check-in per calendar week enforced (duplicate submissions rejected with `409`)
- View full personal check-in history
- View calculated metrics: current weight, weight change from first check-in, current streak, best streak, total check-ins
- "Waiting for coach" state if a client logs in before being assigned to a coach

### Analytics
- Current and best weekly streak calculation based on Monday-aligned calendar weeks
- Weight change delta calculated from first vs. most recent check-in
- Visual charts via Recharts: line chart for weight trend, bar chart for weekly workouts
- Metric cards for at-a-glance stats

### Security
- Role-Based Access Control (RBAC): `COACH` and `CLIENT` routes are fully isolated
- Database-backed role verification on every protected request
- Helmet.js for HTTP security headers (Content-Security-Policy, X-Frame-Options, Referrer-Policy, hides `X-Powered-By`)
- Rate limiting: 20 auth attempts and 100 API requests per 15-minute window per IP
- UUID format validation on all route parameters
- JSON body size capped at 10 KB
- CORS restricted to the configured `CLIENT_URL`
- Server startup aborts if `JWT_SECRET` is missing or set to a placeholder
- Graceful shutdown: Prisma connection is cleanly closed on `SIGINT`/`SIGTERM`

### Developer Experience
- Strict TypeScript throughout (frontend `tsc` 5.x, backend `tsc` 6.x — 0 errors)
- ESLint with `eslint-config-next` — 0 warnings
- Layered architecture enforced: Routes → Controllers → Services → Prisma
- Recharts components lazy-loaded via `next/dynamic` with `ssr: false`
- `useMemo` used for expensive chart and metrics calculations
- Database indexes on `Client(coachId)`, `CheckIn(clientId)`, `CheckIn(weekDate)`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 16.2.9 (App Router, Turbopack) |
| **Frontend Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui (Radix UI primitives) |
| **Charts** | Recharts 3 |
| **HTTP Client** | Axios |
| **Backend Framework** | Express 5 |
| **Backend Language** | TypeScript 6 |
| **ORM** | Prisma 7 |
| **Database** | PostgreSQL (Neon serverless) |
| **Authentication** | JSON Web Tokens + bcrypt |
| **Security Middleware** | Helmet, express-rate-limit, cookie-parser |
| **Dev Server** | ts-node-dev |
| **Deployment — Frontend** | Vercel (recommended) |
| **Deployment — Backend** | Render (recommended) |
| **Deployment — Database** | Neon |

---

## Architecture

PulseCheck enforces a strict layered architecture to keep concerns separated and Prisma queries out of controllers and routes.

```
Request
  └── Route (authRoutes / coachRoutes / clientRoutes)
        └── Middleware (protect → requireRole → validateUuidParam)
              └── Controller (authController / coachController / clientController)
                    └── Service (authService / coachService / clientService)
                          └── Prisma Client → PostgreSQL
```

- **Routes** register endpoints and compose middleware chains. No business logic.
- **Middleware** handles JWT verification (`protect`), database-backed role checks (`requireRole`), and UUID format validation (`validateUuidParam`). No Prisma queries in routes.
- **Controllers** parse request/response and delegate to services. No Prisma queries in controllers.
- **Services** contain all business logic and are the only layer that calls Prisma.

### Folder Structure

```
pulsecheck/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # User, Client, CheckIn, Alert models
│   └── src/
│       ├── app.ts                 # Express app, middleware, route mounting
│       ├── server.ts              # Startup guards, port, graceful shutdown
│       ├── config/
│       │   └── prisma.ts          # Prisma client singleton
│       ├── controllers/
│       │   ├── authController.ts
│       │   ├── coachController.ts
│       │   └── clientController.ts
│       ├── middleware/
│       │   ├── authMiddleware.ts  # JWT protect()
│       │   ├── roleMiddleware.ts  # requireRole("COACH"|"CLIENT")
│       │   ├── rateLimiter.ts     # apiLimiter + authLimiter
│       │   └── uuidMiddleware.ts  # validateUuidParam()
│       ├── routes/
│       │   ├── authRoutes.ts
│       │   ├── coachRoutes.ts
│       │   └── clientRoutes.ts
│       ├── services/
│       │   ├── authService.ts
│       │   ├── coachService.ts
│       │   ├── clientService.ts
│       │   └── tokenService.ts
│       └── utils/
└── frontend/
    ├── app/
    │   ├── page.tsx               # Landing page
    │   ├── layout.tsx             # Root layout, skip-link accessibility
    │   ├── login/
    │   ├── signup/
    │   ├── dashboard/             # Role-based redirect after login
    │   ├── coach/
    │   │   ├── dashboard/         # Client list, search, add client
    │   │   └── client/[clientId]/ # Individual client profile + charts
    │   └── client/
    │       ├── check-in/          # Weekly check-in form
    │       └── progress/          # Personal metrics + charts
    ├── components/
    │   └── ui/
    │       ├── app-header.tsx
    │       ├── metric-card.tsx
    │       ├── button.tsx, card.tsx, input.tsx, label.tsx
    │       ├── slider.tsx, tabs.tsx, select.tsx, skeleton.tsx
    └── lib/
        ├── api.ts                 # Axios instance with NEXT_PUBLIC_API_URL
        ├── auth.ts                # loginUser, registerUser, logoutUser, getCurrentUser
        ├── client.ts              # submitCheckIn, getCheckIns, getClientMetrics, etc.
        └── types.ts
```

---

## Screenshots

> Screenshots coming soon. Run the project locally to see the UI.

| Page | Description |
|---|---|
| **Landing Page** | Marketing page with feature overview, coach workflow, and client workflow sections |
| **Sign Up** | Role-selection tabs (Coach / Client), password strength meter, form validation |
| **Login** | Email + password form with show/hide password toggle |
| **Coach Dashboard** | Client roster table with status indicators, search, and Add Client modal |
| **Client Profile** | Individual client view with weight trend line chart, workout bar chart, and metrics |
| **Client Check-In** | Guided weekly form with sliders for scores and numeric inputs |
| **Client Progress** | Personal progress view with charts, streak display, and check-in history |

---

## Installation

### Prerequisites

- Node.js 18+
- A PostgreSQL database (local or [Neon](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/your-username/pulsecheck.git
cd pulsecheck
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env
# Edit .env and fill in your values (see Environment Variables section)

# Push the Prisma schema to your database
npx prisma db push

# Generate the Prisma client
npx prisma generate

# Start the development server
npm run dev
```

The backend runs on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy the environment template
cp .env.example .env.local
# Edit .env.local and fill in your values

# Start the development server
npm run dev
```

The frontend runs on `http://localhost:3000`.

### 4. Production Build

```bash
# Backend
cd backend && npm run build && npm start

# Frontend
cd frontend && npm run build && npm start
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | ✅ | 256-bit random secret for signing JWTs. Server will refuse to start if missing or set to a placeholder. | `generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `PORT` | ❌ | Port the Express server listens on | `5000` |
| `CLIENT_URL` | ❌ | Frontend origin for CORS validation | `http://localhost:3000` |
| `NODE_ENV` | ❌ | `development` or `production`. Enables `Secure` cookie flag in production. | `development` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ❌ | Express backend base URL. Defaults to `http://localhost:5000/api` if not set. | `https://api.yourdomain.com/api` |

> **Security note:** Never commit `.env` or `.env.local` to version control. Both files are included in `.gitignore`. Rotate your `JWT_SECRET` and `DATABASE_URL` credentials before deploying to production.

---

## API Overview

All endpoints are prefixed with `/api`.

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | None | Register a new `COACH` or `CLIENT` user. Rate limited to 20 req / 15 min. |
| `POST` | `/auth/login` | None | Log in and receive a JWT in an HTTP-only cookie. Rate limited to 20 req / 15 min. |
| `GET` | `/auth/me` | JWT | Return the currently authenticated user's id, name, email, and role. |
| `POST` | `/auth/logout` | None | Clear the JWT cookie. |

### Coach — `/api/coach`

All coach endpoints require a valid JWT cookie **and** the authenticated user's role must be `COACH`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/coach/clients` | JWT + COACH | List all clients assigned to the authenticated coach. |
| `POST` | `/coach/clients` | JWT + COACH | Add a client to the coach's roster by email address. |
| `GET` | `/coach/clients/:clientId` | JWT + COACH | Retrieve a specific client's profile, full check-in history (last 52), and calculated metrics. UUID format validation applied to `:clientId`. |

### Client — `/api/client`

All client endpoints require a valid JWT cookie **and** the authenticated user's role must be `CLIENT`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/client/check-in` | JWT + CLIENT | Submit a weekly check-in. Returns `409` if the client has already submitted this calendar week. Returns `400` for out-of-range field values. |
| `GET` | `/client/check-ins` | JWT + CLIENT | Retrieve the client's check-in history (most recent 52 weeks, newest first). |
| `GET` | `/client/current-week` | JWT + CLIENT | Check whether the client has submitted a check-in for the current calendar week. |
| `GET` | `/client/metrics` | JWT + CLIENT | Return calculated metrics: current weight, weight change, current streak, best streak, total check-ins. |

---

## Security

| Measure | Implementation |
|---|---|
| **JWT Authentication** | Signed JWTs stored in `httpOnly`, `sameSite: strict` cookies. The `Secure` flag is set automatically in production. |
| **Role-Based Access Control** | `requireRole("COACH")` and `requireRole("CLIENT")` middleware perform a live database lookup on every protected request. A client cannot access any `/api/coach/*` route, and a coach cannot access any `/api/client/*` route. |
| **Security Headers** | Helmet sets `Content-Security-Policy`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and removes the `X-Powered-By` header. |
| **Rate Limiting** | Auth endpoints: 20 requests per 15 minutes per IP. All other API endpoints: 100 requests per 15 minutes per IP. CORS is applied before the rate limiter so that `429` responses still carry the correct `Access-Control-Allow-Origin` header. |
| **Input Validation** | Check-in fields are validated by type, range, and integer constraints in the service layer before reaching the database. |
| **UUID Validation** | Route parameters expected to be UUIDs are validated against a strict regex before the controller is called. Malformed IDs return `400`. |
| **Duplicate Check-In Prevention** | A check-in for the same Monday-aligned calendar week is rejected with `409 Conflict`. |
| **Request Body Size Limit** | `express.json({ limit: "10kb" })` prevents large-payload abuse. |
| **Startup Guard** | The server refuses to start if `JWT_SECRET` is empty or set to a known placeholder value. |
| **CORS** | Requests are only accepted from the origin defined in `CLIENT_URL`. CORS origin is evaluated per-request. |

---

## Testing

PulseCheck was validated through an automated integration test suite run against the live Express server and Neon PostgreSQL database.

**53 / 53 integration tests passed.**

The test suite covers:

| Category | Tests |
|---|---|
| Backend health | Server responds on port 5000 |
| Registration | Coach and Client registration; duplicate email rejection |
| Authentication | Login with correct credentials; login with wrong password; JWT cookie set; GET /me |
| Role guards | Client blocked from coach routes (403); Coach blocked from client routes (403); Unauthenticated requests blocked (401) |
| Coach flows | Empty client list; add client; duplicate add rejection; client list count; client profile retrieval; UUID validation |
| Client flows | Week status before submission; bad check-in data validation; valid check-in submission (weight, energy, notes); duplicate same-week check-in rejection (409); check-in history; week status after submission; metrics |
| Coach post check-in | Updated client profile reflecting submitted check-in data and recalculated metrics |
| Logout | Coach and client logout; post-logout access blocked (401) |

**Static analysis:**
- Backend TypeScript: `tsc --noEmit` — 0 errors
- Frontend TypeScript: `tsc --noEmit` — 0 errors
- ESLint: `eslint . --ext .ts,.tsx` — 0 errors, 0 warnings
- Frontend production build: `next build` — all 9 routes compiled successfully

> **Note:** No automated unit tests or end-to-end browser tests (Playwright/Cypress) are currently in place. This is listed as a future improvement.

---

## Deployment

### Frontend → Vercel

1. Push the `frontend/` directory (or root monorepo) to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Set the root directory to `frontend/` if deploying the monorepo.
4. Add the environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```
5. Deploy.

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
3. Add the following environment variables in the Render dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A secure 256-bit random string |
| `CLIENT_URL` | Your Vercel frontend URL |
| `NODE_ENV` | `production` |
| `PORT` | (Render sets this automatically — leave unset) |

### Database → Neon

1. Create a project at [Neon](https://neon.tech).
2. Copy the connection string and set it as `DATABASE_URL` in your backend environment.
3. Run `npx prisma db push` to apply the schema (this also creates the indexes defined in `schema.prisma`).

---

## Coming Soon

The following enhancements are not yet implemented but represent natural next steps for the project:

- **Coach notes** — Allow coaches to leave session notes on individual client profiles.
- **Email reminders** — Automated email notifications when a client has not submitted a check-in for the current week.
- **In-app alerts** — Alert system using the existing `Alert` Prisma model (schema already in place).
- **Automated unit and E2E tests** — Jest for unit tests; Playwright or Cypress for browser-based E2E tests.
- **Dark mode** — Theme toggle using CSS variables (Tailwind 4 supports this natively).
- **PDF export** — Allow clients or coaches to export a progress report as a PDF.
- **PWA support** — Offline capability and installability via a Next.js service worker.
- **AI summaries** — Weekly or monthly plain-language summaries of client trends using an LLM.
- **Multi-coach support** — Allow a client to be associated with more than one coach.

---

## Contributing

Contributions are welcome. Please follow the steps below to get started.

1. Fork the repository.
2. Create a new branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes. Follow the existing code style and layer architecture.
   - **No Prisma queries in routes or controllers.** All database access belongs in the service layer.
   - **No `any` types.** Use proper TypeScript interfaces.
   - Ensure `tsc --noEmit` passes for both `frontend/` and `backend/`.
   - Ensure `eslint` passes for the frontend.
4. Commit using a descriptive message:
   ```bash
   git commit -m "feat: add coach notes to client profile"
   ```
5. Push your branch and open a Pull Request against `main`.
6. Describe what you changed and why in the PR description.

### Reporting Bugs

Open a GitHub Issue with:
- A clear description of the bug.
- Steps to reproduce.
- Expected vs. actual behavior.
- The relevant endpoint or page, if applicable.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

## Author

Built by **Niraj Sonawane**

- GitHub: https://github.com/niraj-sonawane
- LinkedIn: https://linkedin.com/in/nirajsonawane

