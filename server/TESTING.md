# Guide de test - Scenacte Backend

Ce document explique comment configurer et exécuter les tests du backend Scenacte.

## Configuration initiale

### 1. Créer la base de données de test

```bash
# Créer la base de données de test
createdb scenacte_test

# Initialiser le schéma (utiliser la même migration que la DB principale)
psql scenacte_test < migrations/init.sql
```

### 2. Créer le fichier .env.test

Créer un fichier `.env.test` à la racine du dossier `server/` :

```env
# Base de données de test
DATABASE_URL=postgresql://user:password@localhost:5432/scenacte_test

# JWT (secret de test - NE PAS utiliser en production)
JWT_SECRET=test_secret_key_32_characters_long_minimum
JWT_EXPIRES_IN=7d

# Environnement
NODE_ENV=test

# Client
CLIENT_URL=http://localhost:3000

# Email (désactivé en test)
SENDGRID_API_KEY=
EMAIL_FROM=test@scenacte.com

# Port (différent de dev pour éviter les conflits)
PORT=3001

# Limits
MAX_CONTENT_SIZE_MB=10
```

**Important** : Ajoutez `.env.test` au `.gitignore` pour ne pas committer les secrets.

### 3. Vérifier que .env.test est dans .gitignore

Ajouter cette ligne au fichier `.gitignore` :

```
.env.test
```

## Exécuter les tests

### Tests en mode normal

```bash
npm test
```

### Tests en mode watch (re-exécution automatique)

```bash
npm run test:watch
```

### Tests avec couverture de code

```bash
npm run test:coverage
```

## Structure des tests

```
server/src/__tests__/
├── auth.test.js      # Tests d'authentification
└── plays.test.js     # Tests de gestion des pièces
```

## Tests disponibles

### Tests d'authentification (auth.test.js)

- ✅ Création d'utilisateur
- ✅ Rejet d'email dupliqué
- ✅ Validation du mot de passe (min 8 caractères)
- ✅ Connexion avec identifiants valides
- ✅ Rejet de mauvais mot de passe
- ✅ Validation de format d'email

### Tests de pièces (plays.test.js)

- ✅ Authentification requise (401 sans token)
- ✅ Liste des pièces d'un utilisateur
- ✅ Création d'une pièce
- ✅ Validation du titre (requis)
- ✅ Validation des statistiques (non-négatif)
- ✅ Récupération d'une pièce spécifique
- ✅ Erreur 404 pour pièce inexistante
- ✅ Changement de statut (draft → completed)
- ✅ Validation du statut (enum)

## Bonnes pratiques

### 1. Isolation des tests

Les tests utilisent `--runInBand` pour s'exécuter séquentiellement et éviter les conflits de base de données.

### 2. Nettoyage automatique

Chaque test nettoie les données qu'il a créées via les hooks `afterEach` :

```javascript
afterEach(async () => {
  await pool.query('DELETE FROM users WHERE email LIKE $1', ['test_%']);
});
```

Tous les emails de test commencent par `test_` pour faciliter le nettoyage.

### 3. Données de test avec Faker

Les tests utilisent `@faker-js/faker` pour générer des données réalistes :

```javascript
import { faker } from '@faker-js/faker';

const userData = {
  email: `test_${faker.internet.email()}`,
  username: faker.internet.username(),
  password: faker.internet.password({ length: 12 })
};
```

### 4. Helpers réutilisables

Le fichier `plays.test.js` inclut des helpers pour :
- Créer un utilisateur et récupérer son token
- Générer des données de pièce valides

## Dépannage

### Erreur "Database connection failed"

Vérifiez que :
1. PostgreSQL est démarré
2. La base `scenacte_test` existe
3. Le fichier `.env.test` est correctement configuré
4. L'utilisateur PostgreSQL a les permissions

### Erreur "Variable d'environnement manquante"

Assurez-vous que toutes les variables requises sont définies dans `.env.test`.

### Tests qui échouent de manière aléatoire

Les tests doivent s'exécuter avec `--runInBand` pour éviter les conflits de base de données.

## Couverture de code

La couverture de code exclut :
- `node_modules/`
- `__tests__/`

Pour voir le rapport de couverture :

```bash
npm run test:coverage
```

Un rapport HTML sera généré dans `coverage/lcov-report/index.html`.

## CI/CD

Pour intégrer les tests dans un pipeline CI/CD, assurez-vous de :

1. Créer la base de données de test avant les tests
2. Définir les variables d'environnement
3. Exécuter `npm test`

Exemple pour GitHub Actions :

```yaml
- name: Setup test database
  run: |
    createdb scenacte_test
    psql scenacte_test < migrations/init.sql

- name: Run tests
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/scenacte_test
    JWT_SECRET: test_secret_key_32_characters_long_minimum
    NODE_ENV: test
    CLIENT_URL: http://localhost:3000
  run: npm test
```

## Ajouter de nouveaux tests

1. Créer un fichier `*.test.js` dans `src/__tests__/`
2. Importer les dépendances nécessaires (supertest, faker, app, pool)
3. Implémenter les tests avec des `describe` et `it`
4. Ajouter les hooks de nettoyage (`afterEach`, `afterAll`)
5. Exécuter `npm test` pour vérifier

Exemple de structure :

```javascript
import request from 'supertest';
import { faker } from '@faker-js/faker';
import app from '../app.js';
import { pool } from '../config/database.js';

describe('Nom du module', () => {
  afterEach(async () => {
    // Nettoyer les données de test
  });

  afterAll(async () => {
    await pool.end();
  });

  it('devrait faire quelque chose', async () => {
    // Votre test ici
  });
});
```
