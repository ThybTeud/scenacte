# Scenacte - Frontend

Application web d'écriture de pièces de théâtre avec gestion de versions.

## Stack technique

- **React 19** - Framework UI
- **Vite** - Build tool et dev server
- **TailwindCSS** - Framework CSS utility-first
- **React Router** - Routing côté client
- **react-hot-toast** - Notifications toast
- **react-loader-spinner** - Composants de chargement

## Prérequis

- Node.js 18+ et npm
- Le backend doit être lancé sur `http://localhost:3000`

## Installation

```bash
cd client
npm install
```

## Configuration

Créer un fichier `.env` à la racine du dossier `client/` :

```env
VITE_API_URL=http://localhost:3000/api
```

Pour GitHub Codespaces, adapter l'URL selon le port forwarding généré.

## Commandes disponibles

### Développement

```bash
npm run dev
```

Lance le serveur de développement sur `http://localhost:5173` avec Hot Module Replacement (HMR).

### Build de production

```bash
npm run build
```

Génère les fichiers optimisés dans le dossier `dist/`.

### Preview du build

```bash
npm run preview
```

Permet de prévisualiser le build de production localement.

### Linting

```bash
npm run lint
```

Vérifie le code avec ESLint.

## Structure du projet

```
client/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── ui/              # Composants UI (Button, Input, Modal, etc.)
│   │   ├── layout/          # Layouts (Header, AuthLayout)
│   │   ├── plays/           # Composants spécifiques aux pièces
│   │   └── routing/         # Composants de routing (PrivateRoute)
│   ├── pages/               # Pages de l'application
│   │   ├── auth/            # Pages d'authentification
│   │   ├── plays/           # Pages de gestion des pièces
│   │   ├── profile/         # Page profil utilisateur
│   │   └── NotFound.jsx     # Page 404
│   ├── contexts/            # Context API
│   │   └── AuthContext.jsx  # Gestion de l'authentification
│   ├── services/            # Couche de services API
│   │   ├── api.js           # Helper fetch centralisé
│   │   ├── auth.service.js
│   │   ├── users.service.js
│   │   ├── plays.service.js
│   │   └── versions.service.js
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.js       # Hook pour accéder au contexte auth
│   ├── App.jsx              # Composant racine avec routing
│   ├── main.jsx             # Point d'entrée de l'application
│   └── index.css            # Styles globaux et imports Tailwind
├── public/                  # Assets statiques
├── .env                     # Variables d'environnement (git-ignored)
├── .env.example             # Exemple de configuration
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Fonctionnalités implémentées

### Authentification
- [x] Inscription
- [x] Connexion
- [x] Mot de passe oublié
- [x] Réinitialisation du mot de passe
- [x] Routes protégées
- [x] Gestion du token JWT (localStorage)

### Gestion des pièces
- [x] Liste des pièces avec filtres, tri et pagination
- [x] Création de pièce
- [x] Suppression de pièce avec confirmation
- [x] Navigation vers l'éditeur

### Éditeur de pièce
- [x] Layout 3 colonnes (Navigation | Éditeur | Preview)
- [x] Header avec titre de la pièce
- [x] Barre d'outils (boutons désactivés pour le moment)
- [x] Sidebar versions avec :
  - Liste des versions paginée
  - Restauration de version avec confirmation
  - Affichage des métadonnées (date, type, label)

### Profil utilisateur
- [x] Modification email/username
- [x] Changement de mot de passe
- [x] Suppression de compte avec confirmation

### UI/UX
- [x] Composants réutilisables (Button, Input, Modal, Card, Loader, Pagination)
- [x] Toasts de notification (succès/erreur)
- [x] États de chargement
- [x] Design responsive (desktop-first)
- [x] Page 404

## Fonctionnalités à implémenter (hors scope MVP)

- [ ] Parsing du texte (# actes, ## scènes, @ personnages)
- [ ] Preview HTML en temps réel
- [ ] Export PDF avec templates
- [ ] Auto-save toutes les 2 minutes
- [ ] Statistiques avancées (actes, scènes, personnages, durée)
- [ ] Navigation dans le sommaire
- [ ] Filtrage par personnage
- [ ] Comparaison de versions (diff)
- [ ] Éditeur de texte riche (contentEditable)

## Architecture technique

### Context API : AuthContext

Gère l'état d'authentification global avec :

```js
{
  user: { id, email, username } | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login: (email, password) => Promise,
  register: (email, username, password) => Promise,
  logout: () => void,
  updateUser: (userData) => void
}
```

### Services API

Tous les appels API passent par `api.js` qui :
- Ajoute automatiquement le header `Authorization: Bearer <token>`
- Gère les erreurs HTTP (401 → logout auto)
- Parse les réponses JSON
- Utilise `VITE_API_URL` depuis les variables d'environnement

### Routing

Routes publiques :
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Mot de passe oublié
- `/reset-password?token=XXX` - Réinitialisation

Routes protégées (nécessitent authentification) :
- `/` - Redirige vers `/plays`
- `/plays` - Liste des pièces
- `/plays/:id` - Éditeur de pièce
- `/profile` - Profil utilisateur

## Palette de couleurs

- **Primary** : Orange `#FF6B35` (logo SCENACTE)
- **Success** : Vert `#10B981`
- **Error** : Rouge `#EF4444`
- **Gray scale** : Palette Tailwind standard

## Sécurité

- Token JWT stocké dans `localStorage` (clé: `token`)
- Validation côté client des formulaires
- Protection XSS native de React
- Routes protégées avec redirection automatique
- CORS configuré côté backend pour `http://localhost:5173`

### TODO après MVP

- Migrer le token vers `httpOnly cookie` pour plus de sécurité
- Ajouter un refresh token
- Implémenter CSP (Content Security Policy)

## Développement

### Conventions de code

- Composants fonctionnels avec hooks
- Nommage clair et explicite
- Gestion des erreurs avec try/catch
- Cleanup dans useEffect si nécessaire
- Composants réutilisables dans `components/ui`

### TailwindCSS

- Utiliser les classes utilitaires standard
- Classes custom uniquement si nécessaire
- Responsive : `sm:`, `md:`, `lg:`, `xl:`
- Dark mode : pas pour le MVP

## Dépannage

### Port 5173 déjà utilisé

```bash
# Trouver le processus
lsof -ti:5173
# Tuer le processus
kill -9 <PID>
```

### Erreurs CORS

Vérifier que :
1. Le backend est bien lancé sur `http://localhost:3000`
2. Le CORS est configuré côté backend pour accepter `http://localhost:5173`
3. La variable `VITE_API_URL` est correctement définie dans `.env`

### Token expiré

Le token JWT expire après un certain temps. L'application redirige automatiquement vers `/login` en cas de 401.

## Licence

MIT
