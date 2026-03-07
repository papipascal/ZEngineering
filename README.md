# Zengineering V4.0 — IA Orchestrator 🧠

> **Claude AI en tête de pont** avec 8 skills spécialisés pour piloter votre projet Zengineering en langage naturel.

---

## 🚀 Démarrage rapide

### 1. Prérequis
- Node.js 20+
- Clé API Anthropic (https://console.anthropic.com)

### 2. Installation

```bash
# Cloner / ouvrir dans VS Code
code .vscode/zengineering.code-workspace

# Installer toutes les dépendances
npm run install:all

# Configurer l'environnement
cp .env.example .env
# → Éditer .env et renseigner ANTHROPIC_API_KEY
```

### 3. Lancer

```bash
# Option A — Via VS Code Tasks (Ctrl+Shift+B)
# → Sélectionner "🚀 Start Full Stack"

# Option B — Terminal
npm run dev
# Backend  : http://localhost:3001
# Frontend : http://localhost:5173
```

---

## 🏗️ Architecture

```
zengineering-v4/
├── .vscode/
│   └── zengineering.code-workspace   # Workspace multi-dossiers
├── backend/
│   └── src/
│       ├── server.js                 # Express entry point
│       ├── orchestrator.js           # Claude AI + boucle agentic
│       ├── routes/
│       │   └── api.js                # Endpoints REST
│       ├── skills/
│       │   └── index.js              # 8 skills + tools definitions
│       └── data/
│           └── mockProject.js        # Données projet Zengineering
├── frontend/
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Composant principal + chat
│       ├── hooks/
│       │   └── useChat.js            # Hook API + state
│       ├── components/
│       │   ├── Dashboard.jsx         # Métriques + skills bar
│       │   └── Message.jsx           # Rendu messages + typing
│       └── styles/
│           └── globals.css           # Design system dark
├── .env.example
└── package.json
```

---

## 🧠 Comment ça fonctionne

```
Utilisateur → (langage naturel)
    ↓
Claude AI Orchestrator (claude-sonnet-4-5)
    ↓ analyse l'intention
    ↓ choisit le(s) skill(s)
    ↓
Skills (Tool Use Anthropic)
│  📅 planning_skill    → Sprints, tâches, vélocité
│  ⚠️  risk_skill       → Risques, blocages
│  💻 code_review_skill → PRs, bugs, couverture
│  📄 documentation_skill → Rapports, notes
│  💬 communication_skill → Emails, rapports client
│  💰 finance_skill     → Budget, forecast
│  🧪 qa_skill          → Tests, qualité
│  🚀 deploy_skill      → CI/CD, environnements
    ↓
Claude synthétise en réponse structurée
    ↓
Utilisateur (réponse en markdown)
```

---

## 💬 Exemples de requêtes

```
"État du sprint 3 ?"
"Quels sont les risques critiques ?"
"Budget : on est dans les clous ?"
"Rédige le rapport client de la semaine"
"Qui est en surcharge dans l'équipe ?"
"Qualité du code cette semaine ?"
"Dernier déploiement en prod ?"
"Vue d'ensemble complète du projet"
```

---

## 🔌 API Backend

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/chat` | POST | Envoyer un message à Claude |
| `/api/project` | GET | Données projet complètes |
| `/api/health` | GET | Health check |
| `/api/session/:id` | DELETE | Effacer historique |

---

## 📦 Archive V3

La version précédente est disponible dans `../zengineering-v3/` :
- Présentations PowerPoint d'architecture
- Concept initial Claude + Skills

---

## 🛣️ Roadmap V4

- [x] Claude orchestrateur + 8 skills
- [x] Interface chat React
- [x] Dashboard métriques temps réel
- [ ] Intégration PostgreSQL réelle
- [ ] WebSockets pour streaming réponses
- [ ] Authentification utilisateurs
- [ ] Skills personnalisables par projet
- [ ] Export PDF des rapports générés
