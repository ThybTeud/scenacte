# Guide de déploiement sur alwaysdata.net

## Prérequis sur alwaysdata

1. **Compte alwaysdata** : Créez un compte sur https://www.alwaysdata.com
2. **Plan Node.js** : Assurez-vous d'avoir un plan qui supporte Node.js (dès le plan gratuit)
3. **Accès SSH** : Activez l'accès SSH dans votre interface alwaysdata

## Étape 1 : Configuration de la base de données PostgreSQL

### 1.1 Créer la base de données
1. Connectez-vous à votre interface alwaysdata
2. Allez dans **Bases de données** > **PostgreSQL**
3. Cliquez sur **Installer PostgreSQL** si ce n'est pas déjà fait
4. Créez une nouvelle base de données :
   - Nom : `scenacte_db` (ou autre)
   - Utilisateur : noter le nom d'utilisateur généré
   - Mot de passe : noter le mot de passe généré

### 1.2 Appliquer les migrations
```bash
# Depuis votre machine locale, connectez-vous via SSH
ssh [votre-compte]@ssh-[votre-compte].alwaysdata.net

# Naviguez vers votre dossier
cd ~/scenacte/server

# Exécutez les migrations
PGPASSWORD=votre_password psql -h postgresql-[votre-compte].alwaysdata.net \
  -U [votre-compte]_scenacte \
  -d [votre-compte]_scenacte_db \
  -f migrations/init.sql
```

## Étape 2 : Configuration du serveur Node.js

### 2.1 Créer un site Node.js
1. Dans l'interface alwaysdata, allez dans **Web** > **Sites**
2. Cliquez sur **Ajouter un site**
3. Configurez :
   - **Type** : Node.js
   - **Nom** : scenacte (ou scenacte-api pour l'API)
   - **Adresses** : api.votre-domaine.com (ou sous-dossier /api)
   - **Version Node.js** : 18 ou supérieure
   - **Commande** : `npm start`
   - **Répertoire de travail** : `/home/[compte]/scenacte/server`
   - **Variables d'environnement** : Voir section suivante

### 2.2 Variables d'environnement du serveur
Dans la configuration du site Node.js, ajoutez ces variables :

```
DATABASE_URL=postgresql://[user]:[password]@postgresql-[compte].alwaysdata.net:5432/[compte]_scenacte_db
JWT_SECRET=[générer_une_clé_sécurisée_longue]
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp-[compte].alwaysdata.net
SMTP_PORT=587
SMTP_USER=[votre-email]@votre-domaine.com
SMTP_PASSWORD=[password_smtp]
SMTP_FROM=noreply@votre-domaine.com
PORT=8080
NODE_ENV=production
CLIENT_URL=https://votre-domaine.com
MAX_CONTENT_SIZE_MB=10
```

**Important** :
- Remplacez `[compte]` par votre compte alwaysdata
- Générez un JWT_SECRET sécurisé (au moins 32 caractères aléatoires)
- Le PORT doit être celui assigné par alwaysdata (généralement 8080)

## Étape 3 : Déploiement du frontend (React)

### 3.1 Build en local
```bash
cd client
npm install
npm run build
```

### 3.2 Créer un site Web statique
1. Dans **Web** > **Sites**, créez un nouveau site
2. Configurez :
   - **Type** : Fichiers statiques ou Apache personnalisé
   - **Adresses** : votre-domaine.com
   - **Racine** : `/home/[compte]/scenacte/client/dist`

### 3.3 Configuration de l'API URL
Créez ou modifiez `client/.env.production` :
```
VITE_API_URL=https://api.votre-domaine.com/api
```
Puis rebuild :
```bash
npm run build
```

### 3.4 Fichier de configuration Apache (optionnel)
Créez `client/dist/.htaccess` pour le routing React :
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

## Étape 4 : Déploiement via Git (méthode recommandée)

### 4.1 Configuration Git sur alwaysdata
```bash
# SSH vers alwaysdata
ssh [compte]@ssh-[compte].alwaysdata.net

# Cloner le repository
cd ~
git clone https://github.com/ThybTeud/scenacte.git
cd scenacte

# Installer les dépendances du serveur
cd server
npm install --production

# Build et déployer le client
cd ../client
npm install
npm run build
```

### 4.2 Script de déploiement automatique
Créez `deploy.sh` à la racine :
```bash
#!/bin/bash
cd ~/scenacte
git pull origin main
cd server
npm install --production
cd ../client
npm install
npm run build
# Redémarrer le serveur Node.js
touch ~/scenacte/server/tmp/restart.txt
```

## Étape 5 : Configuration SMTP (alwaysdata)

alwaysdata fournit un serveur SMTP gratuit :
- **Host** : `smtp-[compte].alwaysdata.net`
- **Port** : 587 (STARTTLS) ou 465 (SSL)
- **Authentification** : Vos identifiants alwaysdata ou créez une adresse email

## Étape 6 : SSL/HTTPS

1. Dans **Web** > **Sites**, éditez votre site
2. Activez **Forcer HTTPS**
3. alwaysdata génère automatiquement un certificat Let's Encrypt

## Étape 7 : Tester le déploiement

### 7.1 Tester l'API
```bash
curl https://api.votre-domaine.com/api/health
```

### 7.2 Tester le frontend
Ouvrez `https://votre-domaine.com` dans votre navigateur

### 7.3 Logs du serveur
```bash
# Via SSH
tail -f ~/admin/logs/[date]-[site-id]-error.log
tail -f ~/admin/logs/[date]-[site-id]-access.log
```

## Étape 8 : Maintenance

### Mettre à jour l'application
```bash
ssh [compte]@ssh-[compte].alwaysdata.net
cd ~/scenacte
./deploy.sh
```

### Sauvegardes de la base de données
```bash
# Export
pg_dump -h postgresql-[compte].alwaysdata.net \
  -U [compte]_scenacte \
  -d [compte]_scenacte_db \
  > backup_$(date +%Y%m%d).sql

# Import
psql -h postgresql-[compte].alwaysdata.net \
  -U [compte]_scenacte \
  -d [compte]_scenacte_db \
  < backup.sql
```

## Troubleshooting

### Le serveur Node.js ne démarre pas
- Vérifiez les logs : `~/admin/logs/`
- Vérifiez la configuration du site dans l'interface
- Assurez-vous que le PORT correspond à celui assigné par alwaysdata

### Erreurs de connexion à la base de données
- Vérifiez DATABASE_URL dans les variables d'environnement
- Testez la connexion PostgreSQL manuellement

### Le frontend ne charge pas l'API
- Vérifiez VITE_API_URL dans la production build
- Vérifiez les CORS dans le serveur (CLIENT_URL)
- Vérifiez que les deux sites sont en HTTPS

## Ressources

- Documentation alwaysdata Node.js : https://help.alwaysdata.com/fr/langages/nodejs/
- Documentation PostgreSQL : https://help.alwaysdata.com/fr/bases-de-donnees/postgresql/
- Support alwaysdata : https://help.alwaysdata.com/fr/
