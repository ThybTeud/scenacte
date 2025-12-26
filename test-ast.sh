#!/bin/bash

# Script de test pour l'endpoint AST
# Usage: ./test-ast.sh [email] [password] [play_id]

# Configuration
API_URL="${API_URL:-http://localhost:3000/api}"
EMAIL="${1:-test@example.com}"
PASSWORD="${2:-password123}"
PLAY_ID="${3}"

echo "🎭 Test de l'endpoint AST de Scenacte"
echo "======================================"
echo ""

# Étape 1 : Authentification
echo "📝 Étape 1: Connexion avec l'utilisateur $EMAIL..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Vérifier si la connexion a réussi
if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Connexion réussie!"
  echo ""
else
  echo "❌ Erreur de connexion:"
  echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
  exit 1
fi

# Étape 2 : Récupérer la liste des pièces si aucun ID n'est fourni
if [ -z "$PLAY_ID" ]; then
  echo "📚 Étape 2: Récupération de la liste des pièces..."
  PLAYS_RESPONSE=$(curl -s -X GET "$API_URL/plays" \
    -H "Authorization: Bearer $TOKEN")

  # Extraire le premier ID de pièce
  PLAY_ID=$(echo "$PLAYS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$PLAY_ID" ]; then
    echo "❌ Aucune pièce trouvée pour cet utilisateur"
    echo ""
    echo "Réponse complète:"
    echo "$PLAYS_RESPONSE" | jq '.' 2>/dev/null || echo "$PLAYS_RESPONSE"
    exit 1
  fi

  echo "✅ Pièce trouvée: $PLAY_ID"
  echo ""
fi

# Étape 3 : Récupérer l'AST
echo "🌳 Étape 3: Récupération de l'AST pour la pièce $PLAY_ID..."
echo ""

AST_RESPONSE=$(curl -s -X GET "$API_URL/plays/$PLAY_ID/ast" \
  -H "Authorization: Bearer $TOKEN")

# Vérifier si la requête a réussi
if echo "$AST_RESPONSE" | grep -q "ast"; then
  echo "✅ AST récupéré avec succès!"
  echo ""
  echo "======================================"
  echo "📊 RÉSULTAT DE L'AST"
  echo "======================================"
  echo ""

  # Afficher l'AST formaté
  echo "$AST_RESPONSE" | jq '.' 2>/dev/null || echo "$AST_RESPONSE"

  echo ""
  echo "======================================"
  echo "📈 STATISTIQUES DE L'AST"
  echo "======================================"

  # Extraire quelques statistiques de l'AST
  TITLE=$(echo "$AST_RESPONSE" | jq -r '.title' 2>/dev/null)
  NODE_TYPE=$(echo "$AST_RESPONSE" | jq -r '.ast.type' 2>/dev/null)
  CHILDREN_COUNT=$(echo "$AST_RESPONSE" | jq -r '.ast.children | length' 2>/dev/null)

  echo "Titre: $TITLE"
  echo "Type de nœud racine: $NODE_TYPE"
  echo "Nombre d'enfants directs: $CHILDREN_COUNT"

else
  echo "❌ Erreur lors de la récupération de l'AST:"
  echo "$AST_RESPONSE" | jq '.' 2>/dev/null || echo "$AST_RESPONSE"
  exit 1
fi

echo ""
echo "✨ Test terminé avec succès!"
