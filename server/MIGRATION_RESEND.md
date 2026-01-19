# Migration SendGrid → Resend - Résolution du problème de queue

## 📋 Problème initial

Après la migration de SendGrid vers Resend, les emails n'étaient pas envoyés :
- ✅ Les emails étaient ajoutés à la queue PgBoss (log visible : "Email ajouté à la queue")
- ❌ Aucun email n'était jamais envoyé (aucun log côté Resend, aucun email reçu)
- ❌ Le worker PgBoss ne traitait jamais les jobs

## 🔍 Diagnostic

### Problème #1 : Mode développement bloquait la queue

**Symptôme** : En mode développement, les fonctions `sendWelcomeEmail` et `sendPasswordResetEmail` affichaient l'email directement dans la console et faisaient un `return` précoce, sans jamais ajouter l'email à la queue.

**Impact** : Le worker n'était jamais sollicité, impossible de tester le flow complet en développement.

**Solution** :
- Suppression du `return` précoce dans `sendWelcomeEmail` et `sendPasswordResetEmail`
- Les emails sont maintenant toujours ajoutés à la queue (dev ET prod)
- La gestion du mode développement est déplacée dans `sendViaResend` qui affiche l'email au lieu de l'envoyer

### Problème #2 : pg-boss v12+ passe un tableau de jobs au worker

**Symptôme** : Tous les jobs échouaient avec l'erreur :
```
TypeError: Cannot destructure property 'to' of 'job.data' as it is undefined.
```

**Cause** : Dans pg-boss v12+, le worker handler reçoit un **tableau de jobs** `[job]` au lieu d'un seul job `job`.

**Impact** :
- `job.data` était undefined car `job` était un tableau
- La destructuration `const { to, from, ... } = job.data` échouait
- Tous les jobs étaient marqués comme "failed" après 3 tentatives

**Solution** :
```javascript
// Extraire le vrai job du tableau
const actualJob = Array.isArray(job) ? job[0] : job;
// Les données sont dans actualJob.data
const { to, from, subject, text, html, service, resetUrl } = actualJob.data;
```

### Problème #3 : Noms de colonnes PgBoss v12+ (snake_case)

**Symptôme** : Les requêtes SQL vers la table `pgboss.job` échouaient avec des erreurs de colonnes inexistantes.

**Cause** : pg-boss v10+ utilise snake_case pour les noms de colonnes :
- `created_on` (pas `createdon` ou `createdOn`)
- `started_on`, `completed_on`
- `expire_seconds` (pas `expire_in` ou `expireIn`)
- `retry_limit`, `retry_count`, `retry_delay`

**Solution** : Interrogation de la structure réelle avec `information_schema.columns` et adaptation des requêtes.

## ✅ Solution finale

### 1. Fichiers modifiés

#### `server/src/services/email.service.js`
- ✅ Suppression du `return` précoce en mode dev dans `sendWelcomeEmail`
- ✅ Suppression du `return` précoce en mode dev dans `sendPasswordResetEmail`
- ✅ Ajout de `resetUrl` dans `mailContent` pour les emails de réinitialisation
- ✅ Gestion du mode développement dans `sendViaResend` :
  - En dev : affiche l'email dans la console (avec le lien de réinitialisation)
  - En prod : envoie via l'API Resend

#### `server/src/services/queue.service.js`
- ✅ Gestion du tableau de jobs dans le worker handler :
  ```javascript
  const actualJob = Array.isArray(job) ? job[0] : job;
  ```
- ✅ Extraction des données depuis `actualJob.data`
- ✅ Ajout de logs détaillés pour le debugging :
  - Structure du job reçu
  - Vérification de `emailSenders` et `sendViaResend`
  - Logs à chaque étape du traitement
- ✅ Configuration du polling PgBoss :
  ```javascript
  newJobCheckInterval: 2000,
  newJobCheckIntervalSeconds: 2
  ```

#### `server/src/routes/debug.routes.js` (nouvelle route)
- ✅ Route GET `/api/debug/queue-status` pour inspecter l'état de la queue
- ✅ Affiche les jobs par état, les jobs bloqués, et les derniers jobs
- ⚠️ **À SUPPRIMER EN PRODUCTION** pour des raisons de sécurité

### 2. Flow final (mode développement)

```
1. Utilisateur demande "forgot password"
   ↓
2. sendPasswordResetEmail() ajoute l'email à la queue PgBoss
   ↓
3. Worker PgBoss poll la queue (toutes les 2 secondes)
   ↓
4. Worker récupère le job (tableau) et extrait actualJob
   ↓
5. Worker appelle sendViaResend() avec les données de l'email
   ↓
6. sendViaResend() détecte le mode développement
   ↓
7. Email affiché dans la console avec le lien de réinitialisation
   ↓
8. Job marqué comme "completed"
```

### 3. Flow final (mode production)

```
1. Utilisateur demande "forgot password"
   ↓
2. sendPasswordResetEmail() ajoute l'email à la queue PgBoss
   ↓
3. Worker PgBoss poll la queue (toutes les 2 secondes)
   ↓
4. Worker récupère le job (tableau) et extrait actualJob
   ↓
5. Worker appelle sendViaResend() avec les données de l'email
   ↓
6. sendViaResend() envoie l'email via l'API Resend
   ↓
7. Email envoyé et reçu par l'utilisateur
   ↓
8. Job marqué comme "completed"
```

## 🧪 Test

Pour tester en développement :

1. Démarrer le serveur
2. Déclencher un "forgot password" depuis le frontend
3. Vérifier les logs :
   - `Email ajouté à la queue`
   - `🔍 [WORKER] Type du paramètre job`
   - `🔄 [WORKER] Début traitement email depuis la queue`
   - `✓ [WORKER] sendViaResend est disponible`
   - `📨 [WORKER] Appel de sendViaResend...`
   - `✓ [RESEND] Mode développement détecté`
4. **L'email doit s'afficher dans la console** avec le lien de réinitialisation

## 📦 Versions

- **pg-boss** : v12.5.2
- **Node.js** : v22.21.1
- **PostgreSQL** : Compatible avec les schémas pg-boss v10+

## 🔧 Configuration requise

### Variables d'environnement

```bash
# Mode développement (affiche dans la console)
NODE_ENV=development

# Mode production (envoie via Resend)
NODE_ENV=production
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@votredomaine.fr
```

### Base de données

La table `pgboss.job` est créée automatiquement par PgBoss au premier démarrage.

## 🚨 Notes importantes

1. **Route de debug** : La route `/api/debug/queue-status` doit être **supprimée en production** ou protégée par une authentification admin.

2. **Logs de debug** : Les logs détaillés peuvent être réduits une fois le système stabilisé (notamment les logs `🔍 [WORKER]`).

3. **pg-boss v12+** : Si vous mettez à jour pg-boss, vérifiez la structure du paramètre `job` dans le worker handler. Cette solution gère à la fois le format tableau (v12+) et le format objet (versions antérieures).

4. **Mode développement** : En mode dev, Resend n'est pas initialisé (`resend = null`), donc `sendViaResend` affiche l'email au lieu de l'envoyer. Cela permet de tester le flow complet sans envoyer de vrais emails.

## ✅ Résultat

- ✅ Les emails sont ajoutés à la queue (dev et prod)
- ✅ Le worker traite les jobs correctement
- ✅ En dev : emails affichés dans la console
- ✅ En prod : emails envoyés via Resend
- ✅ Le lien de réinitialisation est disponible
- ✅ Les erreurs sont loggées et les jobs sont retentés en cas d'échec

## 📚 Références

- [pg-boss Documentation](https://github.com/timgit/pg-boss)
- [pg-boss v10.0 Release Notes](https://github.com/timgit/pg-boss/releases/tag/10.0.0) (introduction de snake_case)
- [Resend Documentation](https://resend.com/docs)
