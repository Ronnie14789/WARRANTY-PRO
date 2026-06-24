# Warranty Claim Investigation Management System (WCIMS)

Enterprise web application for digitizing vehicle warranty claim investigations and auto-generating Claim Investigation Reports (CIR).

## Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind + React Hook Form + Zod + TanStack Query + Recharts
- **Backend:** Node.js + Express + TypeScript + JWT + RBAC
- **Database:** PostgreSQL + Prisma ORM
- **Storage:** Local in development, S3-compatible in production
- **Reporting:** PDFKit CIR generation endpoint
- **Infrastructure:** Docker + Docker Compose

## Folder Structure

```text
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── config
│   │   ├── middleware
│   │   ├── modules
│   │   │   ├── claims
│   │   │   ├── dashboard
│   │   │   ├── reports
│   │   │   └── users
│   │   ├── routes
│   │   └── utils
│   └── tests
├── frontend
│   └── src
│       ├── components
│       ├── pages
│       ├── lib
│       └── types
└── docker-compose.yml
```

## Implemented Core Features

### Roles & RBAC
- Driver/Customer: create claim
- Warranty Officer: review/update status/assign investigator
- Technical Investigator: record investigation and corrective actions
- Administrator: user management and full API access

### Claims Workflow
- Unique claim number generation (`WC-YYYY-######`)
- Vehicle + failure data capture
- Evidence upload endpoint (JPG/PNG/PDF/MP4)
- Status lifecycle:
  - Pending
  - Under Review
  - Additional Information Required
  - Approved
  - Rejected
  - Investigation In Progress
  - Investigation Completed
  - Closed

### Technical Investigation
- Inspection details
- Findings records
- Root cause category + explanation
- Corrective actions

### Reporting
- CIR PDF endpoint includes:
  1. Claim details
  2. Vehicle information
  3. Failed part information
  4. Incident description
  5. Inspection findings
  6. Root cause analysis
  7. Corrective actions
  8. Attachment listing
  9. Investigation conclusion
  10. Approval signature section

### Dashboard & Search
- Executive totals, trends, frequencies, and cost analysis endpoint
- Claim filter support:
  - claim number
  - registration
  - VIN
  - model
  - part number
  - date range
  - status
  - investigator

### Audit Trail & Soft Delete
- Audit log table with previous/new values
- `deletedAt` soft-delete columns across mutable entities

## Prisma Data Model

Normalized models and relationships are implemented for:
- Users
- Roles
- Claims
- Vehicles
- PartCatalog (failed parts)
- Investigations
- Findings
- CorrectiveActions
- Attachments
- AuditLogs
- Notifications
- Vehicle brands/models
- Warranty policies

See: `backend/prisma/schema.prisma`.

## API Overview

Base path: `/api/v1`

- `POST /auth/login`
- `GET /users`
- `POST /claims`
- `GET /claims`
- `GET /claims/:id`
- `PATCH /claims/:id/status`
- `POST /claims/:id/investigations`
- `POST /claims/:id/corrective-actions`
- `POST /claims/:id/attachments` (under `/api/v1` path in app)
- `GET /dashboard/executive`
- `GET /reports/claims/:id/cir.pdf`

## Frontend Pages

- Dashboard analytics
- New Claim Wizard
- Claims search/filter page
- Investigation entry page
- Sidebar enterprise layout
- Dark/Light mode toggle

## Local Setup

```bash
npm install --workspaces
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Run apps

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Docker Deployment

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- PostgreSQL: `localhost:5432`

## Test

```bash
npm run test --workspace backend
```
