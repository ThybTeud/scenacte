# Guide de déploiement sur Render.com

Ce guide détaillé explique comment déployer l'application Scenacte sur Render.com, une plateforme cloud moderne pour héberger des applications web.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Architecture sur Render](#architecture-sur-render)
4. [Déploiement avec Blueprint](#déploiement-avec-blueprint)
5. [Déploiement manuel](#déploiement-manuel)
6. [Configuration des services](#configuration-des-services)
7. [Migrations de base de données](#migrations-de-base-de-données)
8. [Domaines personnalisés](#domaines-personnalisés)
9. [Monitoring et maintenance](#monitoring-et-maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

Scenacte est une application full-stack composée de :
- **Frontend** : React + Vite (site statique)
- **Backend** : Node.js + Express (API REST)
- **Base de données** : PostgreSQL

Sur Render.com, l'application sera déployée avec :
- Un **Static Site** pour le frontend React
- Un **Web Service** pour le backend Node.js
- Une **PostgreSQL Database** pour les données

---

## Prérequis

### Compte et accès
1. **Compte Render.com** : https://render.com (inscription gratuite)
2. **Repository GitHub** : Le code doit être sur GitHub
3. **Accès au repository** : Render doit pouvoir accéder au repository

### Connaissances requises
- Git et GitHub
- Variables d'environnement
- PostgreSQL (bases)
- Node.js et npm

### Plan Render recommandé
- **Développement/Test** : Plan gratuit (Free tier)
- **Production** :
  - Web Service Starter : $7/mois
  - PostgreSQL : $7/mois
  - Static Site : Gratuit

---

## Architecture sur Render

```
┌─────────────────────────────────────────────────────────────┐
│                         Render.com                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌─────────────────────────┐     │
│  │  Static Site     │      │    Web Service          │     │
│  │  (Frontend)      │─────▶│    (Backend API)        │     │
│  │  React + Vite    │      │    Node.js + Express    │     │
│  │  Port: 443       │      │    Port: 10000          │     │
│  └──────────────────┘      └─────────────────────────┘     │
│         │                            │                       │
│         │                            ▼                       │
│         │                   ┌──────────────────┐           │
│         │                   │   PostgreSQL     │           │
│         │                   │   Database       │           │
│         │                   └──────────────────┘           │
│         │                                                    │
│         └─────────── VITE_API_URL ─────────────────────────┤
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### URLs typiques
- **Frontend** : `https://scenacte-frontend.onrender.com`
- **Backend** : `https://scenacte-api.onrender.com`
- **API Endpoint** : `https://scenacte-api.onrender.com/api`

---

## Déploiement avec Blueprint

Le fichier `render.yaml` à la racine du projet permet un déploiement automatisé.

### 1. Préparation

Assurez-vous que le fichier `render.yaml` est présent à la racine du projet :

```yaml
services:
  - type: pserv
    name: scenacte-db
    plan: free
    ...

  - type: web
    name: scenacte-api
    ...

  - type: web
    name: scenacte-frontend
    ...
```

### 2. Déploiement

1. **Connectez-vous à Render** : https://dashboard.render.com
2. **Nouveau Blueprint** :
   - Cliquez sur **New** → **Blueprint**
   - Sélectionnez votre repository GitHub `scenacte`
3. **Revue de la configuration** :
   - Render lit automatiquement `render.yaml`
   - Vérifiez les 3 services : db, api, frontend
4. **Apply Blueprint** :
   - Cliquez sur **Apply**
   - Render crée les 3 services simultanément

### 3. Configuration post-déploiement

#### a) Variables SMTP (non incluses dans render.yaml)
Dans `scenacte-api` → **Environment**, ajoutez :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-app-password
SMTP_FROM=noreply@votre-domaine.com
```

Le service redémarrera automatiquement.

#### b) Configuration de l'URL de l'API pour le frontend

1. Notez l'URL du backend depuis le service **scenacte-api**
2. Dans `scenacte-frontend` → **Environment**, ajoutez :
   ```
   VITE_API_URL=https://scenacte-api.onrender.com/api
   ```
   ⚠️ Remplacez par votre URL réelle et incluez `/api` à la fin

3. Redéployez le frontend : **Manual Deploy** → **Deploy latest commit**

#### c) Migrations de base de données
Dans `scenacte-api` → **Shell** :
```bash
cd server
npm run db:migrate
```

### 4. Vérification

- **API Health** : `https://scenacte-api.onrender.com/api/health`
- **Frontend** : `https://scenacte-frontend.onrender.com`
- **Test complet** : Créez un compte et testez les fonctionnalités

---

## Déploiement manuel

Si vous préférez créer les services un par un.

### Étape 1 : Base de données PostgreSQL

#### Création
1. **Dashboard Render** → **New** → **PostgreSQL**
2. **Configuration** :
   - Name : `scenacte-db`
   - Database : `scenacte`
   - User : `scenacte`
   - Region : **Frankfurt** (Europe) ou Oregon (US)
   - PostgreSQL Version : 15 ou plus récent
   - Plan : **Free** (ou Starter pour production)

3. **Création** : Cliquez sur **Create Database**

#### Informations de connexion
Une fois créée, notez :
- **Internal Database URL** : `postgresql://scenacte:xxx@xxx.render.com/scenacte`
  - À utiliser pour le backend (connexions depuis Render)
- **External Database URL** : `postgresql://scenacte:xxx@xxx.render.com/scenacte`
  - À utiliser pour les connexions externes (migrations locales)

⚠️ **Important** : Utilisez toujours l'**Internal Database URL** pour le backend sur Render (pas de frais de bande passante).

---

### Étape 2 : Backend (Web Service)

#### Création du service
1. **Dashboard** → **New** → **Web Service**
2. **Repository** : Connectez votre repository GitHub `scenacte`
3. **Configuration** :
   - **Name** : `scenacte-api`
   - **Region** : Même région que la DB (Frankfurt recommandé)
   - **Branch** : `main`
   - **Root Directory** : *(laisser vide)*
   - **Runtime** : **Node**
   - **Build Command** : `./build.sh`
   - **Start Command** : `cd server && npm start`
   - **Plan** : **Free** ou **Starter ($7/mois)**

#### Variables d'environnement

Dans l'onglet **Environment** du service, ajoutez :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `NODE_ENV` | `production` | Mode de production |
| `PORT` | `10000` | Port Render par défaut |
| `DATABASE_URL` | `[Internal Database URL]` | URL de la base de données |
| `JWT_SECRET` | `[généré]` | Clé secrète JWT (32+ caractères) |
| `JWT_EXPIRES_IN` | `7d` | Durée de validité des tokens |
| `MAX_CONTENT_SIZE_MB` | `10` | Taille max des uploads |
| `CLIENT_URL` | `https://scenacte-frontend.onrender.com` | URL du frontend |
| `SMTP_HOST` | `smtp.gmail.com` | Serveur SMTP |
| `SMTP_PORT` | `587` | Port SMTP |
| `SMTP_USER` | `votre-email@gmail.com` | Utilisateur SMTP |
| `SMTP_PASSWORD` | `[app password]` | Mot de passe SMTP |
| `SMTP_FROM` | `noreply@votre-domaine.com` | Email expéditeur |

**Générer JWT_SECRET** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Générer un mot de passe Gmail** :
1. Allez sur https://myaccount.google.com/apppasswords
2. Créez un mot de passe pour "Scenacte"
3. Utilisez ce mot de passe (16 caractères) dans `SMTP_PASSWORD`

#### Health Check

Ajoutez un Health Check Path : `/api/health`

Cela permet à Render de vérifier que votre API fonctionne.

#### Déploiement

Cliquez sur **Create Web Service**. Le build démarre automatiquement.

---

### Étape 3 : Frontend (Static Site)

#### Création du site
1. **Dashboard** → **New** → **Static Site**
2. **Repository** : Même repository `scenacte`
3. **Configuration** :
   - **Name** : `scenacte-frontend`
   - **Region** : Même que l'API
   - **Branch** : `main`
   - **Root Directory** : *(laisser vide)*
   - **Build Command** : `./build-frontend.sh`
   - **Publish Directory** : `client/dist`

#### Variables d'environnement

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://scenacte-api.onrender.com/api` |

⚠️ Remplacez par l'URL réelle de votre backend.

#### Rewrite Rules (pour React Router)

Dans **Settings** → **Redirects/Rewrites**, ajoutez :
- **Source** : `/*`
- **Destination** : `/index.html`
- **Action** : `Rewrite`

Cela permet au routage React de fonctionner correctement.

#### Headers de sécurité (optionnel)

Dans **Settings** → **Headers**, ajoutez :

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
```

#### Déploiement

Cliquez sur **Create Static Site**. Le build démarre.

---

## Configuration des services

### Backend : Fichier .env (local uniquement)

Pour le développement local, créez `server/.env` :

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/scenacte
JWT_SECRET=your-local-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_CONTENT_SIZE_MB=10

# SMTP (en dev, les emails sont loggés, pas envoyés)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@scenacte.local
```

### Frontend : Fichier .env (local uniquement)

Pour le développement local, créez `client/.env.local` :

```env
VITE_API_URL=http://localhost:3000/api
```

Pour la production (build sur Render), les variables sont injectées lors du build.

---

## Migrations de base de données

### Appliquer les migrations sur Render

Une fois le backend déployé :

1. **Ouvrir le Shell** :
   - Allez dans `scenacte-api` → **Shell**
2. **Exécuter les migrations** :
   ```bash
   cd server
   npm run db:migrate
   ```

### Vérifier les tables

```bash
psql $DATABASE_URL -c "\dt"
```

Devrait afficher :
```
          List of relations
 Schema |       Name       | Type  | Owner
--------+------------------+-------+--------
 public | plays            | table | scenacte
 public | scenes           | table | scenacte
 public | users            | table | scenacte
 ...
```

### Migration manuelle (si nécessaire)

Si `npm run db:migrate` échoue :

```bash
cd server
cat migrations/init.sql | psql $DATABASE_URL
```

---

## Domaines personnalisés

### Configurer un domaine pour le frontend

1. **Acheter un domaine** (ex: `scenacte.com`)
2. **Dans Render** : `scenacte-frontend` → **Settings** → **Custom Domain**
3. **Ajouter le domaine** : `scenacte.com` et `www.scenacte.com`
4. **Configuration DNS** (chez votre registrar) :
   ```
   Type    Name    Value
   CNAME   www     scenacte-frontend.onrender.com
   ALIAS   @       scenacte-frontend.onrender.com
   ```
   *(ou A record si ALIAS non supporté)*

5. **Certificat SSL** : Render génère automatiquement un certificat Let's Encrypt

### Configurer un sous-domaine pour l'API

1. **Dans Render** : `scenacte-api` → **Settings** → **Custom Domain**
2. **Ajouter** : `api.scenacte.com`
3. **Configuration DNS** :
   ```
   Type    Name    Value
   CNAME   api     scenacte-api.onrender.com
   ```

4. **Mettre à jour les variables** :
   - Backend `CLIENT_URL` → `https://scenacte.com`
   - Frontend `VITE_API_URL` → `https://api.scenacte.com/api`
   - Redéployer le frontend après changement de `VITE_API_URL`

---

## Monitoring et maintenance

### Logs

#### Voir les logs en temps réel
1. **Service** → **Logs**
2. Les logs s'affichent avec coloration syntaxique

#### Filtrer les logs
- Logs d'erreur uniquement
- Logs de déploiement
- Logs applicatifs

### Métriques

Dans **Metrics** (services payants uniquement) :
- CPU usage
- Memory usage
- Request count
- Response time

### Alertes

Configurez des alertes :
1. **Service** → **Settings** → **Notifications**
2. Ajoutez :
   - Email
   - Slack
   - Discord
   - Webhook

### Redéploiement manuel

1. **Service** → **Manual Deploy** → **Deploy latest commit**
2. Ou : **Clear build cache & deploy**

### Rollback

1. **Service** → **Events**
2. Trouvez un déploiement précédent
3. **Rollback** à cette version

### Sauvegardes de la base de données

#### Plan gratuit
- Pas de sauvegarde automatique
- Faire des exports manuels réguliers

#### Plan payant
- Sauvegardes quotidiennes automatiques
- Rétention : 7 jours (Starter), 30 jours (Pro)

#### Export manuel

Depuis le **Shell** du backend :
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

Téléchargez le fichier ou uploadez-le sur S3/Dropbox.

#### Restauration

```bash
psql $DATABASE_URL < backup.sql
```

---

## Troubleshooting

### Le backend ne démarre pas

#### Symptômes
- Service en statut "Deploy failed"
- Logs d'erreur au démarrage

#### Solutions
1. **Vérifiez les logs** :
   - Onglet **Logs** pour voir l'erreur exacte
2. **Vérifiez le Build Command** :
   - Doit être `./build.sh`
   - Le fichier doit être exécutable (`chmod +x build.sh`)
3. **Vérifiez DATABASE_URL** :
   - Doit être l'**Internal Database URL**
   - Testez dans le Shell : `psql $DATABASE_URL -c "SELECT 1"`
4. **Vérifiez les dépendances** :
   ```bash
   cd server
   npm install
   ```

### Erreur de connexion à la base de données

#### Symptômes
- `ECONNREFUSED` ou `ETIMEDOUT`
- Logs : "Connection error"

#### Solutions
1. **Vérifiez que la DB est démarrée** :
   - Allez dans `scenacte-db`, statut doit être "Available"
2. **Utilisez Internal Database URL** :
   - Pas l'External URL (coûts de bande passante)
3. **Testez la connexion** depuis le Shell :
   ```bash
   psql $DATABASE_URL -c "SELECT version()"
   ```

### Le frontend ne se connecte pas à l'API

#### Symptômes
- Erreurs CORS dans la console navigateur
- Erreurs 404 sur les appels API
- Frontend affiche "Erreur de connexion au serveur"

#### Solutions
1. **Vérifiez VITE_API_URL** :
   - Doit pointer vers l'URL complète de l'API
   - Exemple : `https://scenacte-api.onrender.com/api`
2. **Vérifiez CLIENT_URL dans le backend** :
   - Doit pointer vers l'URL du frontend
   - Exemple : `https://scenacte-frontend.onrender.com`
3. **Testez l'API manuellement** :
   ```bash
   curl https://scenacte-api.onrender.com/api/health
   ```
   Doit retourner : `{"status":"ok","timestamp":"..."}`

4. **Redéployez le frontend** après changement de `VITE_API_URL` :
   - Les variables Vite sont injectées au build
   - Modifier la variable ne suffit pas, il faut rebuild

### Erreur 502 Bad Gateway

#### Symptômes
- Le service affiche "502 Bad Gateway"

#### Solutions
1. **Le service démarre-t-il ?**
   - Vérifiez les logs
   - Le premier démarrage peut prendre 1-2 minutes
2. **Le port est-il correct ?**
   - Doit écouter sur `process.env.PORT` (10000 sur Render)
   - Vérifiez `server/src/server.js` : `app.listen(config.server.port)`
3. **Health check échoue ?**
   - Testez `/api/health` manuellement
   - Vérifiez que la route existe

### Service en "Sleep" (plan gratuit)

#### Symptômes
- Service s'endort après 15 minutes d'inactivité
- Premier accès très lent (30-60 secondes)

#### Solutions
1. **Plan gratuit** :
   - C'est normal, Render arrête les services inactifs
   - Services redémarrent au premier accès
2. **Upgrade vers Starter** ($7/mois) :
   - Services toujours actifs
   - Pas de latence au démarrage

### Emails ne sont pas envoyés

#### Symptômes
- Pas d'email reçu (inscription, reset password)
- Logs : "Email error"

#### Solutions
1. **Vérifiez les identifiants SMTP** :
   - `SMTP_USER` et `SMTP_PASSWORD` corrects
   - Pour Gmail, utilisez un **App Password**
2. **Vérifiez le mode** :
   - En `NODE_ENV=development`, les emails sont loggés, pas envoyés
   - En production, ils sont vraiment envoyés
3. **Testez avec un service externe** :
   - Gmail, SendGrid, Mailgun, etc.
4. **Consultez les logs détaillés** :
   ```bash
   # Dans le Shell du backend
   tail -f /dev/stdout
   ```

### Déploiement très lent

#### Symptômes
- Build prend plus de 5-10 minutes

#### Solutions
1. **Nettoyez le cache** :
   - **Manual Deploy** → **Clear build cache & deploy**
2. **Optimisez les dépendances** :
   - Utilisez `npm ci` au lieu de `npm install`
   - Supprimez les devDependencies inutiles
3. **Vérifiez les scripts de build** :
   - `build.sh` : doit installer uniquement les dépendances prod
   - `build-frontend.sh` : doit build le frontend uniquement

---

## Ressources

### Documentation officielle
- **Render Docs** : https://render.com/docs
- **PostgreSQL sur Render** : https://render.com/docs/databases
- **Web Services** : https://render.com/docs/web-services
- **Static Sites** : https://render.com/docs/static-sites

### Support
- **Discord Render** : https://render.com/discord
- **Email Support** : support@render.com (réponse sous 24h)
- **GitHub Issues Scenacte** : https://github.com/ThybTeud/scenacte/issues

### Tutoriels
- **Déployer une app Node.js** : https://render.com/docs/deploy-node-express-app
- **Déployer une app React** : https://render.com/docs/deploy-create-react-app
- **Blueprint (Infrastructure as Code)** : https://render.com/docs/blueprint-spec

---

## Checklist de déploiement

Avant de déployer en production :

- [ ] Toutes les variables d'environnement sont définies
- [ ] JWT_SECRET est sécurisé (32+ caractères aléatoires)
- [ ] Les URLs sont correctes (CLIENT_URL, VITE_API_URL)
- [ ] Les migrations sont appliquées
- [ ] Le Health Check fonctionne
- [ ] SMTP est configuré et testé
- [ ] Les CORS sont configurés correctement
- [ ] SSL/HTTPS est activé
- [ ] Un domaine personnalisé est configuré (optionnel)
- [ ] Les sauvegardes sont planifiées
- [ ] Les alertes sont configurées
- [ ] La documentation est à jour

---

## Conclusion

Vous avez maintenant déployé Scenacte sur Render.com avec succès ! 🎉

Pour toute question ou problème, consultez :
- La section [Troubleshooting](#troubleshooting) ci-dessus
- Le fichier [QUICKSTART_RENDER.md](./QUICKSTART_RENDER.md) pour un guide rapide
- Les [GitHub Issues](https://github.com/ThybTeud/scenacte/issues)

Bon développement ! 🚀
