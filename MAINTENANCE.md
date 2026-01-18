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
- `plays` : Pièces (version courante + statistics JSONB)
- `play_history` : Historique versions (+ statistics JSONB, sans html_content)
- `export_templates` : Templates PDF

**Migrations** : `server/db/migrations/`
- `000_init.sql` : Schéma complet (nouvelles installations)
- `001+` : Migrations incrémentales (bases existantes)

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

## Configuration Email

Le service email supporte **3 modes** configurables :

### 1. Mode Développement
```env
NODE_ENV=development
```
- Emails affichés uniquement dans la console
- Aucune configuration SMTP nécessaire
- Idéal pour le développement local

### 2. Mode SendGrid (RECOMMANDÉ pour production)
```env
SENDGRID_API_KEY=SG.xxx...
SMTP_FROM=noreply@votre-domaine.com
```
- **Avantages** : API HTTP, pas de problème de port
- **Idéal pour** : Render.com et autres PaaS
- **Configuration** :
  1. Créer un compte sur [SendGrid](https://sendgrid.com)
  2. Vérifier votre adresse email dans Settings → Sender Authentication
  3. Créer une API Key avec permissions d'envoi
  4. Ajouter `SENDGRID_API_KEY` dans votre `.env`

### 3. Mode SMTP (Fallback)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password
SMTP_FROM=Scenacte <noreply@scenacte.com>
```
- **Ports recommandés** :
  - Port 587 : TLS (recommandé)
  - Port 2525 : Alternative pour Render.com free tier
  - Port 465 : SSL (moins flexible)
- **Pour Gmail** : Utiliser un [App Password](https://support.google.com/accounts/answer/185833)

### Emails Envoyés
- **Bienvenue** : Après inscription
- **Réinitialisation** : Mot de passe oublié (lien valide 1h)

### Troubleshooting Email
```bash
# Vérifier les logs au démarrage
[EMAIL] ✓ SendGrid API configuré (mode HTTP)
# ou
[EMAIL] ✓ Connexion SMTP établie avec succès
# ou
[EMAIL] ⚠️ Aucun service d'email configuré
```

Si les emails ne partent pas :
1. Vérifier les variables d'environnement
2. Pour SendGrid : vérifier que l'adresse FROM est bien vérifiée
3. Pour SMTP : tester le port 2525 si 587 bloqué

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
- `CLEANUP_PLAN.md` : Rapport d'audit et nettoyage

---

**Version** : 1.0.0
**Dernière mise à jour** : Novembre 2025
