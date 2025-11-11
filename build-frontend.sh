#!/usr/bin/env bash
set -e

echo "🎭 Scenacte - Build Frontend pour Render.com"
echo "============================================="

# Installation des dépendances du client
echo "📦 Installation des dépendances du frontend..."
cd client
npm ci

# Build du frontend
echo "🏗️  Build du frontend React..."
npm run build

echo "✅ Build frontend terminé avec succès!"
echo "📁 Les fichiers sont dans client/dist/"
