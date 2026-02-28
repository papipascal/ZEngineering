# Déploiement Backend sur Railway — Guide Rapide (10 min)

## Ce que tu vas obtenir
- Backend NestJS sur `https://xxx.railway.app`
- PostgreSQL sur Railway (gratuit)
- MinIO sur Railway (gratuit)
- Frontend Netlify qui pointe sur ce backend

---

## Étape 1 — Créer le projet Railway

1. Va sur https://railway.app
2. Clique **"Continue with GitHub"** → autorise avec ton compte `papipascal`
3. Clic **"New Project"** → **"Empty Project"**
4. Renomme le projet : `zengineering`

---

## Étape 2 — Ajouter PostgreSQL

Dans le projet Railway :
1. Clique **"+ Add Service"** → **"Database"** → **PostgreSQL**
2. Attends 30 secondes que la DB démarre
3. Clique sur le service PostgreSQL → onglet **"Variables"**
4. Copie la valeur de `DATABASE_URL` — tu en auras besoin plus tard

---

## Étape 3 — Déployer le Backend

1. Clic **"+ Add Service"** → **"Docker Image"**
2. Image : `pascal1010/zengineering-backend:v3.3`
3. Clique **"Add Variables"** et colle ces variables :

```
NODE_ENV=production
PORT=3000
DATABASE_URL=<colle l'URL PostgreSQL copiée à l'étape 2>
JWT_SECRET=ZenG-JWT-Secret-Railway-2026-SuperSecure-32chars!
MINIO_ENDPOINT=zeng-minio.railway.internal
MINIO_PORT=9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=ZenG_Minio_2026!
MINIO_BUCKET=zengineering-files
MINIO_USE_SSL=false
SMTP_HOST=mailhog.railway.internal
SMTP_PORT=1025
CORS_ORIGIN=https://zengineering-app.netlify.app
```

4. Clique **"Deploy"** — attends ~2 min

---

## Étape 4 — Initialiser la Base de Données

Une fois le backend déployé et vert :

1. Clique sur le service backend → onglet **"Settings"** → section **"Deploy"**
2. Dans **"Start Command"**, note l'URL publique du backend (ex: `https://zengineering-backend-xxxx.railway.app`)
3. Ouvre le terminal du service (onglet **"Deploy"** → **"Shell"**) et lance :
```bash
npx prisma migrate deploy
node dist/prisma/seed.js
```

---

## Étape 5 — Mettre à jour Netlify

Une fois l'URL du backend connue (ex: `https://zengineering-backend-xxxx.railway.app`) :

1. Va sur https://app.netlify.com → site **"zengineering-app"**
2. **Site Settings** → **Environment Variables** → **Add Variable** :
   - Key : `VITE_API_URL`
   - Value : `https://zengineering-backend-xxxx.railway.app`
3. **Deploys** → **Trigger Deploy** → **Deploy site**

Et c'est tout ! L'application sera complètement opérationnelle.

---

## Credentials de démo

| Utilisateur | Email | Mot de passe |
|---|---|---|
| Admin | admin@zengineering.local | Password123! |
| Chef de Projet | chef.projet@zengineering.local | Password123! |
| Ingénieur | ingenieur@zengineering.local | Password123! |

---

## Alternative rapide — MinIO optionnel

Si tu veux sauter MinIO pour aller plus vite (les uploads de fichiers ne fonctionneront pas mais tout le reste oui) :
- Retire les variables `MINIO_*` du backend
- Ajoute `STORAGE_DISABLED=true`
- Le backend démarrera sans MinIO

---

## Coût estimé Railway

- **Gratuit** avec le plan Hobby (5$/mois offerts en crédits)
- PostgreSQL : ~0.5$/mois
- Backend : ~1$/mois selon usage
- Total demo : ~0$/mois avec les crédits gratuits
