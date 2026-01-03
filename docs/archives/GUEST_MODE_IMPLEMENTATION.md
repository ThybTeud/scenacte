# Implémentation du Mode Invité - Scenacte

## 📋 Résumé

Le mode invité permet d'utiliser Scenacte sans créer de compte. Les données sont stockées localement dans le navigateur et peuvent être migrées vers un compte lors de l'inscription.

## 🎯 Fonctionnalités implémentées

### ✅ Accès sans authentification
- Accès direct aux routes `/plays` et `/plays/:id` sans redirection
- Toutes les fonctionnalités disponibles (création, édition, suppression, export PDF)
- Données persistantes via localStorage

### ✅ Bandeau mode invité
- Bandeau discret en jaune avec bordure
- Message clair : "Mode invité — vos pièces sont stockées localement"
- CTA "Créer un compte" pour inciter à s'inscrire
- Bouton de fermeture (dismiss)
- Visible dans PlaysList et PlayEditor

### ✅ Migration des données
- Modal proposé après création de compte
- Import automatique de toutes les pièces locales
- Gestion des échecs partiels
- Nettoyage des données locales après migration
- Option de refuser la migration (supprime les données)

## 📁 Fichiers modifiés

### Services
- **`client/src/services/storage.service.js`** (nouveau)
  - Service abstrait qui détecte automatiquement le mode (invité vs authentifié)
  - API unifiée : `listPlays()`, `getPlay()`, `createPlay()`, `savePlay()`, `deletePlay()`
  - Fonctions de migration : `hasGuestData()`, `getGuestData()`, `migrateGuestData()`, `clearGuestData()`
  - Génération d'IDs `guest_<uuid>` pour les pièces locales

### Contexte & Authentification
- **`client/src/contexts/AuthContext.jsx`**
  - Ajout de `isGuest: !token && !user` dans le contexte
  - Permet de détecter le mode invité dans toute l'app

### Routing
- **`client/src/components/routing/PrivateRoute.jsx`**
  - Nouveau prop `allowGuest` pour autoriser l'accès en mode invité
  - Logique de redirection améliorée

- **`client/src/App.jsx`**
  - Routes `/plays` et `/plays/:id` avec `<PrivateRoute allowGuest>`
  - Routes `/profile` et `/preferences` restent protégées

### Composants
- **`client/src/components/ui/GuestModeBanner.jsx`** (nouveau)
  - Bandeau jaune avec message et CTA
  - Bouton de fermeture
  - Style cohérent avec le design néobrutalist

- **`client/src/components/ui/GuestDataMigrationModal.jsx`** (nouveau)
  - Modal de confirmation pour la migration
  - Affiche le nombre de pièces à migrer
  - Options : "Oui, importer" ou "Non, supprimer"

### Pages
- **`client/src/pages/plays/PlaysList.jsx`**
  - Utilise `storageService` au lieu de `playsService`
  - Menu adaptatif : "Créer un compte" / "Se connecter" en mode invité
  - Affichage du GuestModeBanner si `isGuest`

- **`client/src/pages/plays/PlayEditor.jsx`**
  - Utilise `storageService` au lieu de `playsService`
  - Menu adaptatif pour le header
  - Affichage du GuestModeBanner si `isGuest`

- **`client/src/pages/auth/Register.jsx`**
  - Vérification des données invité après inscription
  - Modal de migration si données présentes
  - Handlers `handleMigrateData()` et `handleSkipMigration()`

## 🔧 Structure localStorage

### Clé : `scenacte_guest_data`

```json
{
  "plays": [
    {
      "id": "guest_abc123...",
      "title": "Sans titre",
      "subtitle": "",
      "rawContent": "Contenu brut...",
      "htmlContent": "<p>HTML généré...</p>",
      "status": "draft",
      "createdAt": "2025-01-02T10:00:00.000Z",
      "updatedAt": "2025-01-02T10:05:00.000Z",
      "lastEditedAt": "2025-01-02T10:05:00.000Z"
    }
  ]
}
```

## 🔄 Parcours utilisateur

### Mode invité → Création de compte → Migration

1. Utilisateur accède à `/plays` sans compte
2. Crée 2-3 pièces en mode invité
3. Clique sur "Créer un compte"
4. Remplit le formulaire et soumet
5. Modal apparaît : "Vous avez 3 pièces enregistrées localement"
6. Clique sur "Oui, importer mes 3 pièces"
7. Migration s'effectue (toast de confirmation)
8. Redirection vers `/plays` avec les pièces importées
9. localStorage nettoyé

## 🚀 Caractéristiques techniques

### Abstraction du stockage
Le `storageService` détecte automatiquement le mode :
- **Invité** : `!localStorage.getItem('token')` → Utilise localStorage
- **Authentifié** : token présent → Appelle l'API

### Pas de versioning local
Conforme au spec, seule la dernière version est stockée localement.

### Gestion des erreurs de migration
Utilise `Promise.allSettled` pour gérer les échecs partiels :
```javascript
const results = await Promise.allSettled(plays.map(createPlay));
// Affiche : "2 pièces importées, 1 échec"
```

### Performance
- Auto-sauvegarde avec debounce (300ms) fonctionne en localStorage
- Pas d'appels réseau en mode invité
- Export PDF fonctionne normalement (génération côté client)

## 🎨 Design

### Bandeau mode invité
- Couleur : `bg-yellow-50` avec `border-yellow-500`
- Bordure : 2px (cohérent avec le design néobrutalist)
- Coins arrondis : 4px
- Discret mais visible
- Fermable (état local au composant)

### Modal de migration
- Design cohérent avec les autres modals de l'app
- Message clair et informatif
- Warning orange pour l'option de suppression

## 📝 Contraintes respectées

- ✅ Pas de dépendances supplémentaires
- ✅ Code maintenable (service abstrait simple)
- ✅ Toutes les fonctionnalités accessibles en mode invité
- ✅ Bandeau discret cohérent avec le design
- ✅ Migration proposée au signup
- ✅ Nettoyage des données locales
- ✅ Build réussit sans erreurs

## 🧪 Tests à effectuer

Voir le fichier [GUEST_MODE_TEST.md](./GUEST_MODE_TEST.md) pour le guide de test complet.

## 📌 Notes importantes

1. **Sécurité** : Les données invité sont stockées en clair dans localStorage (pas de données sensibles)
2. **Limites du navigateur** : localStorage limité à ~5-10MB selon les navigateurs
3. **Pas de synchronisation** : Les données invité ne sont pas synchronisées entre appareils
4. **Suppression** : Vider le localStorage efface les pièces invitées
5. **Export** : L'export PDF fonctionne car il est généré côté client

## 🔮 Améliorations futures possibles

- Avertissement si localStorage plein
- Indication de la taille des données stockées
- Option d'export des données invité en JSON
- Rappel périodique pour créer un compte
- Limite du nombre de pièces en mode invité
