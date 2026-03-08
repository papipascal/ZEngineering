# Déploiement Backend sur Railway — Guide V3.4

## État actuel (production opérationnelle)

| Service | URL | Statut |
|---------|-----|--------|
| Backend | https://backend-production-dfa4.up.railway.app | Déployé |
| Frontend | https://zengineering-app.netlify.app | Déployé |
| PostgreSQL | postgres.railway.internal:5432 | Déployé (Railway interne) |

---

## Redéployer le backend (mise à jour)

```bash
cd "c:\Users\goris\Documents\Mon Projet IA\Zen-gineering\backend"

# Vérifier qu'on est lié au bon service
railway status

# Déployer
railway service link backend
railway up
```

Le déploiement prend ~2-3 minutes. Le Dockerfile fait :
1. `npm install`
2. `npx prisma generate`
3. `npx nest build`
4. Au démarrage : `npx prisma migrate deploy && node dist/main`

---

## Redéployer le frontend (mise à jour)

```bash
cd "c:\Users\goris\Documents\Mon Projet IA\Zen-gineering\frontend"

# Build (lit .env.production pour baker les URLs)
npx vite build

# Déployer sur Netlify
npx netlify deploy --dir=dist --prod
```

> Le fichier `.env.production` DOIT exister avant le build sinon les URLs seront vides.

---

## Variables d'environnement Railway (backend)

Ces variables sont configurées dans le dashboard Railway → service backend → Variables :

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...@postgres.railway.internal:5432/railway
JWT_SECRET=<secret-fort>
MINIO_ENDPOINT=localhost         # MinIO non déployé sur Railway — upload désactivé
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=zengineering-files
MINIO_USE_SSL=false
SMTP_HOST=localhost               # MailHog non déployé — emails sortants désactivés
SMTP_PORT=1025
CORS_ORIGIN=https://zengineering-app.netlify.app
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_USER=<email-outlook>
IMAP_PASS=<mot-de-passe>
IMAP_TLS=true
```

---

## Créer un nouveau projet Railway (depuis zéro)

Si le projet Railway est perdu ou à recréer :

### 1. Créer le projet

```bash
railway init                   # "Create new project" → nom : zengineering
```

### 2. Ajouter PostgreSQL

Dans le dashboard Railway → "+ Add Service" → Database → PostgreSQL

### 3. Lier le service backend

```bash
railway service link backend   # ou créer le service dans le dashboard d'abord
```

### 4. Configurer les variables

```bash
railway variable set NODE_ENV=production PORT=3000 JWT_SECRET=xxx ...
# ou copier depuis le dashboard Railway
```

### 5. Déployer

```bash
cd backend
railway up
```

### 6. Initialiser la base de données

```bash
railway ssh -- sh -c "cd /app && npx prisma migrate deploy"
railway ssh -- sh -c "cd /app && npx prisma db seed"
```

### 7. Ajouter un domaine public

Dans le dashboard Railway → service backend → Settings → Networking → "+ Add Domain"

---

## Voir les logs

```bash
railway logs --service backend
```

---

## Vérification rapide

```bash
# Test API (depuis n'importe où)
curl https://backend-production-dfa4.up.railway.app/health

# Swagger
open https://backend-production-dfa4.up.railway.app/api/docs
```

---

## Dockerfile backend

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npx nest build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

> Note : NestJS compile dans `dist/main.js` (pas `dist/src/main.js`).

---

## Résoudre les problèmes courants Railway

### "Cannot find module" au démarrage
Le CMD pointe vers le mauvais fichier. Vérifier que `npx nest build` produit `dist/main.js`.

### "Connection refused" PostgreSQL
Vérifier que `DATABASE_URL` utilise `postgres.railway.internal` (pas `localhost`) en production.

### Premier `railway up` va vers Postgres
Toujours lier explicitement le service avant : `railway service link backend`

---

*Version 3.4 — Mars 2026*
