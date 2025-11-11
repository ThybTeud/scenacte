#!/usr/bin/env bash
set -e

echo "🎭 Scenacte - Build Script pour Render.com"
echo "==========================================="

# Installation des dépendances du serveur
echo "📦 Installation des dépendances du serveur..."
cd server
npm ci --production
cd ..

echo "✅ Build terminé avec succès!"
