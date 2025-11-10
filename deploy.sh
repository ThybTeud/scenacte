#!/bin/bash

# Script de déploiement pour alwaysdata.net
# Ce script doit être exécuté sur le serveur alwaysdata via SSH

set -e  # Arrêter en cas d'erreur

echo "🚀 Démarrage du déploiement de Scenacte..."

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier qu'on est dans le bon dossier
if [ ! -f "package.json" ] && [ ! -d "server" ]; then
  echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
  exit 1
fi

# 1. Mise à jour du code
echo -e "${BLUE}[1/5] Mise à jour du code depuis Git...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code mis à jour${NC}"

# 2. Installation des dépendances du serveur
echo -e "${BLUE}[2/5] Installation des dépendances du serveur...${NC}"
cd server
npm install --production
echo -e "${GREEN}✓ Dépendances serveur installées${NC}"

# 3. Build du client
echo -e "${BLUE}[3/5] Build du client React...${NC}"
cd ../client
npm install
npm run build
echo -e "${GREEN}✓ Client buildé avec succès${NC}"

# 4. Redémarrage du serveur Node.js
echo -e "${BLUE}[4/5] Redémarrage du serveur Node.js...${NC}"
# Sur alwaysdata, toucher un fichier restart.txt redémarre l'application
if [ -d "../server/tmp" ]; then
  touch ../server/tmp/restart.txt
else
  mkdir -p ../server/tmp
  touch ../server/tmp/restart.txt
fi
echo -e "${GREEN}✓ Serveur redémarré${NC}"

# 5. Vérification
echo -e "${BLUE}[5/5] Vérification du déploiement...${NC}"
sleep 3
if curl -f -s http://localhost:8080/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✓ API répond correctement${NC}"
else
  echo -e "${RED}⚠ L'API ne répond pas encore (vérifiez les logs)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo ""
echo "📝 Prochaines étapes :"
echo "  1. Testez votre site sur https://votre-domaine.com"
echo "  2. Vérifiez l'API sur https://api.votre-domaine.com/api/health"
echo "  3. Consultez les logs en cas de problème :"
echo "     tail -f ~/admin/logs/[date]-[site-id]-error.log"
echo ""
