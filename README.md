# Mini ERP + CRM Operations Portal

A small internal ERP/CRM system for a wholesale/distribution company: customer
CRM, product & inventory management, and a sales challan flow with atomic
stock deduction.

## Tech Stack

**Backend:** Node.js, TypeScript, Express, PostgreSQL, Prisma ORM, Zod validation, JWT auth
**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios

## Architecture

```
erp-crm/
├── backend/
│   ├── prisma/schema.prisma   # DB schema (users, customers, products, challans...)
│   ├── prisma/seed.ts         # Seeds one user per role + sample products/customer
│   └── src/
│       ├── modules/           # One folder per domain: auth, customers, products, challans
│       │   └── <module>/      #   *.routes.ts, *.controller.ts, *.validation.ts
│       ├── middleware/        # auth (JWT), role guard, zod validation, error handler
│       ├── lib/prisma.ts      # Shared Prisma client
│       └── app.ts / server.ts
└── frontend/
    └── src/
        ├── api/client.ts      # Axios instance, attaches JWT, handles 401
        ├── context/AuthContext.tsx
        ├── components/        # Layout, ProtectedRoute
        └── pages/              # Login, Customers, Products, Challans
```

Each backend module follows the same pattern: **routes → validation (zod) →
controller (business logic + Prisma) → error middleware**. Role checks are
applied per-route via `requireRole(...)`.

### Key business logic

- **Stock deduction is atomic.** Confirming a challan runs inside a single
  Prisma `$transaction`: every line item is re-checked against current stock,
  and if any line is short, the entire confirmation is rolled back — nothing
  is partially deducted.
- **Challans store a product snapshot** (`productNameSnapshot`, `skuSnapshot`,
  `unitPriceSnapshot`) captured at confirm-time, so later edits to a product
  (price change, rename) don't rewrite historical challan records.
- **Challan numbers** are generated from a single-row counter table
  (`ChallanCounter`), incremented inside the same transaction as challan
  creation, so concurrent requests can't collide on the same number.
- **Stock never goes negative** — both the challan-confirm flow and the
  manual stock-movement endpoint validate `currentStock` before writing.

## Roles

| Role | Can do |
|---|---|
| ADMIN | Everything, including creating other user accounts |
| SALES | Manage customers, create/confirm/cancel challans |
| WAREHOUSE | Manage products, stock movements, confirm challans |
| ACCOUNTS | Read-only across the system (view-only by default) |

## Local Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (local, or a free hosted instance — Neon/Supabase/Render Postgres all work)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env — set DATABASE_URL to your Postgres connection string,
# and JWT_SECRET to any long random string

npm install
npx prisma migrate dev --name init   # creates tables
npm run seed                         # creates one test user per role + sample data
npm run dev                          # starts API on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL should point at the backend, e.g. http://localhost:4000/api

npm install
npm run dev     # starts on http://localhost:5173
```

### Test Login Credentials (created by the seed script)

All passwords: `Password123!`

| Role | Email |
|---|---|
| Admin | admin@example.com |
| Sales | sales@example.com |
| Warehouse | warehouse@example.com |
| Accounts | accounts@example.com |

## Environment Variables

**Backend (`backend/.env`)**
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — signing secret for JWTs
- `JWT_EXPIRES_IN` — token lifetime (default `8h`)
- `PORT` — API port (default `4000`)
- `CORS_ORIGIN` — allowed frontend origin

**Frontend (`frontend/.env`)**
- `VITE_API_URL` — base URL of the backend API

## Deployment (free-tier options)

- **Database:** Neon, Supabase, or Render Postgres (free tier)
- **Backend:** Render or Railway — set the env vars above, build command
  `npm install && npx prisma generate && npm run build`, start command
  `npm run prisma:deploy && npm start`
- **Frontend:** Vercel or Netlify — set `VITE_API_URL` to the deployed
  backend URL, build command `npm run build`, output dir `dist`

AWS deployment was treated as the bonus/optional path per the assignment
brief and was not pursued in favor of getting the core flows fully working
within the time box; the same containers/build artifacts would deploy to
AWS (ECS/Elastic Beanstalk + RDS) with the same env vars.

## API Overview

Base path: `/api`

| Method | Route | Notes |
|---|---|---|
| POST | `/auth/login` | Returns JWT + user |
| POST | `/auth/register` | Admin-only, creates a user |
| GET | `/auth/me` | Current user |
| GET/POST | `/customers` | List (search/filter/paginate) & create |
| GET/PATCH | `/customers/:id` | Detail & update |
| POST | `/customers/:id/follow-ups` | Add a follow-up note |
| GET/POST | `/products` | List (search/filter/paginate) & create |
| GET/PATCH | `/products/:id` | Detail & update |
| POST | `/products/:id/stock-movements` | Manual IN/OUT adjustment |
| GET/POST | `/challans` | List (filter/paginate) & create as Draft |
| GET | `/challans/:id` | Detail incl. line items |
| POST | `/challans/:id/confirm` | Validates & deducts stock atomically |
| POST | `/challans/:id/cancel` | Cancels a Draft challan |

Full request/response examples are in `postman_collection.json`.

## Known Limitations / Not Yet Implemented

- ACCOUNTS role currently has read access only; no dedicated invoice/accounts
  module has been built yet (customers/products/challans read is available
  to it via the same endpoints).
- No PDF export, S3 image upload, or Docker/CI setup (listed as bonus items
  in the brief) — these are natural next additions given more time.
- Frontend pagination controls aren't wired up in the UI yet (the API
  supports `page`/`pageSize`, first page is shown).
- No automated test suite yet.

## Assumptions Made

- "Accounts" role is treated as read-only across modules for this version,
  since the brief didn't specify Accounts-specific write actions beyond
  invoices (out of scope for this pass).
- Challan cancellation is only allowed while still in Draft — a Confirmed
  challan is assumed to require an explicit stock-return flow rather than a
  silent cancel, to avoid quietly undoing a stock deduction.
