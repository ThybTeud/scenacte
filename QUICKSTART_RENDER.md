# Démarrage Rapide - Déploiement sur Render.com

## 📋 Checklist avant de commencer

- [ ] Compte Render.com créé (plan gratuit suffit pour débuter)
- [ ] Repository GitHub accessible depuis Render
- [ ] Git installé sur votre machine locale

## 🚀 Déploiement en 10 minutes

### Option 1 : Déploiement automatique avec Blueprint (Recommandé)

Cette méthode utilise le fichier `render.yaml` pour déployer automatiquement tous les services.

#### 1. Connexion à Render
1. Allez sur https://render.com
2. Connectez-vous avec votre compte GitHub
3. Autorisez Render à accéder à vos repositories

#### 2. Déployer avec Blueprint
1. Cliquez sur **New** > **Blueprint**
2. Sélectionnez votre repository `scenacte`
3. Render détectera automatiquement le fichier `render.yaml`
4. Cliquez sur **Apply** pour créer tous les services (base de données, backend, frontend)
5. Attendez que les services se déploient (2-5 minutes)

#### 3. Configuration post-déploiement

##### a) Configurer les variables SMTP (Backend)
1. Allez dans le service **scenacte-api**
2. Ouvrez l'onglet **Environment**
3. Ajoutez les variables suivantes :
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASSWORD=votre-mot-de-passe-app
   SMTP_FROM=noreply@votre-domaine.com
   ```
4. Le service redémarrera automatiquement

💡 **Pour Gmail** : Générez un mot de passe d'application depuis https://myaccount.google.com/apppasswords

💡 **Autres services SMTP** : Utilisez SendGrid, Mailgun, ou tout autre service SMTP compatible

##### b) Configurer l'URL de l'API (Frontend)
1. Notez l'URL du backend depuis le service **scenacte-api** (ex: `https://scenacte-api.onrender.com`)
2. Allez dans le service **scenacte-frontend**
3. Ouvrez l'onglet **Environment**
4. Ajoutez la variable :
   ```
   VITE_API_URL=https://scenacte-api.onrender.com/api
   ```
   ⚠️ **Important** : Remplacez par votre URL réelle et ajoutez `/api` à la fin
5. Allez dans l'onglet **Manual Deploy**
6. Cliquez sur **Deploy latest commit** pour reconstruire le frontend avec la bonne URL

#### 4. Appliquer les migrations
1. Allez dans le service **scenacte-api**
2. Ouvrez l'onglet **Shell**
3. Exécutez :
   ```bash
   cd server
   npm run db:migrate
   ```

#### 5. Tester
- **API** : Visitez `https://scenacte-api.onrender.com/api/health`
- **Frontend** : Visitez `https://scenacte-frontend.onrender.com`
- **Test complet** : Essayez de vous inscrire et de créer une pièce

---

### Option 2 : Déploiement manuel

#### 1. Créer la base de données PostgreSQL
1. Dans Render Dashboard, cliquez sur **New** > **PostgreSQL**
2. Configurez :
   - **Name** : `scenacte-db`
   - **Database** : `scenacte`
   - **User** : `scenacte`
   - **Region** : Frankfurt (ou le plus proche)
   - **Plan** : Free
3. Cliquez sur **Create Database**
4. ✏️ **Notez** l'URL de connexion (Internal Database URL)

#### 2. Déployer le Backend (API)
1. Cliquez sur **New** > **Web Service**
2. Connectez votre repository GitHub
3. Configurez :
   - **Name** : `scenacte-api`
   - **Region** : Frankfurt
   - **Branch** : `main`
   - **Root Directory** : (laisser vide)
   - **Runtime** : Node
   - **Build Command** : `./build.sh`
   - **Start Command** : `cd server && npm start`
   - **Plan** : Free

4. **Variables d'environnement** (onglet Environment) :
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=[copier Internal Database URL depuis scenacte-db]
   JWT_SECRET=[générer avec la commande ci-dessous]
   JWT_EXPIRES_IN=7d
   MAX_CONTENT_SIZE_MB=10
   CLIENT_URL=https://scenacte-frontend.onrender.com
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=votre-email@gmail.com
   SMTP_PASSWORD=votre-mot-de-passe-app
   SMTP_FROM=noreply@votre-domaine.com
   ```

💡 **Générer JWT_SECRET** :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Ajoutez un **Health Check Path** : `/api/health`
6. Cliquez sur **Create Web Service**

#### 3. Appliquer les migrations
Une fois le service déployé :
1. Ouvrez l'onglet **Shell** dans `scenacte-api`
2. Exécutez :
   ```bash
   cd server
   npm run db:migrate
   ```

#### 4. Déployer le Frontend
1. Cliquez sur **New** > **Static Site**
2. Connectez le même repository GitHub
3. Configurez :
   - **Name** : `scenacte-frontend`
   - **Region** : Frankfurt
   - **Branch** : `main`
   - **Root Directory** : (laisser vide)
   - **Build Command** : `./build-frontend.sh`
   - **Publish Directory** : `client/dist`

4. **Variables d'environnement** :
   ```
   VITE_API_URL=https://scenacte-api.onrender.com/api
   ```

5. **Rewrite Rules** (pour React Router) :
   - Source : `/*`
   - Destination : `/index.html`
   - Action : `Rewrite`

6. Cliquez sur **Create Static Site**

#### 5. Mettre à jour CLIENT_URL dans l'API
1. Retournez dans le service **scenacte-api**
2. Onglet **Environment**
3. Modifiez `CLIENT_URL` avec l'URL réelle du frontend :
   ```
   CLIENT_URL=https://scenacte-frontend.onrender.com
   ```
4. Le service redémarrera automatiquement

---

## 🔄 Déploiement continu

Render redéploie automatiquement votre application à chaque push sur la branche `main` :
- Le backend redémarre automatiquement
- Le frontend est reconstruit et redéployé

Pour désactiver les déploiements automatiques :
1. Allez dans les paramètres du service
2. Désactivez **Auto-Deploy**

---

## 📊 Monitoring

### Voir les logs en temps réel
1. Ouvrez le service dans Render Dashboard
2. Cliquez sur l'onglet **Logs**
3. Les logs s'affichent en temps réel

### Métriques disponibles
- **Metrics** : CPU, mémoire, requêtes
- **Events** : Historique des déploiements

---

## 🔧 Configuration avancée

### Domaine personnalisé
1. Ouvrez le service (frontend ou backend)
2. Onglet **Settings** > **Custom Domain**
3. Ajoutez votre domaine
4. Configurez les enregistrements DNS selon les instructions

### Certificat SSL
Render génère automatiquement un certificat Let's Encrypt pour :
- Les domaines `.onrender.com`
- Les domaines personnalisés configurés

### Variables d'environnement par branche
Vous pouvez créer des environnements différents :
- `main` → Production
- `staging` → Staging
- `dev` → Développement

---

## ⚠️ Problèmes courants

### Le backend ne démarre pas
- **Vérifiez les logs** dans l'onglet Logs
- **Vérifiez DATABASE_URL** : doit être l'Internal Database URL
- **Vérifiez le Build Command** : `./build.sh` doit être exécutable

### Le frontend ne se connecte pas à l'API
- **Vérifiez VITE_API_URL** dans les variables d'environnement du frontend
- **Vérifiez CLIENT_URL** dans les variables d'environnement du backend
- **Testez l'API** : `curl https://scenacte-api.onrender.com/api/health`

### Erreur de connexion à la base de données
- **Utilisez Internal Database URL** (pas l'External)
- **Vérifiez** que la base de données est bien démarrée
- **Testez depuis le Shell** :
  ```bash
  psql $DATABASE_URL -c "SELECT 1"
  ```

### Les migrations ne s'appliquent pas
- **Vérifiez** que vous êtes dans le bon répertoire : `cd server`
- **Vérifiez** que DATABASE_URL est défini
- **Exécutez manuellement** :
  ```bash
  cd server
  cat migrations/init.sql | psql $DATABASE_URL
  ```

### Service en sleep (plan gratuit)
⚠️ **Limitation du plan gratuit** : Les services s'endorment après 15 minutes d'inactivité
- Le premier démarrage peut prendre 30-60 secondes
- **Solution** : Passez au plan payant (~$7/mois) pour avoir des services toujours actifs

### Emails ne sont pas envoyés
- **Vérifiez les identifiants SMTP** dans les variables d'environnement
- **Utilisez un mot de passe d'application** pour Gmail
- **Consultez les logs** pour voir les erreurs SMTP détaillées
- **En développement** : Les emails sont loggés dans la console (pas envoyés)

---

## 💰 Coûts

### Plan gratuit (recommandé pour débuter)
- ✅ **Base de données PostgreSQL** : 90 jours gratuits, puis $7/mois
- ✅ **Web Services** : 750 heures gratuites par mois (suffisant pour 1 service)
- ✅ **Static Sites** : Illimité et gratuit
- ⚠️ Services s'endorment après 15 minutes d'inactivité
- ⚠️ 100 Go de bande passante par mois

### Plan payant (pour production)
- **Starter** : $7/mois par service
  - Services toujours actifs (pas de sleep)
  - 100 Go de bande passante
- **Database** : $7/mois
  - 1 Go de stockage
  - Sauvegardes quotidiennes

---

## 📞 Support

- **Documentation Render** : https://render.com/docs
- **Discord Render** : https://render.com/discord
- **Support Render** : dashboard > Help > Contact Support
- **GitHub Issues** : https://github.com/ThybTeud/scenacte/issues

---

## 🎉 Félicitations !

Votre application Scenacte est maintenant en ligne sur Render.com ! 🚀

### URLs de votre application :
- **Frontend** : https://scenacte-frontend.onrender.com
- **API** : https://scenacte-api.onrender.com/api
- **Health Check** : https://scenacte-api.onrender.com/api/health

### Prochaines étapes :
1. ✅ Configurez un domaine personnalisé
2. ✅ Testez toutes les fonctionnalités
3. ✅ Configurez les sauvegardes de la base de données
4. ✅ Surveillez les métriques et les logs
