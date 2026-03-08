# Zen-gineering V3.4 — Déploiement NAS Synology

## Prérequis

- Docker (Container Manager) installé sur le NAS via Centre de paquets Synology
- Accès SSH ou accès à l'interface Docker du NAS

## Images Docker utilisées

| Image | Tag | Taille |
|-------|-----|--------|
| pascal1010/zengineering-backend | v3.4 | ~850 MB |
| pascal1010/zengineering-frontend | v3.4 | ~63 MB |
| postgres | 15-alpine | ~240 MB |
| minio/minio | latest | ~170 MB |
| mailhog/mailhog | latest | ~12 MB |

## Déploiement (méthode Docker Compose)

### Option A — Pull depuis Docker Hub (recommandé)

Copier uniquement le fichier `docker-compose.nas.yml` sur le NAS, puis :

```bash
# En SSH sur le NAS
cd /volume1/docker/zengineering
docker compose -f docker-compose.nas.yml pull    # télécharge les images
docker compose -f docker-compose.nas.yml up -d   # lance l'application
```

### Option B — Import depuis archive TAR (sans internet)

Si vous avez le fichier `zengineering-v3.4-nas.tar.gz` :

```bash
# En SSH sur le NAS
cd /volume1/docker/zengineering
docker load < zengineering-v3.4-nas.tar.gz       # charge les images (5-10 min)
docker compose -f docker-compose.nas.yml up -d   # lance l'application
```

## Accès à l'application

Remplacez `[IP-NAS]` par l'adresse IP de votre NAS (ex: 192.168.1.100) :

| Service | URL |
|---------|-----|
| **Application** | http://[IP-NAS]:8080 |
| Portfolio | http://[IP-NAS]:8081 |
| MinIO Console | http://[IP-NAS]:9001 (minioadmin / ZenG_Minio_2026!) |
| MailHog | http://[IP-NAS]:8025 |

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | admin@zengineering.local | Password123! |
| Chef de Projet | chef.projet@zengineering.local | Password123! |
| Ingénieur | ingenieur@zengineering.local | Password123! |

## Vérification

```bash
docker ps
# Vous devez voir 5 conteneurs "Up" :
# zeng-postgres, zeng-minio, zeng-mailhog, zeng-backend, zeng-frontend
```

## Mise à jour vers une version ultérieure

```bash
docker compose -f docker-compose.nas.yml down
docker compose -f docker-compose.nas.yml pull    # télécharge les nouvelles images
docker compose -f docker-compose.nas.yml up -d
```

> Les données (volumes postgres_data, minio_data) sont conservées lors des mises à jour.

## Sauvegarde des données

```bash
# Sauvegarde base de données
docker exec zeng-postgres pg_dump -U zengineering zengineering > backup_$(date +%Y%m%d).sql

# Restauration
docker exec -i zeng-postgres psql -U zengineering zengineering < backup_20260308.sql
```

## Arrêt

```bash
docker compose -f docker-compose.nas.yml down    # arrête sans supprimer les données
docker compose -f docker-compose.nas.yml down -v # arrête ET supprime les données (⚠️)
```
