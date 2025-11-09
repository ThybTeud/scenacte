# Scenacte Server

Serveur API pour Scenacte - Éditeur de textes théâtraux avec versionning intelligent et export PDF.

## 📋 Description

Scenacte est un outil d'écriture dramaturgique permettant aux auteurs de :
- Écrire leurs textes avec un balisage simple (type Markdown)
- Gérer des versions automatiques et manuelles (style Google Docs)
- Restaurer des versions antérieures
- Exporter en PDF avec des templates personnalisables
- Consulter des statistiques en temps réel

### Philosophie du projet

- **Code minimal et maintenable** : pas de sur-ingénierie, chaque dépendance est justifiée
- **Validation manuelle** : fonctions simples sans librairie externe
- **Logging simple** : console.log/error uniquement
- **Transactions atomiques** : garantie de cohérence des données

## 🛠️ Stack Technique

- **Runtime** : Node.js (≥ 18.0.0)
- **Framework** : Express.js
- **Base de données** : PostgreSQL 16
- **Driver DB** : pg (driver PostgreSQL natif)
- **Authentification** : JWT + bcrypt
- **Jobs asynchrones** : node-cron
- **Emails** : Nodemailer
- **Export PDF** : Paged.js

### Dépendances

```json
{
  "dependencies": {
    "express": "Serveur HTTP",
    "pg": "Driver PostgreSQL natif",
    "bcrypt": "Hashing mot de passe",
    "jsonwebtoken": "Authentification JWT",
    "nodemailer": "Envoi d'emails",
    "node-cron": "Jobs planifiés",
    "dotenv": "Variables d'environnement",
    "cors": "Cross-Origin Resource Sharing",
    "pagedjs": "Génération PDF"
  }
}
```

## 📦 Installation

### Prérequis

- Node.js ≥ 18.0.0
- PostgreSQL 16
- npm ou yarn

### Étapes

```bash
# 1. Cloner le repository
git clone <repo-url>
cd server

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Éditer .env avec vos valeurs
nano .env  # ou votre éditeur préféré

# 5. Générer le client Prisma
npm run prisma:generate

# 6. Créer la base de données et exécuter les migrations
npm run prisma:migrate

# 7. (Optionnel) Ouvrir Prisma Studio
npm run prisma:studio
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/scenacte"

# JWT
JWT_SECRET="changez_ce_secret_par_une_chaine_aleatoire_longue_et_securisee"
JWT_EXPIRES_IN="7d"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@scenacte.com"
SMTP_PASSWORD="votre_mot_de_passe_smtp"
SMTP_FROM="Scenacte <noreply@scenacte.com>"

# Serveur
NODE_ENV="development"
PORT=3000

# Client (frontend)
CLIENT_URL="http://localhost:5173"

# Limites
MAX_CONTENT_SIZE_MB=10
```

### Configuration PostgreSQL

```sql
-- Créer la base de données
CREATE DATABASE scenacte;

-- Créer un utilisateur (optionnel)
CREATE USER scenacte_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE scenacte TO scenacte_user;
```

## 🚀 Lancement

### Mode développement (avec nodemon)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

### Scripts disponibles

```bash
npm run dev              # Démarrer en mode développement
npm start                # Démarrer en mode production
npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer et appliquer une migration
npm run prisma:studio    # Ouvrir Prisma Studio
npm run prisma:reset     # Reset la base de données (⚠️ perte de données)
```

### Logs au démarrage

```
========================================
🎭 Scenacte Server - Démarrage
========================================

[DATABASE] Connexion à PostgreSQL...
[DATABASE] ✓ Connexion établie avec succès

[EMAIL] Vérification de la connexion SMTP...
[EMAIL] ✓ Connexion SMTP établie avec succès

[CRON] Initialisation du job de nettoyage...
[CLEANUP JOB] Job de nettoyage configuré (tous les jours à 3h du matin)
[CLEANUP JOB] Job de nettoyage démarré
[CRON] ✓ Job de nettoyage démarré (quotidien à 3h du matin)

========================================
🚀 Serveur démarré avec succès !
📍 Port: 3000
🌍 Environnement: development
🔗 URL: http://localhost:3000
💚 Health check: http://localhost:3000/api/health
========================================
```

## 📚 Documentation API

### Base URL

```
http://localhost:3000/api
```

### Authentification

Toutes les routes protégées nécessitent un header `Authorization` :

```
Authorization: Bearer <token_jwt>
```

### Health Check

#### GET /health

Vérification de l'état du serveur.

**Réponse** :
```json
{
  "status": "ok",
  "timestamp": "2024-11-01T12:00:00.000Z",
  "service": "Scenacte API"
}
```

---

### 🔐 Authentification

#### POST /auth/register

Inscription d'un nouvel utilisateur.

**Body** :
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Réponse (201)** :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-11-01T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/login

Connexion.

**Body** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse (200)** :
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/forgot-password

Demande de réinitialisation de mot de passe.

**Body** :
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password

Réinitialisation du mot de passe avec token.

**Body** :
```json
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}
```

#### GET /auth/me

Récupère l'utilisateur connecté (🔒 protégé).

**Réponse (200)** :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 👤 Utilisateurs

#### GET /users/profile

Profil de l'utilisateur connecté (🔒 protégé).

**Réponse (200)** :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "...",
    "updatedAt": "...",
    "playsCount": 5
  }
}
```

#### PUT /users/profile

Mise à jour du profil (🔒 protégé).

**Body (tous optionnels)** :
```json
{
  "email": "newemail@example.com",
  "username": "newusername",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### DELETE /users/account

Suppression du compte (🔒 protégé).

**Body** :
```json
{
  "password": "password123"
}
```

---

### 🎭 Pièces de théâtre

#### GET /plays

Liste des pièces de l'utilisateur (🔒 protégé).

**Query params** :
- `page` : numéro de page (défaut: 1)
- `limit` : éléments par page (défaut: 20, max: 100)
- `status` : filtre par statut (draft, completed, archived)

**Réponse (200)** :
```json
{
  "plays": [
    {
      "id": "uuid",
      "title": "Ma pièce",
      "subtitle": "Comédie dramatique",
      "status": "draft",
      "contentVersion": 42,
      "createdAt": "...",
      "updatedAt": "...",
      "lastEditedAt": "...",
      "statistics": {
        "wordCount": 5230,
        "totalActs": 3,
        "totalScenes": 12,
        "totalCharacters": 8,
        "totalLines": 324,
        "estimatedDurationMinutes": 85
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### POST /plays

Créer une nouvelle pièce (🔒 protégé).

**Body** :
```json
{
  "title": "Nouvelle pièce",
  "subtitle": "Drame",
  "rawContent": "# Acte I\n## Scène 1\n...",
  "htmlContent": "<h1>Acte I</h1><h2>Scène 1</h2>...",
  "statistics": {
    "totalActs": 1,
    "totalScenes": 1,
    "totalCharacters": 2,
    "totalLines": 5,
    "wordCount": 150,
    "estimatedDurationMinutes": 3
  }
}
```

**Réponse (201)** :
```json
{
  "play": { ... }
}
```

#### GET /plays/:id

Récupérer une pièce (🔒 protégé).

**Réponse (200)** :
```json
{
  "play": {
    "id": "uuid",
    "title": "Ma pièce",
    "subtitle": "...",
    "rawContent": "...",
    "htmlContent": "...",
    "contentVersion": 42,
    "status": "draft",
    "createdAt": "...",
    "updatedAt": "...",
    "lastEditedAt": "...",
    "statistics": { ... }
  }
}
```

#### PUT /plays/:id

Sauvegarder une pièce (crée une version) (🔒 protégé).

**Body** :
```json
{
  "title": "Ma pièce",
  "subtitle": "...",
  "rawContent": "...",
  "htmlContent": "...",
  "statistics": { ... },
  "versionType": "auto",
  "manualLabel": "Fin de l'acte 1"
}
```

- `versionType` : "auto" (défaut) ou "manual"
- `manualLabel` : label pour versions manuelles (optionnel)

**Réponse (200)** :
```json
{
  "play": { ... },
  "versionNumber": 43,
  "message": "Pièce sauvegardée avec succès"
}
```

#### DELETE /plays/:id

Supprimer une pièce (🔒 protégé).

**Réponse (200)** :
```json
{
  "message": "Pièce supprimée avec succès"
}
```

#### PATCH /plays/:id/status

Changer le statut d'une pièce (🔒 protégé).

**Body** :
```json
{
  "status": "completed"
}
```

Valeurs : `draft`, `completed`, `archived`

---

### 📦 Versions

#### GET /plays/:id/versions

Liste des versions d'une pièce (🔒 protégé).

**Query params** :
- `page` : numéro de page (défaut: 1)
- `limit` : éléments par page (défaut: 20)
- `type` : filtre par type (auto ou manual)

**Réponse (200)** :
```json
{
  "versions": [
    {
      "id": "uuid",
      "versionNumber": 43,
      "title": "Ma pièce",
      "versionType": "manual",
      "manualLabel": "Fin de l'acte 1",
      "fileSizeBytes": 52384,
      "preservedReason": "manual",
      "createdAt": "...",
      "statistics": { ... }
    }
  ],
  "pagination": { ... }
}
```

#### GET /plays/:id/versions/:versionId

Récupérer une version spécifique avec contenu complet (🔒 protégé).

**Réponse (200)** :
```json
{
  "version": {
    "id": "uuid",
    "versionNumber": 42,
    "title": "Ma pièce",
    "rawContent": "...",
    "htmlContent": "...",
    "versionType": "manual",
    "manualLabel": "...",
    "fileSizeBytes": 52384,
    "preservedReason": "manual",
    "createdAt": "...",
    "statistics": { ... }
  }
}
```

#### POST /plays/:id/versions/restore

Restaurer une version (crée une nouvelle version manuelle) (🔒 protégé).

**Body** :
```json
{
  "versionId": "uuid"
}
```

**Réponse (200)** :
```json
{
  "play": { ... },
  "versionNumber": 44,
  "message": "Version 42 restaurée avec succès"
}
```

#### POST /plays/:id/versions/manual

Créer un snapshot manuel (🔒 protégé).

**Body** :
```json
{
  "manualLabel": "Avant relecture"
}
```

**Réponse (201)** :
```json
{
  "version": { ... },
  "message": "Version manuelle créée avec succès"
}
```

---

### 📄 Templates PDF

#### GET /templates

Liste des templates (🔒 protégé).

**Query params** :
- `playId` : filtre par pièce (optionnel)

**Réponse (200)** :
```json
{
  "templates": [
    {
      "id": "uuid",
      "name": "Mon template par défaut",
      "isDefault": true,
      "settings": {
        "pageSize": "A4",
        "marginTop": "2cm",
        "marginRight": "2.5cm",
        "marginBottom": "2cm",
        "marginLeft": "2.5cm",
        "fontFamily": "Times New Roman, serif",
        "fontSize": "12pt",
        "lineHeight": "1.5",
        "showPageNumbers": true
      },
      "createdAt": "...",
      "updatedAt": "...",
      "playId": null
    }
  ]
}
```

#### POST /templates

Créer un template (🔒 protégé).

**Body** :
```json
{
  "name": "Mon template",
  "settings": { ... },
  "isDefault": true,
  "playId": "uuid"
}
```

#### GET /templates/:id

Récupérer un template (🔒 protégé).

#### PUT /templates/:id

Modifier un template (🔒 protégé).

#### DELETE /templates/:id

Supprimer un template (🔒 protégé).

---

### 📤 Export PDF

#### POST /plays/:id/export/pdf

Exporter une pièce en PDF (🔒 protégé).

**Body (tous optionnels)** :
```json
{
  "templateId": "uuid",
  "versionId": "uuid"
}
```

- Si `templateId` non fourni : utilise le template par défaut
- Si `versionId` non fourni : exporte la version courante

**Réponse (200)** :
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="ma-piece-2024-11-01.pdf"`
- Body : Buffer PDF

---

## 📁 Structure du projet

```
server/
├── prisma/
│   ├── schema.prisma              # Schéma de base de données
│   └── migrations/                # Migrations SQL
├── src/
│   ├── config/
│   │   └── env.js                 # Configuration environnement
│   ├── middleware/
│   │   ├── auth.js                # Middleware d'authentification
│   │   └── errorHandler.js        # Gestion des erreurs
│   ├── routes/
│   │   ├── index.js               # Router principal
│   │   ├── auth.routes.js         # Routes authentification
│   │   ├── users.routes.js        # Routes utilisateurs
│   │   ├── plays.routes.js        # Routes pièces
│   │   ├── versions.routes.js     # Routes versions
│   │   ├── templates.routes.js    # Routes templates
│   │   └── export.routes.js       # Routes export
│   ├── controllers/
│   │   ├── auth.controller.js     # Logique authentification
│   │   ├── users.controller.js    # Logique utilisateurs
│   │   ├── plays.controller.js    # Logique pièces
│   │   ├── versions.controller.js # Logique versions
│   │   ├── templates.controller.js# Logique templates
│   │   └── export.controller.js   # Logique export
│   ├── services/
│   │   ├── email.service.js       # Service emails
│   │   ├── pdf.service.js         # Service génération PDF
│   │   └── version-cleanup.service.js # Service nettoyage versions
│   ├── jobs/
│   │   └── cleanup.job.js         # Job cron nettoyage quotidien
│   ├── utils/
│   │   ├── jwt.js                 # Utilitaires JWT
│   │   ├── hash.js                # Utilitaires hashing
│   │   └── validation.js          # Fonctions de validation
│   ├── app.js                     # Configuration Express
│   └── server.js                  # Point d'entrée serveur
├── .env.example                   # Exemple configuration
├── .gitignore                     # Fichiers ignorés Git
├── package.json                   # Dépendances et scripts
└── README.md                      # Documentation
```

## 🗄️ Base de données

### Tables principales

- **users** : Utilisateurs
- **plays** : Pièces de théâtre (version courante)
- **play_versions** : Historique des versions
- **play_statistics** : Statistiques version courante
- **version_statistics** : Statistiques par version
- **export_templates** : Templates d'export PDF

### Relations

- Un utilisateur peut avoir plusieurs pièces
- Une pièce a plusieurs versions
- Une pièce a des statistiques (1:1)
- Chaque version a des statistiques (1:1)
- CASCADE sur suppression utilisateur/pièce

## ⏰ Stratégie de versionning

### Auto-save

- **Frontend** : sauvegarde toutes les 2 minutes
- **Serveur** : crée version avec `versionType: 'auto'`

### Versions manuelles

- Créées par l'utilisateur avec label optionnel
- `versionType: 'manual'` + `preservedReason: 'manual'`
- Gardées indéfiniment

### Rétention des versions

Job de nettoyage quotidien à 3h du matin :

1. **Versions manuelles** → gardées indéfiniment
2. **Auto-saves < 7 jours** → toutes gardées (`preservedReason: 'recent'`)
3. **Auto-saves > 7 jours** → 1 snapshot par jour (`preservedReason: 'daily_snapshot'`)
4. **Autres auto-saves anciennes** → supprimées

## 🔧 Développement

### Conventions de code

- **Commentaires** : en français pour la logique métier
- **Nommage** : camelCase en JavaScript, snake_case en base de données
- **Validation** : fonctions manuelles (pas de librairie)
- **Logging** : console.log/error uniquement
- **Erreurs** : classes custom avec statusCode

### Prisma

```bash
# Créer une migration
npx prisma migrate dev --name nom_migration

# Générer le client
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio

# Reset la base (⚠️ perte de données)
npx prisma migrate reset
```

### Test manuel du cleanup

Décommenter dans `src/server.js` :

```javascript
if (config.server.env === 'development') {
  console.log('[CRON] Exécution de test du cleanup...');
  await cleanupJob.runNow();
}
```

## 🚨 Dépannage

### Erreur de connexion base de données

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Vérifier la connexion
psql -U scenacte_user -d scenacte -h localhost
```

### Erreur SMTP

Le serveur démarre même si SMTP échoue (emails non bloquants).

```
[EMAIL] ⚠ Connexion SMTP échouée (les emails ne seront pas envoyés)
```

### Port déjà utilisé

```bash
# Trouver le processus sur le port 3000
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

## 📝 Licence

MIT

## 👨‍💻 Auteur

Scenacte Server - Développé avec une philosophie de code minimal et maintenable.

---

**Version** : 1.0.0  
**Node.js** : ≥ 18.0.0  
**PostgreSQL** : 16