# Zen-gineering — V3.4

**Application collaborative de gestion de projets industriels**

## Description

Zen-gineering est une application web déployée en production permettant de gérer des projets d'ingénierie industrielle (usines chimiques, UIOM, etc.) avec un circuit documentaire complet, un système d'emails intégré et un suivi technique détaillé par équipement.

## Accès en production

| Service | URL |
|---------|-----|
| **Application (Frontend)** | https://zengineering-app.netlify.app |
| **API Backend** | https://backend-production-dfa4.up.railway.app |
| **Swagger / Docs API** | https://backend-production-dfa4.up.railway.app/api/docs |

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@zengineering.local | Password123! |
| Chef de Projet | chef.projet@zengineering.local | Password123! |
| Ingénieur | ingenieur@zengineering.local | Password123! |

---

## Fonctionnalités v3.4

### Gestion des utilisateurs et projets
- Authentification JWT sécurisée avec rôles et permissions
- Sélection de projet après login
- Sélecteur de version (V3 classique / V4.1 IA)
- Profils métiers : Chef de projet, Process, Électricien, Instrumentiste, Achat...

### Modules techniques (Equipment)
- Liste d'équipements avec tag numbers et caractéristiques (pression, température, matériaux)
- Catégories : Vessel, Heat Exchanger, Rotating Machine, Miscellaneous
- **Connexions** entre équipements (pipelines, instrumentation)
- **Pièces de rechange** (Spare Parts) par équipement
- **Inspections** planifiées et historique
- **Maintenance** préventive et corrective
- Export Excel de toutes les listes

### Circuit documentaire
- Registre documentaire officiel avec révisions et statuts
- Upload de fichiers (stockage MinIO / S3)
- Transmittals — envoi formel de documents aux vendeurs/clients
- Workflows de validation multi-disciplines (Lead → Chef de projet → Manager)

### Système email
- Réception automatique IMAP (polling Outlook)
- Routage par email de projet (alias outlook par projet)
- Classification automatique (Query, Information, Document Submission...)
- Envoi de transmittals par SMTP

### Suivi projet
- Dashboard avec indicateurs clés
- Discussions techniques liées aux équipements
- Tâches assignées par workflow
- Demandes de modification (Change Requests)
- Exigences contractuelles + journal des modifications
- Traçabilité AGO (Approved & Guaranteed Origin)
- Organigramme + arborescence projet
- Audit trail complet
- Recherche globale multi-entités

---

## Architecture technique

```
┌──────────────────────────────────────────────────────────────┐
│                     PRODUCTION                               │
│                                                              │
│  Netlify (Frontend)              Railway (Backend)           │
│  ─────────────────                ──────────────────         │
│  React + MUI v7                  NestJS + Prisma             │
│  Vite 7                          PostgreSQL                  │
│  zengineering-app.netlify.app    backend-production-dfa4     │
│                                  .up.railway.app             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  DÉVELOPPEMENT LOCAL                         │
│                                                              │
│  Frontend http://localhost:3001   Backend http://localhost:3000│
│  Docker : PostgreSQL (5432)                                  │
│           MinIO (9000 / console 9001)                        │
│           MailHog (1025 / UI 8025)                           │
└──────────────────────────────────────────────────────────────┘
```

### Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, MUI v7, Vite 7, React Router v6 |
| Backend | NestJS, TypeScript, Prisma ORM |
| Base de données | PostgreSQL 15 |
| Stockage fichiers | MinIO (S3-compatible) |
| Auth | JWT (access + refresh tokens) |
| Email | IMAP polling (Nodemailer) + SMTP |
| Déploiement backend | Railway (Docker) |
| Déploiement frontend | Netlify |

### Modules backend (23 modules, ~130 routes API)

| Module | Routes | Description |
|--------|--------|-------------|
| Auth | 4 | JWT login/register/refresh |
| Projects | 10 | Projets, membres, partenaires, vendeurs |
| Equipment | 7 | Équipements avec filtres et pagination |
| Connections | 5 | Connexions entre équipements |
| Spare Parts | 5 | Pièces de rechange |
| Inspections | 5 | Inspections planifiées |
| Maintenance | 5 | Maintenance préventive/corrective |
| Workflows | 9 | Moteur de workflow (state machine) |
| Change Requests | 3 | Demandes de modification |
| Discussions | 7 | Forum technique + commentaires |
| Documents | 7 | Upload/download (MinIO) |
| Document Register | 5 | Registre documentaire |
| Transmittals | 6 | Envoi formel de documents |
| Incoming Emails | 9 | IMAP + classification IA |
| Mail | interne | SMTP sortant |
| Search | 6 | Recherche globale |
| Contract Items | 6 | Exigences contractuelles |
| Data Origin | 7 | Traçabilité AGO |
| Organization | 8 | Organigramme + arborescence |
| Dashboard | 5 | Statistiques projet |
| Notifications | 1 | Alertes SSE temps réel |
| Audit | 3 | Journal d'audit |
| Export | 6 | Export CSV/Excel |
| Storage | interne | MinIO S3 |

---

## Structure du projet

```
Zen-gineering/
├── backend/                  # API NestJS
│   ├── src/modules/          # 23 modules métier
│   ├── prisma/               # Schéma + migrations + seed
│   └── Dockerfile            # Image Railway
├── frontend/                 # Application React
│   ├── src/pages/            # 20+ pages
│   ├── src/components/       # Layout, composants partagés
│   ├── src/api/              # Clients API typés
│   ├── .env.production       # URLs production (Vite bake-in)
│   └── netlify.toml          # Config Netlify
├── docs/                     # Documentation technique
├── portfolio/                # Site portfolio
├── GUIDE-UTILISATEUR.md      # Guide complet utilisateur
├── DEPLOY-RAILWAY.md         # Guide déploiement Railway
└── DEMO-GUIDE.md             # Scénario de démonstration
```

---

## Lancement en développement

```bash
# 1. Base de données et services
docker compose up -d postgres minio

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev          # http://localhost:3000

# 3. Frontend (nouveau terminal)
cd frontend
npm install
npm run dev                # http://localhost:3001
```

---

## Déploiement

### Backend → Railway
```bash
cd backend
railway service link backend
railway up
```

### Frontend → Netlify
```bash
cd frontend
npx vite build
npx netlify deploy --dir=dist --prod
```

Voir [DEPLOY-RAILWAY.md](./DEPLOY-RAILWAY.md) pour le guide complet.

---

## Historique des versions

| Version | Date | Principales fonctionnalités |
|---------|------|----------------------------|
| v3.0 | Jan 2026 | Base : auth, projets, équipements, documents |
| v3.1 | Fév 2026 | Dashboard, notifications, audit, export, organisation |
| v3.2 | Fév 2026 | Profil utilisateur, organigramme, whitelist email, propositions documentaires |
| v3.3 | Fév 2026 | Déploiement Railway/Netlify, sélecteur version, MinIO, IMAP email |
| **v3.4** | **Mar 2026** | **Connections, Spare Parts, Inspections, Maintenance, fix pagination, VersionSelectPage** |

---

**Version** : 3.4
**Date** : Mars 2026
**Dépôt GitHub** : https://github.com/papipascal/Zen-gineering
