# Zen-gineering - Guide Utilisateur Complet

## Table des matières
1. [C'est quoi Zen-gineering ?](#1-cest-quoi-zen-gineering-)
2. [Comment lancer l'application](#2-comment-lancer-lapplication)
3. [Premiers pas - Se connecter](#3-premiers-pas---se-connecter)
4. [Les pages de l'application](#4-les-pages-de-lapplication)
5. [Déploiement sur le NAS Synology](#5-déploiement-sur-le-nas-synology)
6. [Dépannage - Problèmes courants](#6-dépannage---problèmes-courants)
7. [Architecture technique](#7-architecture-technique)

---

## 1. C'est quoi Zen-gineering ?

Zen-gineering est une **application web de gestion de projets d'ingénierie industrielle**. Elle permet de :

- **Gérer les équipements** : liste d'équipements avec tag numbers, caractéristiques techniques (pression, température, matériaux), catégories (vessels, échangeurs, machines tournantes...)
- **Suivre les documents** : upload de fichiers, registre documentaire avec révisions, statuts, disciplines
- **Envoyer des transmittals** : envoi formel de documents aux vendeurs, partenaires ou clients
- **Gérer les workflows** : circuit de validation automatique (Lead discipline → Chef de projet → Manager)
- **Gérer les emails** : réception automatique des emails (IMAP), classification intelligente, réponse
- **Suivre les contrats** : exigences contractuelles, journal des modifications, import Excel
- **Tracer l'origine des données** : AGO (Approved & Guaranteed Origin) - d'où vient chaque donnée technique
- **Organiser le projet** : organigramme + arborescence de projet ajustables
- **Rechercher partout** : recherche globale sur tous les types de données
- **Exporter en CSV** : export de toutes les listes pour Excel
- **Notifications en temps réel** : alertes instantanées quand une tâche vous est assignée
- **Audit trail** : historique complet de toutes les actions

---

## 2. Comment lancer l'application

### Prérequis
Vous avez besoin de :
- **Docker Desktop** installé et lancé (icône de baleine dans la barre des tâches)
- **Node.js** v22 ou supérieur installé
- **Git** (normalement déjà installé si vous avez cloné le projet)

### Étape 1 : Lancer la base de données

Ouvrez un terminal (PowerShell ou Git Bash) dans le dossier du projet :

```bash
cd "c:\Users\goris\Documents\Mon Projet IA\Zen-gineering"
docker compose up -d postgres
```

> **Que fait cette commande ?** Elle démarre un conteneur PostgreSQL (la base de données) en arrière-plan. Le `-d` signifie "detached" (en arrière-plan).

Pour vérifier que ça tourne :
```bash
docker ps
```
Vous devez voir un conteneur `zengineering-postgres` avec le status "Up".

### Étape 2 : Lancer le Backend (API)

```bash
cd backend
npm run start:dev
```

> **Que fait cette commande ?** Elle lance le serveur API NestJS en mode développement. Le serveur redémarre automatiquement quand vous modifiez un fichier.

Attendez de voir ce message :
```
Zen-gineering API running on http://localhost:3000
Swagger docs: http://localhost:3000/api/docs
```

**Ne fermez pas ce terminal !** Le backend tourne dedans.

### Étape 3 : Lancer le Frontend (interface web)

Ouvrez un **nouveau terminal** (gardez l'autre ouvert) :

```bash
cd "c:\Users\goris\Documents\Mon Projet IA\Zen-gineering\frontend"
npm run dev
```

Attendez de voir :
```
VITE v7.x.x ready in XXX ms
➜ Local: http://localhost:3001/
```

### Étape 4 : Ouvrir l'application

Ouvrez votre navigateur et allez à : **http://localhost:3001**

> **IMPORTANT** : C'est le port **3001** (frontend), pas le 3000 (backend API). Le port 3000 n'affiche que "Hello World" car c'est l'API brute.

### Résumé des ports

| Service | URL | Ce que c'est |
|---------|-----|-------------|
| Frontend (interface) | http://localhost:3001 | **C'est ici qu'on utilise l'application** |
| Backend API | http://localhost:3000 | L'API brute (pas d'interface) |
| Swagger (documentation API) | http://localhost:3000/api/docs | Documentation interactive de toutes les routes API |
| PostgreSQL | localhost:5432 | Base de données (pas accessible via navigateur) |

### Comment tout arrêter

1. Dans chaque terminal, appuyez sur `Ctrl+C` pour arrêter le backend/frontend
2. Pour arrêter la base de données :
```bash
docker compose down
```

---

## 3. Premiers pas - Se connecter

### Comptes de démonstration

L'application est pré-remplie avec des données de démonstration. Voici les comptes disponibles :

| Nom | Email | Mot de passe | Rôle |
|-----|-------|-------------|------|
| Admin Zen | admin@zen.io | admin123 | Administrateur |
| Marie Dupont | marie@zen.io | password123 | Ingénieur Process |
| Jean Martin | jean@zen.io | password123 | Ingénieur Piping |

### Se connecter

1. Allez sur http://localhost:3001
2. Vous arrivez sur la page de login
3. Entrez un email et mot de passe du tableau ci-dessus
4. Cliquez "Sign In"

### Sélectionner un projet

Après le login, vous devez choisir un projet. Un projet de démonstration existe déjà :
- **Mon Chemical Plant - Unit U_A**

Cliquez dessus pour y accéder.

### Naviguer dans l'application

- **Menu latéral** : Cliquez sur l'icône hamburger (☰) en haut à gauche pour ouvrir/fermer le menu de navigation
- **Barre du haut** : Contient le nom du projet actif, la recherche, les notifications (cloche) et votre profil
- **Changer de projet** : Cliquez sur "Switch" à côté du nom du projet

---

## 4. Les pages de l'application

### Dashboard (page d'accueil)
**Chemin** : `/` (page d'accueil après sélection du projet)

C'est la vue d'ensemble du projet :
- Nombre d'équipements, discussions, tâches, changements en cours
- Liste des membres de l'équipe
- Partenaires et vendeurs du projet
- Discussions récentes

### Search (Recherche globale)
**Chemin** : `/search`

Recherche instantanée sur **toutes les données** du projet :
- Équipements, documents, discussions, transmittals, emails, vendeurs
- Filtres avancés par type, date, catégorie, discipline
- Possibilité de sauvegarder des recherches fréquentes (bouton "Save")

### Equipment (Équipements)
**Chemin** : `/equipment`

Liste de tous les équipements du projet :
- **Filtres** : par catégorie (Vessel, Heat Exchanger, Rotating Machine, Miscellaneous), par pression, température, matériau
- **Recherche** : par tag number, service, notes
- **Export Excel** : bouton en haut à droite
- Cliquez sur un équipement pour voir son détail (discussions, documents associés)

### Discussions
**Chemin** : `/discussions`

Forum de discussions techniques liées au projet :
- Créer une discussion (optionnellement liée à un équipement)
- Ajouter des commentaires
- Recherche dans les discussions

### My Tasks (Mes tâches)
**Chemin** : `/tasks`

Liste de toutes les tâches de workflow qui vous sont assignées :
- Actions disponibles : Approve, Reject, Complete, Skip
- Chaque tâche correspond à une étape de workflow en attente de votre validation

### Change Requests (Demandes de modification)
**Chemin** : `/change-requests`

Suivi des demandes de modification sur les équipements :
- Chaque demande crée automatiquement un workflow d'approbation
- Statuts : Pending, Approved, Rejected

### Doc Register (Registre documentaire)
**Chemin** : `/document-register`

Registre officiel des documents du projet :
- Numéro de document, titre, discipline, révision, statut
- Statuts : Draft → For Review → For Approval → Approved
- Filtres par discipline et statut

### Contract Req. (Exigences contractuelles)
**Chemin** : `/contract-requirements`

Suivi des exigences contractuelles :
- Import depuis un fichier Excel
- Statuts : Open, In Progress, Compliant, Non Compliant, Waived...
- Priorité : Low, Medium, High, Critical
- Export Excel

### Change Log (Journal des modifications)
**Chemin** : `/contract-change-log`

Journal des modifications contractuelles :
- Impact commercial, technique, planning
- Suivi des déviations

### AGO Report (Rapport d'origine des données)
**Chemin** : `/ago-report`

Traçabilité de l'origine de chaque donnée technique :
- Quelle donnée, d'où elle vient (quel document, quelle révision, quelle page)
- Détection des données périmées (staleness check)
- Export Excel

### Transmittals
**Chemin** : `/transmittals`

Envoi formel de documents :
- Créer un transmittal (bouton "New Transmittal")
- Sélectionner les documents à envoyer
- Choisir le destinataire (vendeur, partenaire, client)
- Envoyer (le destinataire reçoit un email avec les liens)

### Inbox (Emails entrants)
**Chemin** : `/incoming-emails`

Emails reçus par l'application :
- Classification automatique (Information, Query, Document Submission, Comment Request)
- Intention document (For Information, As Input, For Comments)
- Répondre directement depuis l'application
- Règles de routage configurables

### Documents
**Chemin** : `/documents`

Gestionnaire de fichiers du projet :
- Upload de fichiers (glisser-déposer ou bouton)
- Catégories : Datasheet, Specification, Drawing, Certification, Quote, Report, Manual
- Téléchargement, partage par email, suppression
- Taille max : 50 MB par fichier

### Vendors (Fournisseurs)
**Chemin** : `/vendors`

Liste des fournisseurs :
- Recherche par nom, pays, spécialité
- Fournisseurs assignés au projet (depuis Project Setup)

### Organization (Organisation)
**Chemin** : `/organization`

Deux onglets :
1. **Org Chart** : Organigramme du projet (Sponsor → Chef de projet → Engineering Manager → Leads...)
   - Chaque poste peut être assigné à un utilisateur
   - Utilisé pour l'auto-assignation des workflows
2. **Project Tree** : Arborescence du projet (Cahier des charges, Gestion de projet, Engineering, Procurement, Construction, Precom/Com, Start-up, Documents généraux)

### Audit Trail (Journal d'audit)
**Chemin** : `/audit`

Historique complet de toutes les actions effectuées dans l'application :
- Qui a fait quoi, quand, sur quel objet
- Filtre par type d'entité (equipment, workflow, document...)
- Pagination

### Project Setup (Configuration projet)
**Chemin** : `/project-setup` (visible uniquement pour les managers/owners)

Configuration du projet :
- Modifier les informations du projet
- Ajouter/retirer des membres de l'équipe
- Ajouter des partenaires
- Assigner des vendeurs

---

## 5. Déploiement sur le NAS Synology

### Prérequis sur le NAS
- Docker (Container Manager) installé via le Centre de paquets Synology
- Accès SSH ou interface Docker du NAS

### Méthode : Fichier TAR

#### Sur votre PC (déjà fait si vous avez suivi les étapes précédentes) :

Le fichier `zengineering-v3.1-nas.tar.gz` (341 MB) est dans le dossier du projet. Il contient les images Docker du backend et du frontend.

#### Sur le NAS :

1. **Copier les fichiers sur le NAS** :
   - Copiez `zengineering-v3.1-nas.tar.gz` sur le NAS (via le gestionnaire de fichiers Synology ou SCP)
   - Copiez `docker-compose.nas.yml` sur le NAS

2. **Charger les images Docker** :
```bash
# En SSH sur le NAS
cd /volume1/docker/zengineering   # ou le dossier où vous avez copié les fichiers
docker load < zengineering-v3.1-nas.tar.gz
```
> Cette commande peut prendre quelques minutes. Elle "installe" les images Docker.

3. **Lancer l'application** :
```bash
docker compose -f docker-compose.nas.yml up -d
```
> Cette commande lance tous les services : PostgreSQL, MinIO, MailHog, Backend, Frontend.

4. **Accéder à l'application** :
   - Frontend : `http://[IP-DU-NAS]:8080`
   - Portfolio : `http://[IP-DU-NAS]:8081`

> Remplacez `[IP-DU-NAS]` par l'adresse IP de votre NAS (ex: 192.168.1.100)

5. **Vérifier que tout tourne** :
```bash
docker ps
```
Vous devez voir 5 conteneurs "Up" : postgres, minio, mailhog, backend, frontend.

### Mettre à jour l'application

Quand une nouvelle version est disponible :
```bash
# Arrêter l'ancienne version
docker compose -f docker-compose.nas.yml down

# Charger la nouvelle version
docker load < zengineering-vX.X-nas.tar.gz

# Relancer
docker compose -f docker-compose.nas.yml up -d
```

> **Les données sont conservées** lors des mises à jour. Les volumes Docker (postgres_data, minio_data) persistent entre les arrêts/démarrages.

### Sauvegarder les données

Les données sont dans des volumes Docker. Pour les sauvegarder :
```bash
# Sauvegarde de la base de données
docker exec zeng-postgres pg_dump -U zengineering zengineering > backup_$(date +%Y%m%d).sql

# Restauration
docker exec -i zeng-postgres psql -U zengineering zengineering < backup_20260218.sql
```

---

## 6. Dépannage - Problèmes courants

### "Hello World" quand j'ouvre http://localhost:3000
**Normal !** Le port 3000 est le backend API (pas d'interface). Allez sur **http://localhost:3001** pour le frontend.

### "Cannot connect to server" ou page blanche
1. Vérifiez que Docker Desktop est lancé (icône baleine dans la barre des tâches)
2. Vérifiez que PostgreSQL tourne : `docker ps` doit montrer `zengineering-postgres`
3. Vérifiez que le backend tourne : le terminal doit afficher "Nest application successfully started"
4. Vérifiez que le frontend tourne : le terminal doit afficher "VITE ready"

### "Database connection error" dans le terminal du backend
```bash
# Relancer PostgreSQL
docker compose up -d postgres

# Attendre 5 secondes puis relancer le backend
cd backend && npm run start:dev
```

### "Port 3000 already in use"
Un autre process utilise le port. Fermez-le ou trouvez le PID :
```bash
# Windows
netstat -ano | findstr :3000
# Puis tuer le process
taskkill /PID [numero] /F
```

### "Prisma migrate" erreur
```bash
cd backend
npx prisma generate       # Régénère le client
npx prisma migrate dev    # Applique les migrations
npx prisma db seed        # Recharge les données de démo
```

### Le frontend ne se connecte pas à l'API
Le proxy Vite redirige `/api/*` vers le backend. Vérifiez que :
1. Le backend tourne sur le port 3000
2. Le frontend tourne sur le port 3001
3. Le fichier `frontend/vite.config.ts` contient la config proxy

### Les notifications ne marchent pas
C'est normal si aucune action n'est effectuée. Les notifications apparaissent quand :
- Un workflow vous assigne une tâche
- Un workflow est complété ou rejeté
- Un email est reçu
- Un document est soumis

### MinIO warning au démarrage
Le message "Could not create bucket - MinIO may not be running" est **normal** en développement si vous n'avez pas lancé MinIO. L'upload de fichiers ne fonctionnera pas, mais le reste de l'application fonctionne.

Pour activer MinIO (optionnel) :
```bash
docker compose up -d minio
```

---

## 7. Architecture technique

### Vue d'ensemble

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│   Navigateur    │────▶│  Frontend React  │────▶│  Backend API   │
│                 │     │  (port 3001)     │     │  (port 3000)   │
│  http://        │     │  Vite + MUI      │     │  NestJS        │
│  localhost:3001 │     │                  │     │  19 modules    │
└─────────────────┘     └──────────────────┘     └───────┬────────┘
                                                         │
                              ┌───────────────────┬──────┴──────┐
                              │                   │             │
                        ┌─────▼─────┐      ┌─────▼─────┐ ┌────▼────┐
                        │ PostgreSQL│      │   MinIO   │ │MailHog  │
                        │ (données) │      │ (fichiers)│ │ (emails)│
                        │ port 5432 │      │ port 9000 │ │port 1025│
                        └───────────┘      └───────────┘ └─────────┘
```

### Les 19 modules backend

| Module | Description | Endpoints |
|--------|-------------|-----------|
| Auth | Authentification JWT (login, register) | 4 routes |
| Projects | Gestion projets, membres, partenaires, vendeurs | 10 routes |
| Equipment | Liste équipements avec filtres avancés | 7 routes |
| Workflows | Moteur de workflows (state machine) | 9 routes |
| Change Requests | Demandes de modification équipement | 3 routes |
| Discussions | Discussions techniques + commentaires | 7 routes |
| Documents | Upload/download fichiers (MinIO) | 7 routes |
| Document Register | Registre documentaire officiel | 5 routes |
| Transmittals | Envoi formel de documents | 6 routes |
| Incoming Emails | Réception emails (IMAP) + classification | 9 routes |
| Mail | Envoi emails (SMTP) | interne |
| Search | Recherche globale multi-entités | 6 routes |
| Contract Items | Exigences + modifications contractuelles | 6 routes |
| Data Origin | Traçabilité AGO des données techniques | 7 routes |
| Organization | Organigramme + arborescence projet | 8 routes |
| Dashboard | Statistiques projet/utilisateur | 5 routes |
| Notifications | Alertes temps réel (SSE) | 1 route |
| Audit | Journal d'audit complet | 3 routes |
| Export | Export CSV (6 types de données) | 6 routes |

**Total : ~116 routes API**

### Workflow : Circuit de validation

Chaque nouveau workflow suit ce circuit :

```
Soumission (member)
    ↓
Validation Lead Discipline (auto-assigné depuis l'organigramme)
    ↓
Approbation Chef de Projet (auto-assigné depuis l'organigramme)
    ↓
[Étapes spécifiques selon le type de workflow]
```

L'auto-assignation utilise l'organigramme du projet : si "Marie Dupont" est assignée comme "Process Lead" dans l'organisation, elle recevra automatiquement les tâches de validation pour les workflows de discipline Process.

---

*Dernière mise à jour : 18 février 2026 - Version 3.1*
