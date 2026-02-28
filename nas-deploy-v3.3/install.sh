#!/bin/bash
# ============================================================
# Zen-gineering v3.3 — Script d'installation NAS
# Usage : bash install.sh
# ============================================================

set -e

VERSION="v3.3"
TAR_FILE="zengineering-v3.3-nas.tar.gz"

echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   ZEN-GINEERING $VERSION — Installation NAS         ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""

# ── 1. Vérifications ─────────────────────────────────────
echo "► Vérification des prérequis..."
command -v docker >/dev/null 2>&1 || { echo "❌  Docker non trouvé. Installez Docker avant de continuer."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌  docker compose non trouvé."; exit 1; }
echo "   ✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

# ── 2. Chargement des images ──────────────────────────────
if [ -f "$TAR_FILE" ]; then
  echo ""
  echo "► Chargement des images Docker depuis $TAR_FILE..."
  docker load < "$TAR_FILE"
  echo "   ✅ Images chargées"
else
  echo ""
  echo "► Le fichier $TAR_FILE est absent — utilisation des images Docker Hub..."
  docker pull pascal1010/zengineering-backend:$VERSION
  docker pull pascal1010/zengineering-frontend:$VERSION
  docker pull pascal1010/zengineering-portfolio:$VERSION
  echo "   ✅ Images téléchargées depuis Docker Hub"
fi

# ── 3. Fichier .env ───────────────────────────────────────
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  Fichier .env créé depuis .env.example"
    echo "   → Éditez .env pour configurer vos mots de passe et paramètres IMAP"
  fi
fi

# ── 4. Démarrage ──────────────────────────────────────────
echo ""
echo "► Démarrage des services..."
docker compose up -d

echo ""
echo "► Attente que PostgreSQL soit prêt..."
sleep 8

# ── 5. Migration base de données ──────────────────────────
echo ""
echo "► Migration de la base de données..."
docker exec zeng-backend npx prisma migrate deploy 2>/dev/null || echo "   (migration déjà appliquée)"

# ── 6. Seed (première installation uniquement) ────────────
SEED_FLAG=".seeded"
if [ ! -f "$SEED_FLAG" ]; then
  echo ""
  echo "► Initialisation des données de démo (première installation)..."
  docker exec zeng-backend node dist/prisma/seed.js 2>/dev/null && touch "$SEED_FLAG" || echo "   (seed ignoré)"
fi

# ── 7. Résumé ─────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════╗"
echo "║   Installation terminée — Zen-gineering $VERSION   ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  Application  : http://NAS_IP:8080              ║"
echo "║  Portfolio    : http://NAS_IP:8081              ║"
echo "║  API (Swagger): http://NAS_IP:8080/api/docs     ║"
echo "║  MinIO console: http://NAS_IP:9001              ║"
echo "║  MailHog UI   : http://NAS_IP:8025              ║"
echo "╠══════════════════════════════════════════════════╣"
echo "║  admin@zengineering.local  /  Password123!      ║"
echo "╚══════════════════════════════════════════════════╝"
echo ""
