# Zen-gineering v3.3 — Package de déploiement NAS

## Contenu du package

```
nas-deploy-v3.3/
├── docker-compose.yml          ← Orchestration des 6 services
├── .env.example                ← Configuration à copier en .env
├── install.sh                  ← Script d'installation automatique
├── zengineering-v3.3-nas.tar.gz ← Images Docker (généré par build)
└── README.md                   ← Ce fichier
```

## Services démarrés

| Service | Port | Description |
|---|---|---|
| Frontend (app) | **8080** | Interface utilisateur React |
| Portfolio | **8081** | Site vitrine |
| API Backend | interne | NestJS REST API |
| PostgreSQL | interne | Base de données |
| MinIO | **9001** | Console administration fichiers |
| MailHog | **8025** | Interface emails de test |

## Installation rapide

```bash
# 1. Copier tous les fichiers sur le NAS (ex: /volume1/docker/zengineering/)
# 2. Se connecter en SSH au NAS
ssh admin@NAS_IP

# 3. Aller dans le dossier
cd /volume1/docker/zengineering

# 4. Lancer l'installation
bash install.sh
```

## Mise à jour depuis une version précédente

```bash
# Arrêter les services
docker compose down

# Charger les nouvelles images
docker load < zengineering-v3.3-nas.tar.gz

# Relancer (les données sont préservées dans les volumes)
docker compose up -d

# Appliquer les migrations si nécessaire
docker exec zeng-backend npx prisma migrate deploy
```

## Credentials par défaut

| Utilisateur | Email | Mot de passe | Rôle |
|---|---|---|---|
| Admin | admin@zengineering.local | Password123! | Administrateur |
| Chef de Projet | chef.projet@zengineering.local | Password123! | Manager |
| Ingénieur | ingenieur@zengineering.local | Password123! | Member |

## Sauvegardes

Les données sont dans des volumes Docker nommés :
- `postgres_data` — base de données
- `minio_data` — fichiers uploadés

```bash
# Sauvegarde PostgreSQL
docker exec zeng-postgres pg_dump -U zengineering zengineering > backup-$(date +%Y%m%d).sql

# Sauvegarde MinIO (via mc client ou copie du volume)
docker run --rm -v zeng-minio-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/minio-backup-$(date +%Y%m%d).tar.gz /data
```

## Nouveautés v3.3

- Guide de démonstration client complet (DEMO-GUIDE.md)
- Script de test interactif (demo-runner.mjs — 90 tests, 21 modules)
- Portfolio mis à jour avec toutes les fonctionnalités v3.2
- Fix logging IMAP (affichage du code d'erreur serveur complet)
- Fix ordre des routes whitelist dans le contrôleur email

## Version

- **Backend** : pascal1010/zengineering-backend:v3.3
- **Frontend** : pascal1010/zengineering-frontend:v3.3
- **Portfolio** : pascal1010/zengineering-portfolio:v3.3
- **Date** : Février 2026
