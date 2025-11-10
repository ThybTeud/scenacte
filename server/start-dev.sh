#!/bin/bash

echo "🚀 Démarrage des services de développement..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier et démarrer PostgreSQL
echo -e "${BLUE}[1/3] Vérification de PostgreSQL...${NC}"
if ! su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main status" &>/dev/null; then
  echo -e "${YELLOW}  ⚠ PostgreSQL n'est pas démarré, démarrage en cours...${NC}"
  su - postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main -l /var/lib/postgresql/logfile start" &>/dev/null
  sleep 2
  echo -e "${GREEN}  ✓ PostgreSQL démarré${NC}"
else
  echo -e "${GREEN}  ✓ PostgreSQL déjà en cours d'exécution${NC}"
fi

# 2. Vérifier et démarrer MailDev
echo -e "${BLUE}[2/3] Vérification de MailDev...${NC}"
if ! pgrep -f "maildev" > /dev/null; then
  echo -e "${YELLOW}  ⚠ MailDev n'est pas démarré, démarrage en cours...${NC}"
  maildev --smtp 1025 --web 1080 > /dev/null 2>&1 &
  sleep 2
  echo -e "${GREEN}  ✓ MailDev démarré (SMTP: 1025, Web: http://localhost:1080)${NC}"
else
  echo -e "${GREEN}  ✓ MailDev déjà en cours d'exécution${NC}"
fi

# 3. Démarrer le serveur Node.js
echo -e "${BLUE}[3/3] Démarrage du serveur Node.js...${NC}"
npm run dev
