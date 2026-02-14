# Zen-gineering

**Application collaborative de gestion de projets industriels**

## 📋 Description

Zen-gineering est une application web collaborative destinée à la gestion de projets industriels impliquant différents corps de métiers (chefs de projet, acheteurs, process, électriciens, instrumentistes, etc.) ainsi que des parties prenantes externes (clients, fournisseurs).

### Objectifs principaux

- 🗂️ Centraliser la gestion documentaire des projets
- 🤝 Faciliter la collaboration entre les différents intervenants
- ⚙️ Automatiser la collecte et la validation des données techniques
- 📊 Assurer la traçabilité des échanges et des décisions
- 📈 Fournir des états et documents de synthèse pour le pilotage et le reporting

## 🚀 Fonctionnalités principales

### 👥 Gestion des utilisateurs
- Authentification sécurisée avec rôles et permissions
- Profils métiers : Chef de projet, Achat, Process, Électricien, Instrumentiste, etc.
- Gestion des accès par projet et par statut (employé, client, fournisseur)

### 📁 Gestion de projets
- Création et organisation de projets avec arborescence de phases/lots
- **Configuration de processus métiers personnalisés**
- Workflows d'échange de données et de validation configurables
- Tableau de bord par projet avec indicateurs de performance

### 📧 Système de gestion des emails
- Intégration IMAP/SMTP avec extraction automatique des pièces jointes
- Classement intelligent avec métadonnées (date, émetteurs, récepteurs, objet)
- Liaison automatique aux projets et déclenchement des workflows

### ✅ Système de validation
- Workflows de validation configurables par projet et par type de document
- Niveaux de validation multi-disciplines
- Traçabilité complète avec audit trail
- Alertes et escalades automatiques

### 💬 Communication interne
- Chat en temps réel entre participants
- Canaux par projet et par thématique
- Partage de fichiers et mentions

### 🔧 Outils métiers
- **Module Électrique** : liste de consommateurs, bilans de puissance, dimensionnement
- **Module Instrumentation** : gestion des instruments et boucles de régulation
- **Module Process** : schémas PID, bilans matière/énergie
- **Module Achats** : suivi des commandes, comparaison fournisseurs, circuit d'approbation
- **Module Chef de Projet** : planning Gantt, gestion des risques, reporting

### 📊 Reporting et synthèse
- Génération automatique de rapports d'avancement
- Documents de synthèse technique (cahiers des charges, listes d'équipements)
- Tableaux de bord interactifs par profil
- Rapports de conformité aux processus
- Export multi-formats (PDF, Excel, Word, PowerPoint)

## 🏗️ Architecture technique

### Stack technologique (proposée)

**Frontend**
- React / Vue.js / Angular
- Progressive Web App (PWA)
- WebSockets pour temps réel

**Backend**
- Node.js / Python Django / Java Spring
- Moteur de workflow (Activiti, Camunda)
- API REST + Webhooks

**Base de données**
- PostgreSQL / MySQL (données structurées)
- MongoDB (documents)
- Redis (cache)

**Infrastructure**
- AWS S3 / Azure Blob (stockage fichiers)
- Docker / Kubernetes (containerisation)
- CI/CD avec GitHub Actions

## 📂 Structure du projet

```
Zen-gineering/
├── docs/                    # Documentation complète
│   ├── cahier-des-charges.md
│   ├── architecture.md
│   ├── processus/          # Documentation des processus métiers
│   └── api/                # Documentation API
├── frontend/               # Application cliente
├── backend/                # Services backend
├── workflows/              # Définitions de processus (BPMN)
├── database/               # Schémas et migrations
├── tests/                  # Tests automatisés
├── scripts/                # Scripts utilitaires
└── deployment/             # Configuration déploiement
```

## 🚦 Statut du projet

🟡 **En phase de cadrage** - Spécifications en cours

## 🛠️ Installation

*À venir - Instructions d'installation détaillées*

## 📖 Documentation

La documentation complète est disponible dans le dossier [`docs/`](./docs/).

- [Cahier des charges](./docs/cahier-des-charges.md)
- [Guide d'architecture](./docs/architecture.md)
- [Configuration des processus](./docs/processus/README.md)
- [Documentation API](./docs/api/README.md)

## 🤝 Contribution

*À venir - Guide de contribution*

## 📜 Licence

*À définir*

## 📞 Contact

*À compléter*

---

**Version** : 0.1.0  
**Date de création** : Février 2026
