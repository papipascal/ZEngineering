# Zen-gineering — Guide Utilisateur

**Version 3.4 — Mars 2026**

---

## Table des matières

1. [Qu'est-ce que Zen-gineering ?](#1-quest-ce-que-zen-gineering-)
2. [Accès à l'application](#2-accès-à-lapplication)
3. [Se connecter et sélectionner un projet](#3-se-connecter-et-sélectionner-un-projet)
4. [Les pages de l'application](#4-les-pages-de-lapplication)
5. [Développement local](#5-développement-local)
6. [Déploiement production](#6-déploiement-production)
7. [Dépannage](#7-dépannage)
8. [Architecture technique](#8-architecture-technique)

---

## 1. Qu'est-ce que Zen-gineering ?

Zen-gineering est une **application web de gestion de projets d'ingénierie industrielle** entièrement déployée en production.

Elle permet de :

- **Gérer les équipements** : liste avec tag numbers, caractéristiques techniques, connexions, pièces de rechange, inspections, maintenance
- **Suivre les documents** : upload, registre documentaire avec révisions et statuts, workflows de validation
- **Envoyer des transmittals** : envoi formel de documents aux vendeurs, partenaires ou clients
- **Gérer les emails** : réception automatique (IMAP Outlook), classification, routage par projet
- **Suivre les contrats** : exigences contractuelles, journal des modifications
- **Tracer l'origine des données** : AGO (Approved & Guaranteed Origin)
- **Collaborer** : discussions techniques, tâches, notifications temps réel
- **Exporter** : Excel, CSV pour toutes les listes
- **Auditer** : historique complet de toutes les actions

---

## 2. Accès à l'application

### Production (accès direct)

| Service | URL |
|---------|-----|
| **Application** | https://zengineering-app.netlify.app |
| **API Backend** | https://backend-production-dfa4.up.railway.app |
| **Swagger** | https://backend-production-dfa4.up.railway.app/api/docs |

### Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@zengineering.local | Password123! |
| Chef de Projet | chef.projet@zengineering.local | Password123! |
| Ingénieur | ingenieur@zengineering.local | Password123! |

---

## 3. Se connecter et sélectionner un projet

### Étape 1 — Login

1. Ouvrez https://zengineering-app.netlify.app
2. La page de login s'affiche avec un sous-titre indiquant les identifiants de démo
3. Entrez l'email et le mot de passe
4. Cliquez **Sign In**

> La roue dentée en bas à gauche de la page de login permet de configurer l'URL du serveur (utile si vous utilisez un backend local ou un tunnel).

### Étape 2 — Sélectionner un projet

Après le login, vous arrivez sur la liste de vos projets. Cliquez sur un projet pour y accéder.

### Étape 3 — Choisir la version

Une page **Version Select** apparaît avec deux choix :
- **V3 — Interface classique** : l'application actuelle (vous y êtes)
- **V4.1 — Interface IA** : interface nouvelle génération avec assistant Claude AI (https://zengineering-v41.netlify.app)

Cliquez **Continuer en V3** pour accéder à l'interface classique.

---

## 4. Les pages de l'application

### Dashboard `/`

Vue d'ensemble du projet :
- Compteurs : équipements, discussions, tâches, changements en cours
- Membres de l'équipe actifs
- Partenaires et vendeurs
- Discussions récentes

### Search `/search`

Recherche instantanée sur **toutes les données** du projet :
- Équipements, documents, discussions, transmittals, emails, vendeurs
- Filtres par type, date, catégorie, discipline
- Sauvegarde des recherches fréquentes

### Equipment `/equipment`

Liste de tous les équipements du projet avec :
- Filtres par catégorie (Vessel, Heat Exchanger, Rotating Machine, Miscellaneous)
- Recherche par tag number, service, notes
- Colonnes : Tag, Service, Catégorie, Sous-type, Matériau, Pression, Température
- **Export Excel** bouton en haut à droite
- Clic sur un équipement → page détail avec documents et discussions associés

### Equipment Detail `/equipment/:id`

Détail d'un équipement :
- Caractéristiques techniques complètes
- Connexions (liaisons avec d'autres équipements ou tuyauteries)
- Pièces de rechange (Spare Parts) associées
- Inspections planifiées et historique
- Maintenance préventive/corrective
- Documents liés
- Discussions liées

### Connections `/connections`

Gestion des connexions entre équipements :
- Liaison pipeline, instrumentation, électrique...
- Vue tabulaire filtrée par équipement ou type

### Spare Parts `/spare-parts`

Catalogue de pièces de rechange :
- Liées aux équipements
- Quantités, fournisseurs, délais

### Discussions `/discussions`

Forum de discussions techniques liées au projet :
- Créer une discussion (optionnellement liée à un équipement)
- Ajouter des commentaires
- Recherche

### My Tasks `/tasks`

Tâches de workflow assignées à l'utilisateur connecté :
- Actions : Approve, Reject, Complete, Skip
- Chaque tâche correspond à une étape de validation en attente

### Change Requests `/change-requests`

Demandes de modification sur les équipements :
- Workflow d'approbation automatique (Lead → Chef de projet)
- Statuts : Pending, Approved, Rejected

### Doc Register `/document-register`

Registre officiel des documents du projet :
- Numéro, titre, discipline, révision, statut
- Statuts : Draft → For Review → For Approval → Approved
- Filtres par discipline et statut

### Contract Req. `/contract-requirements`

Suivi des exigences contractuelles :
- Import depuis Excel
- Priorités : Low, Medium, High, Critical
- Statuts : Open, In Progress, Compliant, Non Compliant, Waived
- Export Excel

### Change Log `/contract-change-log`

Journal des modifications contractuelles :
- Impact commercial, technique, planning

### AGO Report `/ago-report`

Traçabilité de l'origine des données techniques :
- Quelle donnée, depuis quel document, quelle révision, quelle page
- Détection des données périmées
- Export Excel

### Transmittals `/transmittals`

Envoi formel de documents :
- Créer un transmittal : sélectionner documents + destinataire (vendeur/partenaire/client)
- L'envoi génère un email au destinataire avec liens de téléchargement
- Historique de tous les transmittals

### Inbox `/incoming-emails`

Emails reçus automatiquement par l'application :
- Adresse de projet dédiée (alias Outlook par projet : ex. `zen-project-ub@outlook.com`)
- Classification automatique
- Répondre depuis l'application
- Pièces jointes stockées dans MinIO

### Documents `/documents`

Gestionnaire de fichiers :
- Upload (glisser-déposer ou bouton) — max 50 MB par fichier
- Catégories : Datasheet, Specification, Drawing, Certification, Quote, Report, Manual
- Téléchargement, partage par email, suppression
- Stockage MinIO (S3-compatible)

### Vendors `/vendors`

Liste des fournisseurs :
- Recherche par nom, pays, spécialité
- Fournisseurs assignés au projet (via Project Setup)

### Organization `/organization`

Deux onglets :
1. **Org Chart** : Organigramme projet (Sponsor → Chef de projet → Engineering Manager → Leads)
   - Chaque poste assigné à un utilisateur → auto-assignation des workflows
2. **Project Tree** : Arborescence projet personnalisable

### Audit `/audit`

Historique complet de toutes les actions :
- Qui, quoi, quand, sur quel objet
- Filtre par type d'entité

### Project Setup `/project-setup`

Configuration du projet (visible Manager/Owner uniquement) :
- Informations générales du projet
- Ajouter/retirer membres, partenaires, vendeurs
- Email de projet (alias IMAP)

### Profile `/profile`

Profil utilisateur et paramètres.

---

## 5. Développement local

### Prérequis

- Docker Desktop (PostgreSQL, MinIO, MailHog)
- Node.js v22+
- Git

### Lancer en local

```bash
# 1. Cloner
git clone https://github.com/papipascal/Zen-gineering.git
cd Zen-gineering

# 2. Services Docker
docker compose up -d postgres minio

# 3. Backend
cd backend
npm install
cp .env.example .env        # ou créer .env avec variables ci-dessous
npx prisma migrate dev
npx prisma db seed
npm run start:dev           # → http://localhost:3000

# 4. Frontend (nouveau terminal)
cd frontend
npm install
npm run dev                 # → http://localhost:3001
```

### Variables backend (.env)

```env
DATABASE_URL=postgresql://zengineering:zengineering@localhost:5432/zengineering
JWT_SECRET=local-dev-secret-change-in-prod
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=zengineering-files
MINIO_USE_SSL=false
SMTP_HOST=localhost
SMTP_PORT=1025
CORS_ORIGIN=http://localhost:3001
```

### Ports locaux

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3001 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
| MinIO (API) | http://localhost:9000 |
| MinIO (Console) | http://localhost:9001 (minioadmin / minioadmin) |
| MailHog | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

---

## 6. Déploiement production

### Backend → Railway

```bash
cd backend

# Lier au service backend du projet Railway
railway service link backend

# Déployer
railway up
```

Les variables d'environnement sont configurées dans le dashboard Railway.

URL du backend : `https://backend-production-dfa4.up.railway.app`

### Frontend → Netlify

```bash
cd frontend

# Build production (lit .env.production pour les URLs)
npx vite build

# Déployer
npx netlify deploy --dir=dist --prod
```

Le fichier `frontend/.env.production` contient :
```env
VITE_API_URL=https://backend-production-dfa4.up.railway.app
VITE_V41_URL=https://zengineering-v41.netlify.app
```

> Ces variables sont baked-in au moment du build Vite — ne pas les mettre dans les env vars Netlify.

### Voir les logs Railway

```bash
railway logs --service backend
```

### Migrations Railway

```bash
railway ssh -- sh -c "cd /app && npx prisma migrate deploy"
railway ssh -- sh -c "cd /app && npx prisma db seed"
```

---

## 7. Dépannage

### Page blanche sur Netlify

**Cause probable** : `VITE_API_URL` absent du fichier `.env.production` au moment du build.

**Solution** :
1. Vérifier que `frontend/.env.production` existe et contient `VITE_API_URL`
2. Rebuilder : `cd frontend && npx vite build`
3. Redéployer : `npx netlify deploy --dir=dist --prod`

### Erreur "n.map is not a function"

**Cause** : Le backend retourne une réponse paginée `{ data: [...], total, page }` mais le frontend attend un tableau.

**Solution** : Lire `r.data.data` au lieu de `r.data` dans le composant concerné. Corrigé dans EquipmentListPage v3.4.

### Login échoue en production

1. Vérifier que le backend répond : ouvrir `https://backend-production-dfa4.up.railway.app/health`
2. Vérifier CORS : le backend doit avoir `CORS_ORIGIN=https://zengineering-app.netlify.app`
3. Vérifier que `VITE_API_URL` est bien dans le bundle (chercher `backend-production-dfa4` dans les fichiers `dist/assets/*.js`)

### Backend Railway crashe au démarrage

**Cause probable** : Erreur de migration Prisma ou mauvaise variable DATABASE_URL.

**Solution** :
```bash
railway logs --service backend   # voir l'erreur exacte
railway ssh -- sh -c "cd /app && npx prisma migrate status"
```

### MinIO warning au démarrage (local)

Le message `"Could not create bucket — MinIO may not be running"` est normal si MinIO n'est pas lancé.
L'upload de fichiers ne fonctionnera pas mais le reste de l'application oui.

```bash
docker compose up -d minio   # pour activer MinIO
```

### Voir le contenu MinIO

```bash
# Via script batch (Windows)
minio-dir.bat              # tout le bucket
minio-dir.bat inbox        # emails entrants

# Console web
http://localhost:9001      # minioadmin / minioadmin
```

---

## 8. Architecture technique

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION                               │
│                                                             │
│  Netlify                        Railway                     │
│  ────────                       ───────                     │
│  React + MUI v7                 NestJS + Prisma             │
│  Vite 7 (bundle statique)       PostgreSQL 15               │
│  SPA avec React Router          Docker (node:22-alpine)     │
│                                                             │
│  zengineering-app.netlify.app   backend-production-dfa4     │
│                                 .up.railway.app             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 DÉVELOPPEMENT LOCAL                         │
│                                                             │
│  Frontend   Backend    PostgreSQL  MinIO    MailHog         │
│  :3001      :3000      :5432       :9000    :1025           │
│  (Vite)     (NestJS)   (Docker)    (Docker) (Docker)       │
└─────────────────────────────────────────────────────────────┘
```

### Circuit de validation (Workflow)

```
Soumission (membre)
    ↓
Validation Lead Discipline  ← auto-assigné via organigramme
    ↓
Approbation Chef de Projet  ← auto-assigné via organigramme
    ↓
[Étapes spécifiques selon type de workflow]
    ↓
Completed / Rejected
```

### Système email

```
Outlook inbox (zen@outlook.com)
    ↑ polling IMAP toutes les X minutes
    │
Alias de projet (zen-project-ub@outlook.com → même inbox)
    │
Backend IMAP service : match To: → project.projectEmail dans DB
    │
IncomingEmail enregistré en base + pièces jointes → MinIO
```

---

*Dernière mise à jour : Mars 2026 — Version 3.4*
