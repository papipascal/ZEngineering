# Zen-gineering — Guide de Démonstration Complète v3.2

> **Scénario** : *Mon Chemical Plant — Unit U_A* | Client : Alphahexol Industries
> **Durée totale estimée** : ~60 minutes | **Version** : 3.2

---

## Table des matières

| # | Module | Durée |
|---|--------|-------|
| — | [Proposition de valeur & architecture](#proposition-de-valeur--architecture) | 3 min |
| — | [Prérequis & démarrage rapide](#prérequis--démarrage-rapide) | — |
| — | [Credentials de démonstration](#credentials-de-démonstration) | — |
| 01 | [Connexion & Navigation](#module-01--connexion--navigation) | 2 min |
| 02 | [Tableau de bord](#module-02--tableau-de-bord) | 5 min |
| 03 | [Gestion de projet & équipe](#module-03--gestion-de-projet--équipe) | 5 min |
| 04 | [Organigramme & Arborescence](#module-04--organigramme--arborescence) ⭐ | 5 min |
| 05 | [Liste des équipements](#module-05--liste-des-équipements) ⭐⭐ | 8 min |
| 06 | [Workflows & Approbations](#module-06--workflows--approbations) ⭐⭐⭐ | 10 min |
| 07 | [Mes Tâches](#module-07--mes-tâches) | 3 min |
| 08 | [Discussions collaboratives](#module-08--discussions-collaboratives) | 5 min |
| 09 | [Registre de documents](#module-09--registre-de-documents) ⭐⭐ | 8 min |
| 10 | [Upload & partage de documents](#module-10--upload--partage-de-documents) | 5 min |
| 11 | [Transmittals](#module-11--transmittals) ⭐ | 5 min |
| 12 | [Inbox emails & Whitelist](#module-12--inbox-emails--whitelist) ⭐⭐⭐ | 8 min |
| 13 | [Propositions de documents](#module-13--propositions-de-documents) | 5 min |
| 14 | [Traçabilité AGO / Data Origin](#module-14--traçabilité-ago--data-origin) ⭐⭐ | 5 min |
| 15 | [Articles de contrat](#module-15--articles-de-contrat) | 4 min |
| 16 | [Recherche globale](#module-16--recherche-globale) | 3 min |
| 17 | [Audit & Conformité](#module-17--audit--conformité) ⭐ | 4 min |
| 18 | [Export CSV](#module-18--export-csv) | 3 min |
| 19 | [Notifications temps réel](#module-19--notifications-temps-réel) | 2 min |
| 20 | [Gestion fournisseurs](#module-20--gestion-fournisseurs) | 3 min |
| 21 | [Profil utilisateur](#module-21--profil-utilisateur) | 2 min |
| — | [Récapitulatif & Arguments commerciaux](#récapitulatif--arguments-commerciaux) | 5 min |

---

## Proposition de valeur & architecture

Zen-gineering est une plateforme de gestion de projets Engineering conçue pour les industries process (chimique, pétrochimique, Oil & Gas). Elle centralise :

- La **liste des équipements** avec données techniques et traçabilité d'origine
- Les **circuits d'approbation** (workflows) sans licence externe
- La **gestion documentaire** complète avec transmittals
- La **capture automatique des emails** techniques entrants
- Un **audit trail** total pour la conformité ISO/réglementaire

### Architecture technique

```
┌─────────────────────────────────────────────────────┐
│  Frontend React 19 + MUI v7        (port 3001)      │
├─────────────────────────────────────────────────────┤
│  Backend NestJS + TypeScript       (port 3000)      │
│  ├── 19 modules API                                  │
│  ├── Moteur workflow maison (JSON-configurable)      │
│  └── IMAP polling automatique                        │
├──────────────────┬────────────────┬─────────────────┤
│  PostgreSQL       │  MinIO (S3)    │  MailHog (SMTP) │
│  (données)        │  (fichiers)    │  (emails sortants)│
└──────────────────┴────────────────┴─────────────────┘
```

---

## Prérequis & démarrage rapide

```bash
# 1. Démarrer les services Docker
docker compose up -d postgres minio mailhog

# 2. Backend (terminal 1)
cd backend
npm run start:dev
# → http://localhost:3000  |  Swagger: http://localhost:3000/api/docs

# 3. Frontend (terminal 2)
cd frontend
npm run dev
# → http://localhost:3001
```

**Vérification rapide** : `node test-suite.mjs` → tous les tests doivent passer ✅

---

## Credentials de démonstration

| Utilisateur | Email | Mot de passe | Rôle dans le projet |
|---|---|---|---|
| Admin Zen | `admin@zengineering.local` | `Password123!` | Process Lead (admin) |
| Marie Dupont | `chef.projet@zengineering.local` | `Password123!` | Chef de Projet (manager) |
| Jean Martin | `ingenieur@zengineering.local` | `Password123!` | Ingénieur Mécanique (member) |

**Projet de démo** : *Mon Chemical Plant - Unit U_A*
**Client** : Alphahexol Industries — `john.smith@alphahexol.com`

---

## Module 01 — Connexion & Navigation

**Durée** : 2 min | **URL** : `http://localhost:3001/login`

### Objectif
Montrer la sécurité JWT, la navigation par projet et l'interface claire.

### Étapes

1. Ouvrir `http://localhost:3001` → redirection automatique vers `/login`
2. Saisir `admin@zengineering.local` / `Password123!` → cliquer **Se connecter**
3. Observer la redirection vers `/select-project`
4. Sélectionner **Mon Chemical Plant - Unit U_A** → accès au tableau de bord
5. Explorer la barre de navigation latérale : tous les modules sont accessibles
6. Se déconnecter (icône en bas à gauche) → retour à `/login`

### Résultat attendu
- Token JWT stocké côté client, session persistante
- Menu latéral affiche tous les modules disponibles
- L'utilisateur voit uniquement les projets dont il est membre

### Point de vente
**Authentification JWT sécurisée, multi-projets, sans configuration LDAP complexe.**

---

## Module 02 — Tableau de bord

**Durée** : 5 min | **URL** : `http://localhost:3001/`

### Objectif
Donner une vue synthétique de l'état du projet en un coup d'œil.

### Étapes

1. Après connexion, ouvrir le tableau de bord `/`
2. Observer les **statistiques projet** :
   - Équipements : 27 items enregistrés
   - Workflows actifs : 1 instance en cours
   - Documents : 3 registre entries
3. Observer le **graphique par catégorie** d'équipements (vessels, pumps, heat exchangers…)
4. Observer les **workflows en cours** avec leur avancement (barre de progression)
5. Tester l'API directement : `GET http://localhost:3000/api/dashboard/project/:id`

### Résultat attendu
- KPIs affichés (nb équipements, workflows, documents)
- Distribution graphique des catégories d'équipements
- Liste des instances de workflow actives avec statut

### Point de vente
**Vision 360° du projet sans avoir à naviguer dans 10 onglets différents.**

---

## Module 03 — Gestion de projet & équipe

**Durée** : 5 min | **URL** : `http://localhost:3001/project-setup`

### Objectif
Montrer la gestion complète des membres, partenaires et fournisseurs du projet.

### Étapes

1. Naviguer vers `/project-setup`
2. Observer les **informations projet** :
   - Nom : Mon Chemical Plant - Unit U_A
   - Client : Alphahexol Industries (`john.smith@alphahexol.com`)
   - Email projet : `ua-unit@zengineering.local`
3. Onglet **Membres équipe** : 3 membres (Admin Zen, Marie Dupont, Jean Martin)
4. Onglet **Partenaires** :
   - Licensor Technologies Ltd. — Dr. Sarah Chen (`sarah.chen@licensortech.com`)
   - EPC Global Engineering — Pierre Lemoine (`p.lemoine@epcglobal.fr`)
5. Onglet **Fournisseurs** : SULZER, MOUVEX, LESER (sélectionnés pour ce projet)
6. Montrer qu'on peut **ajouter un partenaire** en temps réel

### Résultat attendu
- Fiche projet complète avec toutes les parties prenantes
- Rôles distincts (owner, manager, member)
- Contacts externes centralisés

### Point de vente
**Toutes les parties prenantes d'un projet en un seul endroit — client, licencier, EPC, fournisseurs.**

---

## Module 04 — Organigramme & Arborescence

**Durée** : 5 min | **URL** : `http://localhost:3001/organization`  ⭐

### Objectif
Présenter la structure organisationnelle du projet et l'arborescence documentaire.

### Étapes

1. Naviguer vers `/organization`
2. Observer l'**organigramme du projet** avec 31 rôles :
   - Chef de Projet : Marie Dupont
   - Process Lead : Admin Zen
   - Doc Contrôleur : Jean Martin
3. Observer la **hiérarchie** : Engineering → Process Lead, Piping Lead, Vessels Lead, etc.
4. Onglet **Arborescence** : structure de dossiers projet (Engineering, Procurement, Construction…)
   - Niveau 1 : Cahier des charges, Gestion de projet, Engineering, Procurement, Construction, Precom Com, Start-up, Documents généraux
   - Chaque niveau 1 se déploie avec des sous-dossiers thématiques

### Résultat attendu
- Organigramme visuel hiérarchique
- 31 positions avec assignations utilisateurs
- Arborescence prête à l'emploi basée sur les standards industriels

### Point de vente
**L'organigramme pilote les workflows — les tâches sont auto-assignées selon le rôle dans l'organigramme (Process Lead, Chef de Projet, etc.).**

---

## Module 05 — Liste des équipements

**Durée** : 8 min | **URL** : `http://localhost:3001/equipment`  ⭐⭐

### Objectif
Montrer la gestion complète de la liste des équipements avec filtres et données techniques.

### Étapes

1. Naviguer vers `/equipment`
2. Observer les **27 équipements** réalistes du projet :
   - Vessels : 125-VV-601 (Blowdown Drum), 125-NF-601 A/B (Filtres), 125-VV-405…
   - Pompes : 125-PR-601 A/B (Feed Loop Pump), 125-PR-602 A/B (Recirculation)…
   - Échangeurs : 125-HE-601 (Heater), 125-XA-602 (WHR Package)…
3. **Filtrer par catégorie** : sélectionner "Rotating Machine" → affiche les pompes et compresseurs
4. **Rechercher** : taper "pump" dans la barre de recherche
5. **Ouvrir la fiche** 125-PR-601 A :
   - Service : Alphahexol Spent Catalyst and Waxes Feed Loop Pump A
   - Matériaux : Casing SS, Gear SS
   - Pression service/design : 2.9 / 15.1 barg
   - Température service : 235°C
   - Notes : Gear pump type. Reciprocating. 2.0 m3/h. 2.1 kW. Electrical drive.
6. Observer l'onglet **Discussions** sur la fiche équipement (discussion liée)
7. Observer l'onglet **Data Origin** (traçabilité AGO — voir Module 14)

### Données clés à utiliser

| Tag | Service | Catégorie |
|---|---|---|
| 125-VV-601 | Blowdown Drum | VESSEL |
| 125-PR-601 A | Feed Loop Pump A | ROTATING_MACHINE |
| 125-HE-601 | Waxes Heater | HEAT_EXCHANGER |
| 125-NF-601 A | Spent Catalyst Filter A | VESSEL |

### Résultat attendu
- Liste paginée avec filtres multi-critères
- Fiches techniques complètes (pression, température, matériaux, notes)
- Discussions et Data Origin liés à chaque équipement

### Point de vente
**La liste des équipements est le cœur du projet EPC — toutes les données techniques en un clic, avec historique de modification et traçabilité complète.**

---

## Module 06 — Workflows & Approbations

**Durée** : 10 min | **URL** : `http://localhost:3001/tasks`  ⭐⭐⭐ CLOU DE LA DÉMO

### Objectif
Démontrer le moteur de workflow maison — le différenciateur clé face aux concurrents.

### Contexte
3 circuits d'approbation sont disponibles :
- **Simple Approval** (3 étapes) : Execution → Validation Lead Discipline → Approbation Chef de Projet
- **Validation de document** (5 étapes) : Soumission → Validation Lead → Approbation CDP → Revue technique → Approbation finale
- **Approbation achat** (6 étapes) : Demande → Lead → CDP → Budget → Direction → Finalisation

### Instance active
Une instance est en cours : **"Review pump 125-PR-601 datasheet"**
- Étape actuelle : **Execution** (assigné à Jean Martin)
- Étape suivante : Validation Lead Discipline (Admin Zen)
- Étape finale : Approbation Chef de Projet (Marie Dupont)

### Étapes de démo

1. Naviguer vers `/tasks` (connecté en tant que Jean Martin)
2. Observer la **tâche active** : "Execution — Review pump 125-PR-601 datasheet"
3. Expliquer : *"Jean Martin a été auto-assigné à cette étape car il est le member du projet. L'organigramme pilote l'attribution automatique."*
4. Cliquer sur la tâche → voir les détails de l'instance
5. **Avancer le workflow** : cliquer "Complete" / "Marquer comme fait"
6. Observer la transition automatique à l'étape suivante (Admin Zen reçoit la tâche)
7. Se reconnecter en tant qu'Admin Zen → la tâche "Validation Lead Discipline" apparaît dans ses tâches
8. Via l'API Swagger (`GET /api/workflows/definitions`) : montrer les 3 templates JSON

### API à montrer (Swagger)
```
GET  /api/workflows/definitions       → 3 templates configurables en JSON
GET  /api/workflows/instances?projectId=xxx → instances du projet
POST /api/workflows/instances         → démarrer un nouveau circuit
POST /api/workflows/instances/:id/advance → avancer l'étape courante
```

### Résultat attendu
- Interface claire avec tâches actives par utilisateur
- Transition de statut automatique avec historique
- Multi-étapes configurable sans code

### Point de vente
**Moteur workflow 100% maison, configurable en JSON, sans licence Camunda (économie de 20 000€/an+). Les circuits s'adaptent à chaque discipline en 5 minutes.**

---

## Module 07 — Mes Tâches

**Durée** : 3 min | **URL** : `http://localhost:3001/tasks`

### Objectif
Vue personnelle des tâches assignées à l'utilisateur connecté.

### Étapes

1. Se connecter en tant que **Jean Martin** (`ingenieur@zengineering.local`)
2. Naviguer vers `/tasks`
3. Observer la tâche "Execution — Review pump 125-PR-601 datasheet" en statut **active**
4. Se reconnecter en tant que **Marie Dupont** → les tâches en attente lui appartenant s'affichent
5. Montrer le **filtre par statut** (active, pending, completed)

### Résultat attendu
- Chaque utilisateur voit uniquement ses tâches
- Statuts clairs : active (à faire maintenant), pending (en attente), completed

### Point de vente
**Chaque membre de l'équipe a son tableau de bord personnel — fini les oublis de validation.**

---

## Module 08 — Discussions collaboratives

**Durée** : 5 min | **URL** : `http://localhost:3001/discussions`

### Objectif
Montrer la collaboration contextualisée directement liée aux équipements.

### Étapes

1. Naviguer vers `/discussions`
2. Observer les **3 discussions** pré-existantes :
   - **Blowdown Drum material selection** (liée à 125-VV-601) — Marie Dupont
   - **Feed Loop Pump vendor selection** (liée à 125-PR-601 A) — Jean Martin
   - **Weekly progress update - Week 7** (discussion générale) — Marie Dupont
3. Ouvrir "Blowdown Drum material selection" :
   - Sujet : *"Should we consider SS for the blowdown drum given corrosive service?"*
   - 2 commentaires : Jean Martin (recommande CS), Admin Zen (confirme avec ref LESER)
4. **Ajouter un commentaire** : taper *"Confirmed with vendor LESER — CS + 3mm CA approved for this service"*
5. Observer la discussion "Feed Loop Pump vendor selection" — liée directement à l'équipement 125-PR-601 A

### Résultat attendu
- Discussions avec threading (commentaires)
- Contexte équipement attaché (lien direct vers la fiche)
- Auteur + date affichés sur chaque entrée

### Point de vente
**Les discussions sont contextualisées par équipement — l'historique des décisions techniques reste permanent dans le projet.**

---

## Module 09 — Registre de documents

**Durée** : 8 min | **URL** : `http://localhost:3001/document-register`  ⭐⭐

### Objectif
Montrer le registre officiel des documents techniques avec suivi de révision et statut.

### Étapes

1. Naviguer vers `/document-register`
2. Observer les **3 documents enregistrés** :

| N° Document | Titre | Discipline | Rév. | Statut |
|---|---|---|---|---|
| ZG-125-PRC-001 | Process Flow Diagram - Unit U_A | PROCESS | B | APPROVED ✅ |
| ZG-125-PRC-002 | P&ID - Catalyst Filtration Section | PROCESS | A | FOR_REVIEW 🔄 |
| ZG-125-MEC-001 | Datasheet - Blowdown Drum 125-VV-601 | MECHANICAL | A | DRAFT 📝 |

3. **Créer un nouveau document** :
   - N° : `ZG-125-MEC-002`
   - Titre : `Datasheet - Feed Loop Pump 125-PR-601`
   - Discipline : MECHANICAL
   - Révision : A
   - Statut : DRAFT
4. **Changer le statut** de ZG-125-MEC-001 de DRAFT → FOR_REVIEW
5. Expliquer le cycle de vie : DRAFT → FOR_REVIEW → APPROVED / REJECTED / CANCELLED

### Résultat attendu
- Tableau de bord documentaire avec tous les statuts
- Création et mise à jour en temps réel
- Cycle de révision respecté

### Point de vente
**Le registre de documents est la colonne vertébrale du Doc Control — conforme aux standards industriels IEC/ISO avec traçabilité des révisions.**

---

## Module 10 — Upload & partage de documents

**Durée** : 5 min | **URL** : `http://localhost:3001/documents`

### Objectif
Montrer le système de fichiers MinIO S3 avec upload et presigned URLs.

### Étapes

1. Naviguer vers `/documents`
2. Observer les fichiers uploadés pour le projet
3. **Uploader un fichier** : cliquer "Upload", sélectionner un PDF (ex. une datasheet)
   - Le fichier est stocké dans MinIO (S3-compatible)
   - Métadonnées : nom, taille, type MIME, uploader, date
4. **Télécharger** le fichier → observe la presigned URL générée (expire après 1h)
5. Montrer l'URL MinIO : `http://localhost:9000/zengineering-files/...`

### API à montrer
```
POST /api/documents/upload         → multipart upload → stockage MinIO
GET  /api/documents/:id/download   → presigned URL temporaire (S3)
GET  /api/documents?projectId=xxx  → liste des fichiers du projet
```

### Résultat attendu
- Upload multipart fonctionnel
- Presigned URL temporaire générée
- Fichiers listés avec métadonnées

### Point de vente
**Stockage cloud-native S3 (MinIO) — déployable on-premise sur Synology NAS, AWS S3, ou Azure Blob Storage sans changer une ligne de code.**

---

## Module 11 — Transmittals

**Durée** : 5 min | **URL** : `http://localhost:3001/transmittals`  ⭐

### Objectif
Montrer la création et suivi de transmittals (envois officiels de documents à des tiers).

### Étapes

1. Naviguer vers `/transmittals`
2. Observer le **transmittal existant** MONCHE-TR-001 :
   - Sujet : *Process Flow Diagrams - For Review*
   - Destinataire : Dr. Sarah Chen (`sarah.chen@licensortech.com`) — Licensor
   - Objet : FOR_REVIEW
   - Statut : SENT (envoyé le 10/02/2026)
   - Documents inclus : ZG-125-PRC-001 (Rev B), ZG-125-PRC-002 (Rev A)
3. **Ouvrir le transmittal** MONCHE-TR-001 :
   - Voir la lettre de couverture : *"Please find attached the process flow diagrams for Unit U_A. Kindly review and provide your comments within 2 weeks."*
   - Voir les documents attachés avec remarques
4. **Créer un nouveau transmittal** (optionnel) :
   - Aller sur `/transmittals/new`
   - Destinataire : Pierre Lemoine / EPC Global Engineering
   - Ajouter ZG-125-MEC-001

### Résultat attendu
- Liste des transmittals avec statut (DRAFT/SENT)
- Détail avec lettre de couverture et liste des documents
- Lien direct vers le registre de documents

### Point de vente
**Les transmittals formalisent les envois officiels à clients/partenaires/licenciers — traçabilité complète de qui a reçu quoi et quand.**

---

## Module 12 — Inbox emails & Whitelist

**Durée** : 8 min | **URL** : `http://localhost:3001/incoming-emails`  ⭐⭐⭐

### Objectif
Démontrer la capture automatique des emails techniques et le système de whitelist.

### Étapes

1. Naviguer vers `/incoming-emails`
2. Observer le **statut IMAP** (indicateur en haut de page) :
   - Configuré : `imap-mail.outlook.com:993`
   - Polling actif toutes les 5 minutes
3. Observer les **emails capturés** (si disponibles) :
   - De : externe (ex. licensor, EPC)
   - Sujet contenant tag projet ou mot-clé
   - Statuts : UNREAD, READ, ARCHIVED, ACTIONED
4. **Whitelist** — Naviguer vers le sous-onglet Whitelist :
   - Observer les expéditeurs autorisés du projet
   - **Ajouter un domaine** : `licensortech.com` (label: Licensor Technologies)
   - → Tous les emails de `@licensortech.com` seront auto-acceptés
   - **Ajouter un email spécifique** : `p.lemoine@epcglobal.fr` (label: EPC Lead)
5. Montrer les **règles de routage** (`GET /api/incoming-emails/rules/project/:id`)
6. Expliquer : *"Un email de sarah.chen@licensortech.com avec 'U_A' dans le sujet est automatiquement rattaché au projet et classifié comme communication technique."*

### API à montrer
```
GET  /api/incoming-emails/status              → statut IMAP
GET  /api/incoming-emails?projectId=xxx       → emails filtrés
GET  /api/incoming-emails/whitelist?projectId=xxx → expéditeurs autorisés
POST /api/incoming-emails/whitelist           → ajouter expéditeur/domaine
DELETE /api/incoming-emails/whitelist/:id     → supprimer
```

### Résultat attendu
- Statut IMAP visible (configuré/non configuré)
- Liste des emails avec filtres
- CRUD whitelist fonctionnel
- Propositions de documents auto-générées depuis emails (voir Module 13)

### Point de vente
**Aucune email technique ne se perd — capture IMAP automatique, classification intelligente, propositions de document auto-générées. Zéro saisie manuelle.**

---

## Module 13 — Propositions de documents

**Durée** : 5 min | **URL** : `http://localhost:3001/document-proposals`

### Objectif
Montrer comment les emails entrants génèrent automatiquement des propositions d'ajout au registre de documents.

### Étapes

1. Naviguer vers `/document-proposals`
2. Observer les propositions en statut **PENDING**
   - Générées automatiquement depuis les emails entrants contenant des pièces jointes
3. **Accepter une proposition** : cliquer "Accepter" → le document est créé dans le registre
4. **Rejeter une proposition** : cliquer "Rejeter" avec motif
5. Expliquer le flux : *"Email entrant → pièce jointe détectée → proposition PENDING → validation humaine → registre de documents"*

### API
```
GET  /api/document-proposals?projectId=xxx&status=PENDING
PATCH /api/document-proposals/:id  { action: 'accept' | 'reject' }
```

### Résultat attendu
- Liste des propositions PENDING/ACCEPTED/REJECTED
- Transition vers le registre après acceptation
- Traçabilité de l'email source

### Point de vente
**Le Document Control est semi-automatisé — les emails techniques alimentent directement le registre sans re-saisie manuelle.**

---

## Module 14 — Traçabilité AGO / Data Origin

**Durée** : 5 min | **URL** : `http://localhost:3001/ago-report`  ⭐⭐

### Objectif
Montrer la traçabilité d'origine des données techniques ("Approved & Guaranteed Origin").

### Contexte
AGO (Approved & Guaranteed Origin) est un concept clé en Engineering : chaque valeur technique (pression, température, matériau…) doit être traçable jusqu'à sa source (datasheet fournisseur, calcul ingénieur, standard projet…).

### Étapes

1. Naviguer vers `/ago-report`
2. Observer les données de traçabilité par équipement
3. Sur la fiche équipement 125-VV-601, onglet **Data Origin** :
   - Pression design : 3.5 barg — source : "P&ID Rev A"
   - Température design : 120°C — source : "Process datasheet"
   - Matériau : CS + 3mm CA — source : "Engineering Specification"
4. **Vérification de staleness** : si la source a changé depuis la dernière mise à jour, l'indicateur passe au rouge
5. **Historique de champ** : cliquer sur une valeur → voir toutes les révisions avec auteur et date

### API
```
GET  /api/data-origins?equipmentId=xxx    → origines par équipement
POST /api/data-origins                    → enregistrer une origine
GET  /api/data-origins/:id/history        → historique des modifications
```

### Résultat attendu
- Origine affichée pour chaque donnée technique
- Indicateur de fraîcheur (fresh / stale)
- Historique complet des modifications

### Point de vente
**Conformité réglementaire assurée — chaque valeur technique est traçable jusqu'à sa source approuvée. Inestimable pour les audits HAZOP/ATEX.**

---

## Module 15 — Articles de contrat

**Durée** : 4 min | **URL** : `http://localhost:3001/contract-requirements`

### Objectif
Gérer les exigences contractuelles et leurs modifications.

### Étapes

1. Naviguer vers `/contract-requirements`
2. Observer les **exigences contractuelles** (contract items) :
   - Exigences techniques importées depuis le contrat
   - Statut : OPEN, IN_PROGRESS, CLOSED
3. Naviguer vers `/contract-change-log`
4. Observer le **journal des modifications** contractuelles (change log)
5. Montrer l'import Excel (si disponible)

### API
```
GET  /api/contract-items?projectId=xxx   → liste des exigences
GET  /api/contract-items/change-log?projectId=xxx → journal des modifications
POST /api/contract-items/import          → import depuis Excel
```

### Résultat attendu
- Liste des exigences avec statut
- Change log horodaté
- Import Excel possible

### Point de vente
**Les exigences contractuelles sont trackées directement dans l'outil — fini les Excel perdus dans les boîtes mail.**

---

## Module 16 — Recherche globale

**Durée** : 3 min | **URL** : `http://localhost:3001/search`

### Objectif
Montrer la recherche full-text multi-entités.

### Étapes

1. Naviguer vers `/search`
2. Taper **"pump"** dans la barre de recherche
3. Observer les résultats multi-entités :
   - Équipements : 125-PR-601 A, 125-PR-601 B, 125-PR-602 A…
   - Discussions : "Feed Loop Pump vendor selection"
   - Documents : "Datasheet - Feed Loop Pump"
4. Taper **"125-VV"** → résultats filtrés sur les vessels
5. **Sauvegarder une recherche** : cliquer "Sauvegarder" → la recherche est mémorisée
6. Observer les **recherches sauvegardées** dans le panneau gauche
7. **Épingler** une recherche pour accès rapide

### API
```
GET /api/search?projectId=xxx&q=pump         → recherche multi-entités
POST /api/search/saved                        → sauvegarder une recherche
GET  /api/search/saved?projectId=xxx          → recherches sauvegardées
PATCH /api/search/saved/:id/pin               → épingler
```

### Résultat attendu
- Résultats multi-entités en temps réel
- Sauvegarde et épinglage des recherches fréquentes

### Point de vente
**Retrouver n'importe quelle information en 2 secondes — équipement, document, discussion — quelle que soit la taille du projet.**

---

## Module 17 — Audit & Conformité

**Durée** : 4 min | **URL** : `http://localhost:3001/audit`  ⭐

### Objectif
Montrer le journal d'audit complet pour la conformité.

### Étapes

1. Naviguer vers `/audit`
2. Observer le **journal d'audit du projet** :
   - Toutes les actions sont loguées : création, modification, suppression
   - Champ modifié + ancienne valeur + nouvelle valeur
   - Utilisateur + horodatage
3. **Filtrer par entité** : sélectionner "Equipment" → voir toutes les modifications d'équipements
4. **Filtrer par utilisateur** : sélectionner "Marie Dupont"
5. **Filtrer par date** : actions de la semaine passée
6. API : `GET /api/audit/project/:id` → tableau JSON complet exportable

### Résultat attendu
- Toutes les modifications tracées automatiquement
- Filtres par entité, utilisateur, date
- Export CSV disponible

### Point de vente
**Audit trail ISO-conforme sans aucune configuration — chaque modification est automatiquement enregistrée, impossible à effacer, exportable pour audit externe.**

---

## Module 18 — Export CSV

**Durée** : 3 min

### Objectif
Montrer les capacités d'export pour reporting et audit externe.

### Étapes

1. Depuis la page **Equipment** : cliquer le bouton "Export CSV" → téléchargement immédiat
2. Ouvrir le CSV → 27 lignes avec toutes les données techniques
3. Depuis **Document Register** : Export CSV → registre complet
4. Depuis **Audit** : Export CSV → journal d'audit complet

### Exports disponibles
```
GET /api/export/project/:id/equipment          → Liste équipements (CSV)
GET /api/export/project/:id/document-register  → Registre documents (CSV)
GET /api/export/project/:id/audit              → Journal d'audit (CSV)
GET /api/export/project/:id/discussions        → Discussions (CSV)
GET /api/export/project/:id/transmittals       → Transmittals (CSV)
GET /api/export/project/:id/workflows          → Workflows (CSV)
```

### Résultat attendu
- CSV bien formaté, headers propres
- Compatible Excel/LibreOffice
- Toutes les données disponibles sans accès base de données

### Point de vente
**Export instantané vers Excel pour les rapports clients, audits et analyses offline — aucun accès base de données requis.**

---

## Module 19 — Notifications temps réel

**Durée** : 2 min

### Objectif
Montrer les notifications push en temps réel via SSE (Server-Sent Events).

### Étapes

1. Ouvrir les DevTools → onglet Network → filtrer "EventStream"
2. Observer la connexion SSE persistante vers `GET /api/notifications/stream`
3. Dans un autre onglet, avancer un workflow ou modifier un équipement
4. Observer l'arrivée en temps réel de la notification dans le stream SSE
5. L'icône cloche dans l'interface se met à jour sans rechargement de page

### API
```
GET /api/notifications/stream   → Server-Sent Events (text/event-stream)
```

### Résultat attendu
- Connexion SSE maintenue
- Notifications reçues en push (pas de polling)
- Interface mise à jour sans reload

### Point de vente
**Collaboration temps réel — toute l'équipe est notifiée instantanément des approbations, modifications et nouveaux documents.**

---

## Module 20 — Gestion fournisseurs

**Durée** : 3 min | **URL** : `http://localhost:3001/vendors`

### Objectif
Présenter la Vendor List complète avec spécialités et rattachement projet.

### Étapes

1. Naviguer vers `/vendors`
2. Observer la **liste globale de fournisseurs** (100+ vendors importés de la vendor list industrielle)
3. **Filtrer par spécialité** : sélectionner "Centrifugal Pumps"
   - Résultats : SULZER, ENSIVAL MORET, FINDER POMPES, FLOWSERVE, ITT GOULDS, KSB…
4. Observer les **fournisseurs du projet** (3 sélectionnés) :
   - SULZER — Selected for centrifugal pumps
   - MOUVEX — Under evaluation for gear pumps
   - LESER — Selected for pressure safety valves
5. Montrer la **fiche fournisseur** MOUVEX : France, spécialité Reciprocating Pumps

### Résultat attendu
- Liste complète avec filtres par spécialité et pays
- Distinction vendors globaux / vendors sélectionnés pour le projet
- Notes spécifiques par projet

### Point de vente
**La Vendor List approuvée est centralisée et partagée entre projets — respecte les standards de qualification fournisseurs ISO 9001.**

---

## Module 21 — Profil utilisateur

**Durée** : 2 min | **URL** : `http://localhost:3001/profile`

### Étapes

1. Naviguer vers `/profile`
2. Observer les informations du compte connecté :
   - Nom, email, rôle, discipline
3. **Modifier le nom** : changer "Admin Zen" → "Pascal Gorisse" → sauvegarder
4. **Changer le mot de passe** : taper un mauvais mot de passe actuel → observer l'erreur 401
5. **Correct** : remettre le vrai mot de passe (`Password123!`) pour tester le changement

### API
```
PATCH /api/auth/profile   { name, phone }        → mise à jour profil
PATCH /api/auth/password  { currentPassword, newPassword }  → changement mdp
GET   /api/auth/me                                → infos utilisateur connecté
```

### Résultat attendu
- Modification du profil en temps réel
- Validation du mot de passe actuel avant changement
- Erreur 401 si mot de passe incorrect

### Point de vente
**Chaque utilisateur gère son profil en autonomie — sécurité renforcée avec validation de l'ancien mot de passe.**

---

## Récapitulatif & Arguments commerciaux

### Ce que vous venez de voir

| Domaine | Fonctionnalité | Valeur |
|---|---|---|
| 🔧 **Ingénierie** | Liste équipements 27 items + fiches techniques | Référentiel technique central |
| 🔄 **Workflow** | 3 circuits configurables en JSON | Zéro licence, 100% adaptable |
| 📄 **Documents** | Registre + upload MinIO + transmittals | Traçabilité documentaire complète |
| 📧 **Emails** | IMAP polling + whitelist + propositions | Zéro email perdu |
| 🔍 **Data Origin** | AGO par champ, staleness check | Conformité HAZOP/ATEX |
| 📊 **Reporting** | Dashboard + audit trail + export CSV | Audit externe en 1 clic |
| ⚡ **Temps réel** | SSE notifications | Équipe synchronisée instantanément |

### Les 5 arguments clés

1. **Moteur workflow maison — zéro licence**
   Camunda BPM coûte 20 000€+/an en licence enterprise. Zen-gineering inclut un moteur équivalent, configurable en JSON, sans coût additionnel.

2. **IMAP intégré — capture automatique des emails**
   Les emails techniques de licenciers, clients et EPC sont capturés automatiquement, classifiés et convertis en propositions de documents. Zéro risque de perte d'information.

3. **Traçabilité AGO — conformité réglementaire**
   Chaque valeur technique est traçable jusqu'à sa source approuvée. Standard incontournable pour les projets soumis à HAZOP, ATEX, et audits réglementaires.

4. **Audit trail complet — toutes actions loguées**
   Impossible de modifier une donnée sans laisser une trace. Conformité ISO 9001 et réglementaire out-of-the-box.

5. **Architecture cloud-native — déploiement flexible**
   MinIO S3, SSE temps réel, JWT, Docker. Déployable sur Synology NAS, serveur dédié, ou cloud AWS/Azure sans adaptation.

### Investissement & ROI

- **Élimination Camunda** : économie immédiate de 20 000€/an
- **Réduction saisies manuelles** : -40% du temps Doc Control grâce à l'automatisation IMAP
- **Audit immédiat** : 0h de préparation pour un audit externe (tout est déjà tracé)
- **Formation** : interface intuitive, formation équipe < 2h

---

*Guide généré pour Zen-gineering v3.2 — Février 2026*
*Scénario : Mon Chemical Plant — Unit U_A | Client : Alphahexol Industries*
