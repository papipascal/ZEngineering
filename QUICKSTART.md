# Quick Start - Zen-gineering

Guide de démarrage rapide pour lancer Zen-gineering en local.

## 🚀 Démarrage rapide avec Docker Compose

### Prérequis

- Docker Desktop installé
- Docker Compose v2+
- 8 GB RAM minimum
- 10 GB d'espace disque

### Étapes

1. **Cloner le repository**

```bash
git clone https://github.com/votre-org/zen-gineering.git
cd zen-gineering
```

2. **Configurer les variables d'environnement**

```bash
cp .env.example .env
# Éditez .env selon vos besoins (optionnel pour dev local)
```

3. **Lancer tous les services**

```bash
docker-compose up -d
```

Cette commande va démarrer :
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Elasticsearch (port 9200)
- MinIO (port 9000, console 9001)
- MailHog (SMTP 1025, UI 8025)
- Backend API (port 3000)
- Frontend (port 3001)

4. **Vérifier que tout fonctionne**

```bash
docker-compose ps
```

Tous les services doivent être "Up"

5. **Accéder à l'application**

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs (Swagger):** http://localhost:3000/api/docs
- **MinIO Console:** http://localhost:9001 (minioadmin/minioadmin)
- **MailHog:** http://localhost:8025

6. **Créer un compte admin**

```bash
# Depuis un autre terminal
docker-compose exec backend npm run seed:admin
```

Identifiants par défaut :
- Email: admin@zengineering.local
- Password: Admin123!

## 🛠️ Développement local sans Docker

Si vous préférez développer sans Docker :

### Backend

```bash
cd backend
npm install
# Configure DATABASE_URL in .env (already set for local dev)
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configurez REACT_APP_API_URL
npm start
```

### Services externes requis

Vous devrez installer localement :
- PostgreSQL 15+
- MongoDB 7+
- Redis 7+
- Elasticsearch 8+ (optionnel)
- MinIO ou compte AWS S3

## 📊 Données de test

Pour charger des données de test :

```bash
docker-compose exec backend npm run seed:demo
```

Cela créera :
- 5 utilisateurs de test
- 3 projets exemple
- Documents et workflows de démonstration

## 🧪 Lancer les tests

### Backend

```bash
docker-compose exec backend npm test
```

### Frontend

```bash
docker-compose exec frontend npm test
```

### Tests E2E

```bash
npm run test:e2e
```

## 🔍 Vérification de santé

### Health checks

```bash
# Backend
curl http://localhost:3000/health

# Base de données
docker-compose exec postgres pg_isready
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

## 📝 Logs

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🛑 Arrêter les services

```bash
# Arrêter sans supprimer les volumes
docker-compose stop

# Arrêter et supprimer les containers
docker-compose down

# Supprimer aussi les volumes (⚠️ perte de données)
docker-compose down -v
```

## 🔄 Mise à jour

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## 🐛 Troubleshooting

### Port déjà utilisé

Si un port est déjà utilisé, modifiez `docker-compose.yml` :

```yaml
ports:
  - "3002:3000"  # Backend sur 3002 au lieu de 3000
```

### Problèmes de connexion base de données

```bash
# Réinitialiser les volumes
docker-compose down -v
docker-compose up -d
```

### Build qui échoue

```bash
# Rebuild sans cache
docker-compose build --no-cache
```

### Espace disque insuffisant

```bash
# Nettoyer les images Docker
docker system prune -a
```

## 📚 Prochaines étapes

1. Lisez la [documentation complète](./docs/README.md)
2. Consultez le [guide de contribution](./CONTRIBUTING.md)
3. Explorez l'[architecture](./docs/architecture.md)
4. Configurez vos premiers [processus](./docs/processus/README.md)

## 💬 Support

- GitHub Issues : Pour les bugs et feature requests
- Documentation : [docs/](./docs/)
- Email : support@zengineering.local

## 🎯 Checklist de démarrage

- [ ] Docker Compose lancé
- [ ] Services tous "Up"
- [ ] Frontend accessible
- [ ] Backend API répond
- [ ] Compte admin créé
- [ ] Données de test chargées
- [ ] Tests passent

Bienvenue dans Zen-gineering ! 🎉
