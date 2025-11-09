# Scenacte

Application web d'écriture de pièces de théâtre avec gestion de versions, développée avec React et Node.js.

## 📋 Description

Scenacte est un outil d'écriture dramaturgique moderne permettant aux auteurs de :
- Écrire et structurer leurs pièces de théâtre
- Gérer automatiquement les versions de leurs textes
- Exporter leurs œuvres en PDF avec différents templates
- Collaborer et suivre l'évolution de leurs créations

## 🏗️ Architecture du projet

```
scenacte/
├── client/          # Frontend React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── contexts/      # Context API (auth, etc.)
│   │   ├── services/      # Couche de services API
│   │   └── hooks/         # Custom React hooks
│   └── README.md
│
├── server/          # Backend Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── controllers/   # Logique métier
│   │   ├── routes/        # Routes API
│   │   ├── services/      # Services (email, PDF, etc.)
│   │   ├── middleware/    # Middlewares (auth, errors)
│   │   └── config/        # Configuration
│   ├── migrations/        # Migrations SQL
│   └── README.md
│
└── README.md        # Ce fichier
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation complète

#### 1. Cloner le repository

```bash
git clone <repo-url>
cd scenacte
```

#### 2. Configuration de la base de données

```bash
# Créer la base de données PostgreSQL
createdb scenacte_db
createuser scenacte_user -P  # Entrez le mot de passe

# Appliquer les migrations
cd server
psql -U scenacte_user -d scenacte_db -f migrations/init.sql
```

#### 3. Configuration du serveur

```bash
cd server

# Installer les dépendances
npm install

# Créer le fichier .env à partir de l'exemple
cp .env.example .env

# Éditer .env avec vos configurations
# - DATABASE_URL
# - JWT_SECRET
# - SMTP_* (pour les emails)
nano .env
```

#### 4. Configuration du client

```bash
cd ../client

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env

# La configuration par défaut devrait fonctionner
# VITE_API_URL=http://localhost:3000/api
```

#### 5. Lancer l'application

**Terminal 1 - Serveur :**
```bash
cd server
npm run dev
# Serveur sur http://localhost:3000
```

**Terminal 2 - Client :**
```bash
cd client
npm run dev
# Application sur http://localhost:5173
```

#### 6. Accéder à l'application

Ouvrez votre navigateur sur `http://localhost:5173`

## 📚 Documentation

- [Documentation du serveur](./server/README.md)
- [Documentation du client](./client/README.md)

## 🔧 Stack technique

### Frontend
- **React 19** - Framework UI
- **Vite** - Build tool
- **TailwindCSS** - Framework CSS
- **React Router** - Routing
- **react-hot-toast** - Notifications

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **PostgreSQL** - Base de données
- **JWT** - Authentication
- **Nodemailer** - Envoi d'emails
- **PagedJS** - Export PDF

## 🌟 Fonctionnalités

### Authentification
- [x] Inscription / Connexion
- [x] Réinitialisation de mot de passe
- [x] Gestion de profil utilisateur

### Gestion des pièces
- [x] Création, édition, suppression de pièces
- [x] Liste avec filtres et pagination
- [x] Statuts (brouillon, terminé, archivé)

### Éditeur
- [x] Interface 3 colonnes (navigation, éditeur, preview)
- [ ] Parsing du texte (# actes, ## scènes, @ personnages)
- [ ] Preview HTML en temps réel
- [ ] Auto-save toutes les 2 minutes

### Versioning
- [x] Versions automatiques
- [x] Versions manuelles avec labels
- [x] Restauration de versions
- [x] Nettoyage automatique des anciennes versions
- [ ] Comparaison de versions (diff)

### Export
- [ ] Export PDF avec templates
- [ ] Templates personnalisables
- [ ] Export multiple formats

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- Authentication par JWT
- Protection CORS
- Validation des entrées
- Protection XSS (React + sanitization)
- Gestion des secrets via variables d'environnement

## 📝 Variables d'environnement

### Serveur (`server/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/scenacte_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@scenacte.com
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

## 🧪 Tests

```bash
# Tests serveur
cd server
npm test

# Tests client
cd client
npm test
```

## 📦 Build de production

### Serveur
```bash
cd server
npm start
```

### Client
```bash
cd client
npm run build
npm run preview
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

## 🗺️ Roadmap

- [ ] Éditeur de texte riche avec coloration syntaxique
- [ ] Preview HTML en temps réel
- [ ] Export PDF avec templates personnalisables
- [ ] Auto-save
- [ ] Statistiques avancées (nombre d'actes, scènes, personnages)
- [ ] Mode collaboratif
- [ ] Import depuis d'autres formats
- [ ] API publique pour intégrations tierces

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**Version actuelle** : 1.0.0
**Dernière mise à jour** : Novembre 2025
