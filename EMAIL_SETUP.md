# Configuration des Emails - Scenacte

## 🚀 Configuration Rapide (Render.com)

### Option 1 : SendGrid (Recommandé) ✅

SendGrid utilise une API HTTP (pas de problème de port SMTP bloqué sur Render).

#### 1. Créer un compte SendGrid
1. Allez sur https://sendgrid.com/
2. Créez un compte gratuit (100 emails/jour)
3. Vérifiez votre email

#### 2. Créer une API Key
1. Allez dans **Settings** → **API Keys**
2. Cliquez sur **Create API Key**
3. Nom : `Scenacte Production`
4. Type : **Full Access** (ou **Restricted Access** avec permissions Mail Send)
5. Copiez la clé (vous ne pourrez plus la voir après)

#### 3. Vérifier votre adresse d'expédition
1. Allez dans **Settings** → **Sender Authentication**
2. Cliquez sur **Verify a Single Sender**
3. Remplissez le formulaire avec vos informations
4. Vérifiez votre email

#### 4. Configurer sur Render.com
Dans votre service `scenacte-api` sur Render :

1. **Environment** → Ajoutez :
   ```
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
   EMAIL_FROM=votre-email-verifie@example.com
   ```

2. Le service redémarrera automatiquement

#### 5. Tester
- Inscrivez-vous sur votre application
- Vous devriez recevoir l'email de bienvenue !

---

### Option 2 : SMTP avec port 2525

Si vous ne voulez pas utiliser SendGrid, vous pouvez utiliser un serveur SMTP avec le port 2525 (non bloqué sur Render free tier).

#### Services SMTP supportant le port 2525 :
- **SMTP2GO** (https://www.smtp2go.com/) - 1000 emails/mois gratuits
- **Mailtrap** (https://mailtrap.io/) - Pour les tests uniquement
- **Mailgun** (https://www.mailgun.com/) - 100 emails/jour gratuits

#### Configuration sur Render.com :
```
SMTP_HOST=smtp.smtp2go.com
SMTP_PORT=2525
SMTP_USER=votre-username
SMTP_PASSWORD=votre-password
EMAIL_FROM=noreply@votre-domaine.com
```

⚠️ **Important** : N'utilisez **PAS** les ports 25, 465 ou 587 sur Render.com (plan gratuit) - ils sont bloqués !

---

### Option 3 : Plan Payant Render (~$7/mois)

Si vous passez au plan payant, les ports SMTP standards sont débloqués.

Configuration Gmail :
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
EMAIL_FROM=votre-email@gmail.com
```

💡 Pour Gmail, générez un **mot de passe d'application** : https://myaccount.google.com/apppasswords

---

## 🔧 Variables d'Environnement

### SendGrid (Recommandé)
```bash
# API SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx

# Adresse d'expédition (doit être vérifiée sur SendGrid)
EMAIL_FROM=noreply@votre-domaine.com
```

### SMTP (Alternative)
```bash
# Serveur SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=2525              # 2525 pour Render free tier, 587 pour plan payant
SMTP_USER=votre-username
SMTP_PASSWORD=votre-password

# Adresse d'expédition
EMAIL_FROM=noreply@votre-domaine.com
```

---

## 🧪 Tester en Local

### Mode Développement
En mode développement (`NODE_ENV=development`), les emails ne sont pas envoyés. Ils sont affichés dans la console.

### Tester avec SendGrid
```bash
cd server
export NODE_ENV=production
export SENDGRID_API_KEY=SG.xxx
export EMAIL_FROM=votre-email@example.com
export DATABASE_URL=...
export JWT_SECRET=...
npm start
```

### Tester avec SMTP (Mailtrap)
```bash
cd server
export NODE_ENV=production
export SMTP_HOST=smtp.mailtrap.io
export SMTP_PORT=2525
export SMTP_USER=votre-username
export SMTP_PASSWORD=votre-password
export EMAIL_FROM=test@scenacte.com
export DATABASE_URL=...
export JWT_SECRET=...
npm start
```

---

## 📊 Comparaison des Services

| Service | Gratuit | Emails/jour | API HTTP | Port 2525 | Recommandé |
|---------|---------|-------------|----------|-----------|------------|
| **SendGrid** | ✅ | 100 | ✅ | N/A | ⭐⭐⭐⭐⭐ |
| **SMTP2GO** | ✅ | ~33 (1000/mois) | ❌ | ✅ | ⭐⭐⭐⭐ |
| **Mailgun** | ✅ | 100 | ✅ | ✅ | ⭐⭐⭐⭐ |
| **Mailtrap** | ✅ | Illimité | ❌ | ✅ | ⭐⭐ (tests) |
| **Gmail SMTP** | ✅ | 500 | ❌ | ❌ | ⭐ (plan payant) |

---

## ❓ FAQ

### Les emails ne sont pas envoyés
1. **Vérifiez les logs** dans Render → Logs
2. **Cherchez** `[EMAIL]` dans les logs
3. **Vérifiez** que vous voyez : `✓ Service d'email : SendGrid` ou `✓ Service d'email : SMTP`

### Erreur "ETIMEDOUT" ou "Connection timeout"
- Vous utilisez probablement un port bloqué (25, 465, 587) sur Render free tier
- Solution : Utilisez **SendGrid** ou changez pour le **port 2525**

### Erreur "Unauthorized" avec SendGrid
- Votre API Key est invalide ou n'a pas les bonnes permissions
- Recréez une API Key avec **Full Access**

### Erreur "Sender not verified" avec SendGrid
- Vous devez vérifier votre adresse d'expédition sur SendGrid
- Allez dans **Settings** → **Sender Authentication**

### Les emails arrivent en spam
- Ajoutez un **SPF record** et **DKIM** pour votre domaine
- SendGrid et Mailgun fournissent ces configurations automatiquement

---

## 🔐 Sécurité

1. **Ne commitez JAMAIS** vos clés API ou mots de passe dans Git
2. Utilisez les **variables d'environnement** de Render
3. Pour SendGrid, utilisez des **Restricted API Keys** en production
4. Rotez vos clés régulièrement

---

## 📚 Ressources

- [Documentation SendGrid](https://docs.sendgrid.com/)
- [Documentation Render - SMTP](https://render.com/docs/web-services#port-binding)
- [Liste des ports bloqués sur Render](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)
- [Guide Gmail App Passwords](https://support.google.com/accounts/answer/185833)

---

## 💬 Support

Si vous avez des problèmes :
1. Vérifiez les logs : `[EMAIL]` dans Render
2. Testez en local d'abord
3. Ouvrez une issue sur GitHub

---

**Bonne configuration ! 📧**
