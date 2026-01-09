# 🌳 Guide de Test de l'Endpoint AST

## 📋 Prérequis

1. Le serveur backend doit être en cours d'exécution sur le port 3000
2. Vous devez avoir un compte utilisateur créé
3. Vous devez avoir au moins une pièce créée dans votre compte

## 🚀 Méthode 1 : Script Node.js (Recommandé)

### Utilisation rapide

```bash
node test-ast-simple.js VOTRE_EMAIL VOTRE_MOT_DE_PASSE
```

**Exemple :**
```bash
node test-ast-simple.js admin@scenacte.com monMotDePasse123
```

### Ce que fait le script

1. ✅ Se connecte avec vos identifiants
2. ✅ Récupère votre première pièce
3. ✅ Appelle l'endpoint `/api/plays/:id/ast`
4. ✅ Affiche l'AST complet en JSON formaté
5. ✅ Affiche des statistiques sur l'AST (nombre de nœuds par type)

---

## 🌐 Méthode 2 : Bash/Curl

### Utilisation

```bash
./test-ast.sh VOTRE_EMAIL VOTRE_MOT_DE_PASSE
```

**Ou avec un ID de pièce spécifique :**
```bash
./test-ast.sh VOTRE_EMAIL VOTRE_MOT_DE_PASSE PLAY_ID
```

---

## 📮 Méthode 3 : Postman

### Étape 1 : Obtenir un token JWT

**Requête :** POST `http://localhost:3000/api/auth/login`

**Headers :**
```
Content-Type: application/json
```

**Body (JSON) :**
```json
{
  "email": "votre@email.com",
  "password": "votreMotDePasse"
}
```

**Réponse :**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

➡️ **Copiez la valeur du `token`**

---

### Étape 2 : Récupérer un ID de pièce

**Requête :** GET `http://localhost:3000/api/plays`

**Headers :**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

**Réponse :**
```json
{
  "plays": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Ma première pièce",
      ...
    }
  ]
}
```

➡️ **Copiez l'`id` d'une pièce**

---

### Étape 3 : Récupérer l'AST

**Requête :** GET `http://localhost:3000/api/plays/{PLAY_ID}/ast`

**Headers :**
```
Authorization: Bearer VOTRE_TOKEN_ICI
```

**Exemple d'URL complète :**
```
http://localhost:3000/api/plays/123e4567-e89b-12d3-a456-426614174000/ast
```

**Réponse attendue :**
```json
{
  "playId": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Ma première pièce",
  "ast": {
    "type": "ROOT",
    "value": null,
    "attributes": {},
    "position": {
      "start": 0,
      "end": 0
    },
    "children": [
      {
        "type": "ACTE",
        "value": "Acte I",
        "attributes": {},
        "position": {
          "start": 0,
          "end": 7
        },
        "children": [
          {
            "type": "SCENE",
            "value": "Scène 1",
            ...
          }
        ]
      }
    ]
  }
}
```

---

## 📊 Structure de l'AST

L'AST retourné contient les types de nœuds suivants :

- **ROOT** : Nœud racine
- **ACTE** : Acte (introduit par `#`)
- **SCENE** : Scène (introduit par `##`)
- **PERSONNAGE** : Nom du personnage parlant (introduit par `@`)
- **DIDASCALIE** : Indication scénique (entre parenthèses)
- **DIALOGUE** : Texte de dialogue
- **TEXT** : Texte générique
- **LINE_BREAK** : Saut de ligne

Chaque nœud contient :
- `type` : Type du nœud
- `value` : Valeur textuelle du nœud
- `attributes` : Attributs spécifiques (ex: nom du personnage)
- `position` : Position dans le texte original (start/end)
- `children` : Tableau des nœuds enfants

---

## 🔧 Dépannage

### Erreur "Email ou mot de passe incorrect"
➡️ Vérifiez vos identifiants ou créez un compte via l'interface web

### Erreur "Aucune pièce trouvée"
➡️ Créez au moins une pièce dans l'application web avant de tester

### Erreur "ECONNREFUSED"
➡️ Vérifiez que le serveur backend est bien démarré sur le port 3000

### Token expiré
➡️ Relancez le script, le token a une durée de validité de 7 jours

---

## 🗑️ Suppression de l'endpoint (après test)

Cet endpoint est **temporaire** et destiné au debugging. Pour le supprimer :

1. Supprimez la fonction `getPlayAST` dans `server/src/controllers/plays.controller.js`
2. Supprimez la route `router.get('/:id/ast', getPlayAST)` dans `server/src/routes/plays.routes.js`
3. Supprimez l'import `getPlayAST` dans le fichier de routes

---

## 📝 Notes

- L'AST n'est **pas stocké** en base de données
- Il est généré à la volée à partir du `raw_content`
- Les mêmes règles d'authentification et d'autorisation s'appliquent (la pièce doit vous appartenir)
