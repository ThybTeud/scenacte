#!/bin/bash

# Script pour démarrer les services nécessaires aux tests
# Exécuté automatiquement avant npm test

# Vérifier si PostgreSQL est déjà démarré
if sudo service postgresql status > /dev/null 2>&1; then
  echo "✓ PostgreSQL is already running"
else
  echo "Starting PostgreSQL..."
  sudo service postgresql start
  if [ $? -eq 0 ]; then
    echo "✓ PostgreSQL started successfully"
  else
    echo "✗ Failed to start PostgreSQL"
    exit 1
  fi
fi
