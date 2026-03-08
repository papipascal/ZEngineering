# Quick Start — Zen-gineering V3.4

## Accès immédiat (production)

L'application est déployée et opérationnelle :

| | URL |
|--|-----|
| **Application** | https://zengineering-app.netlify.app |
| **API** | https://backend-production-dfa4.up.railway.app |

**Login rapide** : `admin@zengineering.local` / `Password123!`

---

## Lancer en local (développement)

### Prérequis
- Docker Desktop lancé
- Node.js v22+

### 1. Cloner

```bash
git clone https://github.com/papipascal/Zen-gineering.git
cd Zen-gineering
```

### 2. Services Docker

```bash
docker compose up -d postgres minio
```

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

Le backend démarre sur http://localhost:3000
Swagger : http://localhost:3000/api/docs

### 4. Frontend

```bash
# Nouveau terminal
cd frontend
npm install
npm run dev
```

L'application est disponible sur **http://localhost:3001**

---

## Ports locaux

| Service | URL |
|---------|-----|
| Application | http://localhost:3001 |
| API Backend | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
| MinIO Console | http://localhost:9001 (minioadmin/minioadmin) |
| MailHog | http://localhost:8025 |

---

## Déployer en production

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

---

## Documentation complète

- [Guide Utilisateur](./GUIDE-UTILISATEUR.md) — Utilisation de l'application
- [Guide Railway](./DEPLOY-RAILWAY.md) — Déploiement backend complet
- [Demo Guide](./DEMO-GUIDE.md) — Scénario de démonstration

---

*Version 3.4 — Mars 2026*
