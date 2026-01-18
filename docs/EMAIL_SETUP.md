# Configuration Email avec Resend

## Vue d'ensemble

Scenacte utilise [Resend](https://resend.com) pour l'envoi d'emails transactionnels :
- Email de bienvenue après inscription
- Email de réinitialisation de mot de passe

## Configuration locale (Développement)

En mode développement (`NODE_ENV=development`), les emails ne sont pas envoyés mais affichés dans la console du serveur. Aucune configuration n'est nécessaire.

## Configuration Production

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com)
2. Créez un compte gratuit (3 000 emails/mois, 100/jour)
3. Obtenez votre clé API dans le dashboard

### 2. Configurer les variables d'environnement

Ajoutez ces variables dans votre fichier `.env` (ou dans votre plateforme de déploiement) :

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@scenacte.fr
```

**Important** : La clé API commence toujours par `re_`

### 3. Configuration DNS pour le domaine scenacte.fr

Pour que Resend puisse envoyer des emails depuis `noreply@scenacte.fr`, vous devez ajouter les enregistrements DNS suivants :

#### a) Vérification du domaine

Resend vous fournira des enregistrements à ajouter dans votre zone DNS. Connectez-vous au dashboard Resend et allez dans **Domains** → **Add Domain** → `scenacte.fr`

#### b) Enregistrements SPF, DKIM et DMARC

Resend génère automatiquement les enregistrements nécessaires. Vous devrez ajouter :

**SPF (TXT)** - Autorise Resend à envoyer des emails pour votre domaine
```
Type: TXT
Name: @
Value: v=spf1 include:resend.com ~all
```
*Note : Si vous avez déjà un enregistrement SPF, ajoutez `include:resend.com` à l'existant*

**DKIM (TXT)** - Signature cryptographique des emails (3 enregistrements fournis par Resend)
```
Type: TXT
Name: resend._domainkey
Value: [fourni par Resend]

Type: TXT
Name: resend2._domainkey
Value: [fourni par Resend]

Type: TXT
Name: resend3._domainkey
Value: [fourni par Resend]
```

**DMARC (TXT)** - Politique de gestion des emails non authentifiés (optionnel mais recommandé)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:postmaster@scenacte.fr
```

#### c) Vérification de la configuration

Après avoir ajouté les enregistrements DNS :
1. Attendez la propagation DNS (peut prendre jusqu'à 48h, généralement < 1h)
2. Dans le dashboard Resend, cliquez sur "Verify Domain"
3. Une fois vérifié, vous pouvez envoyer des emails

### 4. Test de la configuration

Pour tester l'envoi d'emails en production :

1. Démarrez le serveur en mode production avec les bonnes variables d'environnement
2. Créez un nouveau compte utilisateur
3. Vérifiez que l'email de bienvenue est bien reçu
4. Testez la fonctionnalité "Mot de passe oublié"

## Limites du plan gratuit

- **3 000 emails/mois**
- **100 emails/jour**
- Pas de limite sur le nombre de domaines

Si vous dépassez ces limites, passez au plan payant ou contactez Resend.

## Migration future vers Brevo

Une migration vers Brevo est prévue ultérieurement lors du déploiement sur Scalingo (conformité RGPD). Cette documentation sera mise à jour en conséquence.

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez que `RESEND_API_KEY` est bien définie
2. Vérifiez que la clé API est valide dans le dashboard Resend
3. Vérifiez que le domaine est vérifié dans Resend
4. Consultez les logs du serveur pour voir les erreurs

### Erreur "Domain not verified"

Le domaine n'est pas encore vérifié dans Resend. Ajoutez les enregistrements DNS et attendez la vérification.

### Erreur "Invalid API key"

La clé API est incorrecte ou a été révoquée. Générez une nouvelle clé dans le dashboard Resend.

## Support

- [Documentation Resend](https://resend.com/docs)
- [Dashboard Resend](https://resend.com/domains)
- [Status page Resend](https://resend.com/status)
