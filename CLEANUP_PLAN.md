# 🧹 SCENACTE - Plan de Nettoyage de la Codebase

**Date d'analyse** : 2025-11-14
**Analysé par** : Claude Code
**Version** : 1.0.0

---

## 📊 Résumé Exécutif

### Structure Actuelle
```
scenacte/
├── client/          # Frontend React + Vite
├── server/          # Backend Node.js + Express
├── package.json     # Scripts racine
└── *.md            # Documentation (8 fichiers)
```

### Points Clés
- ✅ **Architecture saine** : Séparation claire frontend/backend
- ⚠️ **Documentation multiple** : 8 fichiers MD (certains redondants)
- ✅ **Pas de node_modules committés**
- ⚠️ **Assets de démonstration présents** (react.svg, vite.svg)
- ⚠️ **Fichiers CSS partiellement inutilisés** (App.css)
- ✅ **Dépendances bien utilisées** (pas de bloat majeur)
- ⚠️ **Code de test/setup non nécessaire en prod** (test-api.js, setup-smtp.js)

---

## 🗑️ CATÉGORIE 1 : SUPPRIMER IMMÉDIATEMENT (Sûr à 100%)

### 1.1 Assets de Démonstration React/Vite

**Fichiers à supprimer :**
```bash
client/src/assets/react.svg           # Logo React de démonstration
client/public/vite.svg                # Logo Vite par défaut
```

**Justification :**
- Ces fichiers sont des templates par défaut de Vite + React
- Non utilisés dans l'application SCENACTE
- Encombrent inutilement le bundle de production

**Impact :** ✅ Aucun (non référencés dans le code)

---

### 1.2 Fichier CSS Obsolète

**Fichiers à supprimer :**
```bash
client/src/App.css                    # Styles pour template Vite
```

**Contenu actuel :**
```css
#root { max-width: 1280px; ... }
.logo { height: 6em; ... }
@keyframes logo-spin { ... }
```

**Justification :**
- Styles pour le template par défaut de Vite
- L'application utilise **100% TailwindCSS** (confirmé via `index.css`)
- Non importé dans le code actuel de SCENACTE
- Classes `.logo`, `.card`, `.read-the-docs` non utilisées

**Impact :** ✅ Aucun (styles non utilisés)

---

## ⚠️ CATÉGORIE 2 : DEMANDER CONFIRMATION (Probablement inutiles)

### 2.1 Scripts de Test et Utilitaires de Développement

**Fichiers concernés :**
```bash
server/test-api.js                    # 10,279 bytes - Script de test manuel
server/setup-smtp.js                  # 2,346 bytes - Setup Ethereal.email pour dev
```

#### **`server/test-api.js`**
- **Taille** : 10 KB
- **Fonction** : Script manuel pour tester toutes les routes API
- **Usage** : `node test-api.js` (développement uniquement)
- **Recommandation** :
  - ⚠️ **Garder** si utile pour onboarding/debug
  - ✅ **Supprimer** si vous n'utilisez jamais ce script
  - 💡 **Alternative** : Créer un dossier `/scripts` ou `/dev-tools` hors du build

#### **`server/setup-smtp.js`**
- **Taille** : 2,3 KB
- **Fonction** : Génère un compte Ethereal.email pour tester les emails en dev
- **Usage** : `./setup-smtp.js` (une seule fois)
- **Recommandation** :
  - ✅ **Supprimer** si déjà configuré (fichier `.env` déjà rempli)
  - ⚠️ **Garder** si utilisé régulièrement pour reconfigurer SMTP

**Impact si suppression :** ⚠️ Faible (scripts auxiliaires, pas dans le runtime)

---

### 2.2 Documentation Redondante

**Fichiers concernés :**
```bash
README.md                             # 7,101 bytes - Documentation principale
server/README.md                      # 18,133 bytes - Documentation serveur (très détaillée)
client/README.md                      # 7,103 bytes - Documentation client
DEPLOYMENT.md                         # 19,365 bytes
QUICKSTART_RENDER.md                  # 9,247 bytes
QUICKSTART_ALWAYSDATA.md              # 4,741 bytes
EMAIL_SETUP.md                        # 7,038 bytes
CODEMIRROR_EDITOR.md                  # 8,147 bytes
```

**Total :** ~81 KB de documentation

#### Analyse de Redondance

| Fichier | Contenu | Recommandation |
|---------|---------|----------------|
| `README.md` | Vue d'ensemble du projet | ✅ **GARDER** (entrée principale) |
| `server/README.md` | API complète + stack technique | ✅ **GARDER** (référence complète) |
| `client/README.md` | Architecture frontend | ✅ **GARDER** (utile) |
| `DEPLOYMENT.md` | Guide de déploiement complet | ✅ **GARDER** (critique) |
| `QUICKSTART_RENDER.md` | Déploiement rapide Render | ⚠️ **FUSIONNER** avec DEPLOYMENT.md ? |
| `QUICKSTART_ALWAYSDATA.md` | Déploiement AlwaysData | ❓ **Vérifier** : toujours utilisé ? |
| `EMAIL_SETUP.md` | Configuration SMTP/SendGrid | ⚠️ **FUSIONNER** dans server/README.md ? |
| `CODEMIRROR_EDITOR.md` | Migration vers CodeMirror | ⚠️ **Archiver** si migration terminée |

**Recommandation :**
1. **Conserver** : README.md, server/README.md, client/README.md, DEPLOYMENT.md
2. **Fusionner ou Supprimer** : Les 4 autres selon vos besoins

**Impact si consolidation :** ✅ Meilleure maintenabilité (moins de docs à mettre à jour)

---

## 🔍 CATÉGORIE 3 : ANALYSE APPROFONDIE REQUISE

### 3.1 Incohérence : Prisma vs Driver PostgreSQL Natif

**Observation Critique :**

Le **README du serveur** (lignes 73-82) mentionne Prisma :
```markdown
# 5. Générer le client Prisma
npm run prisma:generate

# 6. Créer la base de données et exécuter les migrations
npm run prisma:migrate
```

**MAIS :**
1. ❌ **Prisma n'est PAS dans `package.json`** (aucune dépendance Prisma)
2. ✅ **Le code utilise `import prisma from '../db/index.js'`**
3. ✅ **`db/index.js` est un WRAPPER CUSTOM** qui émule l'API Prisma avec `pg` natif

**Fichier `server/src/db/index.js` :**
```javascript
import { Pool } from 'pg';

const prisma = {
  user: {
    async findFirst({ where } = {}) { /* queries SQL manuelles */ },
    async findUnique({ where, select } = {}) { /* ... */ },
    // ...
  },
  play: { /* ... */ },
  playVersion: { /* ... */ }
};

export default prisma;
```

**Problèmes identifiés :**
1. 🔴 **README OBSOLÈTE** : Instructions Prisma non valides
2. 🟡 **Confusion** : Nomenclature "prisma" pour un wrapper custom
3. 🟢 **Code fonctionnel** : Le wrapper fonctionne bien

**Actions recommandées :**

#### Option A : Mettre à jour la documentation (RECOMMANDÉ)
```bash
# Dans server/README.md, remplacer les sections Prisma par :

## 🗄️ Base de données

Ce projet utilise PostgreSQL avec le driver natif `pg`.
La couche d'accès aux données (`src/db/index.js`) émule l'API Prisma pour la simplicité.

### Migrations

Les migrations SQL se trouvent dans `/migrations` et `/db` :
- `migrations/init.sql` : Schema initial
- `db/schema.sql` : Schema complet

Pour appliquer les migrations :
npm run db:migrate
```

#### Option B : Migrer vers Prisma ORM (OPTIONNEL)
Si vous souhaitez utiliser le vrai Prisma :
1. Installer : `npm install prisma @prisma/client`
2. Créer `prisma/schema.prisma` à partir de `db/schema.sql`
3. Supprimer `db/index.js` custom

**Recommandation finale :** ✅ **Option A** (mettre à jour la doc, garder le wrapper)

---

### 3.2 Dépendances : SendGrid + Nodemailer (Doublon ?)

**Observation :**

Le fichier `server/src/services/email.service.js` importe **les deux** :
```javascript
import nodemailer from 'nodemailer';       // Pour SMTP
import sgMail from '@sendgrid/mail';       // Pour SendGrid API
```

**Analyse :**
- ✅ **Pas un doublon** : Le service supporte 3 modes
  1. **Développement** : Console logs uniquement
  2. **SendGrid** : API HTTP (recommandé pour Render.com)
  3. **SMTP** : Nodemailer (fallback)

**Code actuel :**
```javascript
if (!isDevelopment && isSendGridConfigured) {
  await sendViaSendGrid(mailContent);
} else if (!isDevelopment && isSmtpConfigured) {
  await sendViaSmtp(mailContent);
}
```

**Recommandation :** ✅ **GARDER LES DEUX**
- Flexibilité pour différents hébergeurs
- SendGrid = prioritaire (plus fiable sur Render.com)
- SMTP = fallback si SendGrid pas configuré

**Action :** Aucune (architecture correcte)

---

### 3.3 Console.log en Production

**Analyse :**

**Client :** 11 occurrences de `console.log/error/warn` dans 8 fichiers
```
client/src/contexts/AuthContext.jsx:1
client/src/services/api.js:2
client/src/pages/plays/PlayEditor.jsx:3
client/src/utils/playStatistics.js:1
...
```

**Recommandation :**
- 🟢 **Garder** : `console.error()` pour les erreurs critiques
- 🟡 **Évaluer** : `console.log()` de debug non utilisés
- 🟢 **OK** : Les logs serveur sont nécessaires (traçabilité)

**Action suggérée :** Vérifier les `console.log()` dans :
- `PlayEditor.jsx` (3 logs)
- `api.js` (2 logs)

Si ce sont des logs de debug, les supprimer ou les entourer de `if (import.meta.env.DEV)`.

---

## 📦 CATÉGORIE 4 : OPTIMISATIONS POSSIBLES

### 4.1 Vérification des Dépendances Non Utilisées

**Méthode recommandée :**
```bash
# Backend
cd server
npx depcheck

# Frontend
cd client
npx depcheck
```

**Dépendances potentiellement sous-utilisées :**

#### Backend (`server/package.json`)
- ✅ `@sendgrid/mail` : Utilisé (email.service.js)
- ✅ `bcrypt` : Utilisé (utils/hash.js)
- ✅ `cors` : Utilisé (app.js)
- ✅ `dotenv` : Utilisé (config/env.js)
- ✅ `express` : Core framework
- ✅ `jsonwebtoken` : Utilisé (utils/jwt.js)
- ✅ `node-cron` : Utilisé (jobs/cleanup.job.js)
- ✅ `nodemailer` : Utilisé (services/email.service.js)
- ⚠️ `pagedjs` : Utilisé (services/pdf.service.js) - **CRITIQUE : Ne pas toucher**
- ✅ `pg` : Driver PostgreSQL natif

**Résultat :** ✅ Toutes les dépendances sont utilisées

#### Frontend (`client/package.json`)
- ✅ `@codemirror/*` : Éditeur CodeMirror (6 packages)
- ✅ `codemirror` : Core
- ✅ `react` + `react-dom` : Framework
- ✅ `react-hot-toast` : Notifications
- ✅ `react-loader-spinner` : Loaders
- ✅ `react-router-dom` : Routing

**Résultat :** ✅ Toutes les dépendances sont utilisées

---

### 4.2 Analyse du Bundle de Production

**Action recommandée :**
```bash
cd client
npm run build
npx vite-bundle-visualizer
```

Cela permettra d'identifier :
- Les packages les plus lourds
- Les duplications de code
- Les opportunités de code splitting

---

### 4.3 Page Preferences Non Utilisée ?

**Observation :**

Le fichier `client/src/pages/preferences/Preferences.jsx` existe mais semble minimal :
```jsx
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
```

**Action requise :**
1. Vérifier si cette page est référencée dans les routes (`App.jsx`)
2. Si non utilisée : supprimer
3. Si WIP : garder mais documenter

---

## 🎯 RECOMMANDATIONS PAR PRIORITÉ

### PRIORITÉ 1 : Actions Immédiates (Sans Risque)

```bash
# Supprimer les assets de démonstration
rm client/src/assets/react.svg
rm client/public/vite.svg
rm client/src/App.css
```

**Gain :** ~15 KB + clarté du projet

---

### PRIORITÉ 2 : Décisions à Prendre

1. **Scripts de test** : Garder ou archiver `test-api.js` et `setup-smtp.js` ?
   - 💡 Suggestion : Créer un dossier `/scripts` pour les outils de dev

2. **Documentation** : Fusionner certains fichiers MD ?
   - Proposer : Fusionner `EMAIL_SETUP.md` dans `server/README.md`
   - Vérifier : `QUICKSTART_ALWAYSDATA.md` toujours pertinent ?

3. **README serveur** : Mettre à jour les références Prisma
   - Remplacer instructions Prisma par la vraie architecture (wrapper `pg`)

---

### PRIORITÉ 3 : Maintenance Continue

1. **Audit des console.log** :
   ```bash
   # Chercher les logs de debug non nécessaires
   grep -rn "console.log" client/src --include="*.jsx"
   ```

2. **Optimisation du bundle** :
   ```bash
   cd client
   npm run build
   # Vérifier la taille du build
   du -sh dist/
   ```

3. **Tests de dépendances** :
   ```bash
   cd server && npx depcheck
   cd client && npx depcheck
   ```

---

## 📋 MAINTENANCE.md - PROPOSITION DE CONTENU

Voici le contenu suggéré pour le nouveau fichier `MAINTENANCE.md` :

```markdown
# SCENACTE - Guide de Maintenance

## Stack de Production

- **Frontend** : React 19 + Vite + TailwindCSS déployé sur Render
- **Backend** : Express + PostgreSQL (via driver `pg` natif) déployé sur Render
- **Database** : PostgreSQL sur Neon (cloud)
- **Design** : TailwindCSS 100% (pas de CSS custom)
- **Éditeur** : CodeMirror 6 (syntaxe théâtrale custom)

## Variables d'Environnement Critiques

### Backend (server/.env)
```env
DATABASE_URL=postgresql://...        # Neon PostgreSQL (CRITIQUE)
JWT_SECRET=...                       # Auth tokens
JWT_EXPIRES_IN=7d
SENDGRID_API_KEY=...                 # Email (recommandé)
SMTP_HOST/USER/PASSWORD=...          # Email fallback
PORT=3000                            # Auto-assigné par Render
NODE_ENV=production
CLIENT_URL=https://...               # Frontend URL
```

### Frontend (client/.env.production)
```env
VITE_API_URL=https://...             # Backend API URL
```

## Dépendances Critiques

### Backend (NE PAS SUPPRIMER)
- `pg` : Driver PostgreSQL natif (wrapper dans `src/db/index.js`)
- `bcrypt` : Hashing passwords
- `jsonwebtoken` : Auth JWT
- `node-cron` : Cleanup automatique versions (CRITIQUE - job à 3h)
- `pagedjs` : Export PDF (CRITIQUE - feature principale)
- `nodemailer` + `@sendgrid/mail` : Emails (les deux nécessaires)

### Frontend (NE PAS SUPPRIMER)
- `@codemirror/*` : Éditeur de code (6 packages requis)
- `react-router-dom` : Routing
- `react-hot-toast` : Notifications
- `tailwindcss` : Framework CSS (100% du style)

## Scripts NPM Essentiels

### Backend
```bash
npm start              # Production (node src/server.js)
npm run dev            # Dev avec nodemon
npm run db:migrate     # Migrations PostgreSQL
```

### Frontend
```bash
npm run build          # Build pour Render
npm run dev            # Dev server Vite (port 5173)
npm run preview        # Test build local
```

## Points d'Entrée

- **Backend** : `src/server.js` → `src/app.js`
- **Frontend** : `src/main.jsx` → `src/App.jsx`
- **Parser théâtral** : `src/utils/playParser.js` (CRITIQUE)
- **Cron cleanup** : `src/jobs/cleanup.job.js` (CRITIQUE)
- **Email service** : `src/services/email.service.js`
- **PDF service** : `src/services/pdf.service.js` (CRITIQUE)

## Architecture Base de Données

**Type** : PostgreSQL natif (PAS Prisma ORM)

**Couche d'accès** : `server/src/db/index.js`
- Wrapper custom qui émule l'API Prisma
- Utilise le driver `pg` natif
- Conversions snake_case ↔ camelCase automatiques

**Tables principales** :
- `users` : Utilisateurs
- `plays` : Pièces (version courante)
- `play_versions` : Historique versions
- `play_statistics` : Stats version courante
- `version_statistics` : Stats par version
- `export_templates` : Templates PDF

**Migrations** : `server/migrations/init.sql` + `server/db/schema.sql`

## Déploiement Render

1. **Push sur GitHub** → Auto-deploy activé
2. **Build commands** :
   - Backend : `npm install`
   - Frontend : `npm run build`
3. **Health checks** : `GET /api/health`
4. **Migrations** : Manuelles via dashboard Render

## Cron Job de Nettoyage

**Fichier** : `server/src/jobs/cleanup.job.js`

**Fréquence** : Tous les jours à 3h du matin

**Fonction** : Nettoyer les anciennes versions automatiques
- Versions manuelles → gardées indéfiniment
- Auto-saves < 7 jours → toutes gardées
- Auto-saves > 7 jours → 1 snapshot/jour
- Autres → supprimées

⚠️ **CRITIQUE** : Ne jamais désactiver ce job (risque de surcharge DB)

## Email Service

**Modes supportés** :
1. **SendGrid** (recommandé pour Render) : API HTTP, pas de problème de port
2. **SMTP** (fallback) : Nodemailer avec port 2525
3. **Dev** : Console logs uniquement

**Fichier** : `server/src/services/email.service.js`

**Emails envoyés** :
- Bienvenue après inscription
- Réinitialisation mot de passe

## Commandes de Maintenance

### Vérifier la santé du build
```bash
# Backend - Vérifier que ça démarre
cd server
npm install
npm start

# Frontend - Vérifier que ça build
cd client
npm install
npm run build
du -sh dist/  # Vérifier la taille
```

### Nettoyer les dépendances
```bash
# Supprimer les dépendances non utilisées
npm prune

# Dédupliquer
npm dedupe

# Audit de sécurité
npm audit
```

### Analyser les dépendances non utilisées
```bash
# Backend
cd server
npx depcheck

# Frontend
cd client
npx depcheck
```

### Analyser le bundle frontend
```bash
cd client
npm run build
npx vite-bundle-visualizer
```

## Fichiers à NE JAMAIS MODIFIER Sans Précaution

1. **`server/src/db/index.js`** : Wrapper Prisma-like custom
2. **`server/src/jobs/cleanup.job.js`** : Cron critique
3. **`server/src/services/pdf.service.js`** : Export PDF
4. **`client/src/utils/playParser.js`** : Parser syntaxe théâtrale
5. **`client/src/contexts/AuthContext.jsx`** : Auth globale
6. **`client/tailwind.config.js`** : Config couleurs custom
7. **Toutes les migrations SQL** : `server/migrations/*.sql`

## Logs et Debugging

**Backend** : Logs console dans Render dashboard

**Frontend** :
- Logs client dans console navigateur
- Erreurs API interceptées dans `services/api.js`

**Chercher les logs** :
```bash
# Backend
grep -rn "console.log\|console.error" server/src

# Frontend
grep -rn "console.log\|console.error" client/src
```

## Sécurité

- Mots de passe : bcrypt (10 rounds)
- JWT : HS256, expire après 7 jours
- CORS : Configuré pour le domaine frontend uniquement
- XSS : Protection native React
- SQL Injection : Requêtes paramétrées (`$1`, `$2`, etc.)

## Support et Contact

Pour toute question, consulter :
- `README.md` : Vue d'ensemble
- `server/README.md` : Documentation API complète
- `client/README.md` : Architecture frontend
- `DEPLOYMENT.md` : Guide de déploiement

---

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2025
```

---

## ✅ CHECKLIST AVANT SUPPRESSION

Avant d'appliquer les suppressions, vérifier :

- [ ] Créer une branche de backup : `git checkout -b cleanup-backup`
- [ ] Commit de sauvegarde : `git commit -am "Backup avant nettoyage"`
- [ ] Vérifier que les builds fonctionnent :
  ```bash
  cd server && npm install && npm start
  cd client && npm install && npm run build
  ```
- [ ] Créer `MAINTENANCE.md` avec le contenu ci-dessus
- [ ] Mettre à jour `server/README.md` pour corriger les références Prisma
- [ ] Supprimer les fichiers de la CATÉGORIE 1 (sûrs)
- [ ] Décider pour la CATÉGORIE 2 (demander confirmation utilisateur)
- [ ] Re-tester les builds après suppressions
- [ ] Commit final : `git commit -am "Nettoyage codebase : suppression assets demo + doc"`

---

## 📊 GAINS ESTIMÉS

### Fichiers supprimés (CATÉGORIE 1 seulement)
- `client/src/assets/react.svg` : ~2 KB
- `client/public/vite.svg` : ~1 KB
- `client/src/App.css` : ~1 KB

**Total** : ~4 KB (négligeable en taille, mais **clarté du projet améliorée**)

### Si CATÉGORIE 2 aussi supprimée
- `server/test-api.js` : ~10 KB
- `server/setup-smtp.js` : ~2 KB
- Documentation consolidée : -20 KB

**Total additionnel** : ~32 KB

### Gain Principal
- ✅ **Codebase plus claire** : Moins de fichiers obsolètes
- ✅ **Documentation cohérente** : Fusion des guides redondants
- ✅ **Maintenance facilitée** : Nouveau fichier MAINTENANCE.md centralisé

---

## 🎯 PROCHAINES ÉTAPES

1. **Lire ce rapport** et valider les catégories
2. **Confirmer** les suppressions de CATÉGORIE 2
3. **Créer** le fichier MAINTENANCE.md
4. **Exécuter** les suppressions approuvées
5. **Tester** que tout fonctionne
6. **Commit** et push

---

**Fin du rapport d'analyse**
