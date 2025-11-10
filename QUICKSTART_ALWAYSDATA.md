# Démarrage Rapide - Déploiement sur alwaysdata.net

## 📋 Checklist avant de commencer

- [ ] Compte alwaysdata créé (plan gratuit suffit pour débuter)
- [ ] Domaine configuré (ou utilisez le sous-domaine gratuit `[compte].alwaysdata.net`)
- [ ] Accès SSH activé
- [ ] Git installé sur votre machine locale

## 🚀 Déploiement en 10 minutes

### 1. Configuration initiale sur alwaysdata (Interface Web)

#### a) Base de données PostgreSQL
1. **Bases de données** > **PostgreSQL** > **Installer PostgreSQL**
2. Créer une base :
   - Nom: `scenacte_db`
   - ✏️ Noter : utilisateur, mot de passe, hôte

#### b) Site Node.js (API Backend)
1. **Web** > **Sites** > **Ajouter un site**
2. Configuration :
   - Type: **Node.js**
   - Nom: `scenacte-api`
   - Adresses: `api.[compte].alwaysdata.net` (ou votre domaine)
   - Version Node.js: **18** ou plus
   - Commande: `npm start`
   - Répertoire: `/home/[compte]/scenacte/server`

3. **Variables d'environnement** (à ajouter dans la config du site) :
```
DATABASE_URL=postgresql://[user]:[pass]@postgresql-[compte].alwaysdata.net:5432/[compte]_scenacte_db
JWT_SECRET=[générez_une_clé_avec_commande_ci-dessous]
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp-[compte].alwaysdata.net
SMTP_PORT=587
SMTP_USER=[email]@[domaine]
SMTP_PASSWORD=[pass]
SMTP_FROM=noreply@[domaine]
PORT=8080
NODE_ENV=production
CLIENT_URL=https://[compte].alwaysdata.net
MAX_CONTENT_SIZE_MB=10
```

💡 **Générer JWT_SECRET** : Sur votre machine locale :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### c) Site Frontend (React)
1. **Web** > **Sites** > **Ajouter un site**
2. Configuration :
   - Type: **Fichiers statiques** ou **Apache personnalisé**
   - Nom: `scenacte`
   - Adresses: `[compte].alwaysdata.net` (ou votre domaine principal)
   - Racine: `/home/[compte]/scenacte/client/dist`

### 2. Déploiement via SSH

#### a) Connexion SSH
```bash
ssh [compte]@ssh-[compte].alwaysdata.net
```

#### b) Cloner et installer
```bash
# Cloner le repository
git clone https://github.com/ThybTeud/scenacte.git
cd scenacte

# Configurer l'URL de l'API dans le frontend
nano client/.env.production
# Ajouter : VITE_API_URL=https://api.[compte].alwaysdata.net/api

# Installer et builder
cd server
npm install --production
cd ../client
npm install
npm run build

# Appliquer les migrations
cd ~/scenacte/server
PGPASSWORD=[password] psql -h postgresql-[compte].alwaysdata.net \
  -U [compte]_scenacte \
  -d [compte]_scenacte_db \
  -f migrations/init.sql
```

#### c) Démarrer l'application
```bash
# Le serveur démarre automatiquement après avoir créé le site Node.js
# Ou forcer le redémarrage :
mkdir -p ~/scenacte/server/tmp
touch ~/scenacte/server/tmp/restart.txt
```

### 3. Activer HTTPS
1. Dans **Web** > **Sites**, éditer chaque site
2. Cocher **Forcer HTTPS**
3. Let's Encrypt est automatiquement configuré ✨

### 4. Tester

#### API :
```bash
curl https://api.[compte].alwaysdata.net/api/health
# Devrait retourner : {"status":"ok","timestamp":"..."}
```

#### Frontend :
Ouvrez dans votre navigateur :
```
https://[compte].alwaysdata.net
```

## 🔄 Mises à jour futures

```bash
# SSH vers alwaysdata
ssh [compte]@ssh-[compte].alwaysdata.net

# Exécuter le script de déploiement
cd ~/scenacte
./deploy.sh
```

## 📊 Monitoring

### Voir les logs en temps réel
```bash
# Logs du serveur Node.js
tail -f ~/admin/logs/$(ls -t ~/admin/logs/*error.log | head -1)

# Logs d'accès
tail -f ~/admin/logs/$(ls -t ~/admin/logs/*access.log | head -1)
```

### Redémarrer le serveur manuellement
```bash
touch ~/scenacte/server/tmp/restart.txt
```

## ⚠️ Problèmes courants

### Le serveur Node.js ne démarre pas
- Vérifiez les logs : `~/admin/logs/`
- Vérifiez que toutes les variables d'environnement sont définies
- Vérifiez que le PORT est bien 8080

### Erreur de connexion à la base de données
- Testez la connexion manuellement :
```bash
psql -h postgresql-[compte].alwaysdata.net \
  -U [compte]_scenacte \
  -d [compte]_scenacte_db
```

### Le frontend ne se connecte pas à l'API
- Vérifiez que `VITE_API_URL` dans `.env.production` pointe vers votre API
- Vérifiez que `CLIENT_URL` sur le serveur pointe vers votre frontend
- Vérifiez que les deux sites sont en HTTPS

### Emails ne sont pas envoyés
- Vérifiez les identifiants SMTP dans les variables d'environnement
- Consultez les logs du serveur pour voir les erreurs SMTP

## 📞 Support

- Documentation alwaysdata : https://help.alwaysdata.com/fr/
- Assistance : depuis votre interface alwaysdata > **Support**
- GitHub Issues : https://github.com/ThybTeud/scenacte/issues

## 🎉 Félicitations !

Votre application Scenacte est maintenant en ligne ! 🚀
