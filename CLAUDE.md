# Zen-gineering - Claude Code Instructions

## Tech Stack
- **Backend**: NestJS + TypeScript + Prisma v6 + PostgreSQL
- **Frontend**: React 19 + Vite 7 + MUI v7 + TypeScript
- **Workflow**: Custom lightweight state-machine engine (replaced Camunda BPM)
- **Docker**: PostgreSQL, MinIO (files), MailHog (SMTP test)
- **Deployment**: Docker images → Synology NAS via TAR

## Key Rules
- **Prisma v6 only** (not v7): Prisma v7 has breaking ESM/CJS incompatibilities with NestJS. Stick with v6 + `prisma-client-js` generator.
- **Module resolution**: NestJS uses `nodenext`. All local imports need `.js` extension.
- **No extra dependencies** unless absolutely necessary.
- **Language**: User communicates in French, code and comments in English.

## Project Structure
```
├── backend/                    # NestJS API (port 3000)
│   ├── prisma/schema.prisma   # Database models
│   ├── prisma/seed.ts         # Sample data (3 users, 1 project, 3 workflow templates)
│   └── src/modules/           # 19 modules
│       ├── auth/              # JWT authentication
│       ├── projects/          # Projects + members + partners + vendors
│       ├── equipment/         # Equipment list (paginated, filterable)
│       ├── workflows/         # State-machine engine + auto-assignment from org chart
│       ├── discussions/       # Threaded discussions with comments
│       ├── change-requests/   # Equipment change requests → workflow
│       ├── documents/         # File upload/download (MinIO)
│       ├── document-register/ # Document register (discipline, status, revision)
│       ├── transmittals/      # Document transmittals (vendor/partner/client)
│       ├── incoming-emails/   # IMAP polling + routing + classification + reply
│       ├── mail/              # Outgoing SMTP (MailHog dev, real prod)
│       ├── search/            # Global multi-entity search + saved searches
│       ├── contract-items/    # Contract requirements + change log + Excel import
│       ├── data-origin/       # AGO (Approved & Guaranteed Origin) traceability
│       ├── organization/      # Org chart + project tree (from Excel reference)
│       ├── dashboard/         # Project/user/equipment/document/workflow stats
│       ├── notifications/     # SSE real-time notifications (@Global)
│       ├── audit/             # Audit trail logging (@Global)
│       ├── export/            # CSV export (6 entity types)
│       └── storage/           # MinIO S3-compatible storage
├── frontend/                   # React SPA (port 3001, proxy → 3000)
│   ├── src/api/               # Typed Axios API clients (one per module)
│   ├── src/pages/             # 22 pages
│   ├── src/components/        # Layout, ExportExcelButton, FileUpload, etc.
│   └── src/auth/              # AuthContext + ProjectContext + ProtectedRoute
├── portfolio/                  # Static demo website (port 8081)
├── docker-compose.yml          # Dev environment
├── docker-compose.nas.yml      # NAS production deployment
└── CLAUDE.md                   # This file
```

## Running Locally
```bash
# 1. Start Docker services
docker compose up -d postgres

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # → http://localhost:3000 (Swagger: /api/docs)

# 3. Frontend
cd frontend
npm install
npm run dev                # → http://localhost:3001
```

## Building for NAS
```bash
# Build Docker images
cd backend && docker build -t pascal1010/zengineering-backend:latest .
cd frontend && docker build -t pascal1010/zengineering-frontend:latest --build-arg VITE_API_URL="" .

# Create TAR
docker save pascal1010/zengineering-backend:latest pascal1010/zengineering-frontend:latest | gzip > zengineering-vX.X-nas.tar.gz

# On NAS
docker load < zengineering-vX.X-nas.tar.gz
docker compose -f docker-compose.nas.yml up -d
```

## Demo Credentials
- admin@zen.io / admin123 (Admin)
- marie@zen.io / password123
- jean@zen.io / password123

## Git Conventions
- Commit message format: `feat: V{X.Y} - {description}`
- Tag format: `v{X.Y}`
- Always push with `--tags`
