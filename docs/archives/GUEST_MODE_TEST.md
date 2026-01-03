# Guide de Test - Mode Invité

## Parcours complet à tester

### 1. Mode invité (sans compte)

1. **Accéder à l'application** : Naviguer vers `/` ou `/plays`
   - ✅ Pas de redirection vers `/login`
   - ✅ Affichage du bandeau jaune "Mode invité"
   - ✅ Header affiche "Créer un compte" et "Se connecter" au lieu de "Profil" et "Déconnexion"

2. **Créer une pièce en mode invité**
   - Cliquer sur "Créer une pièce"
   - Remplir titre et sous-titre
   - ✅ Pièce créée avec ID `guest_<uuid>`
   - ✅ Redirection vers `/plays/<guest_id>`

3. **Éditer la pièce**
   - Écrire du contenu dans l'éditeur
   - ✅ Auto-sauvegarde fonctionne
   - ✅ Bandeau "Mode invité" visible
   - ✅ Données sauvegardées dans `localStorage` sous la clé `scenacte_guest_data`

4. **Vérifier la persistance**
   - Fermer et rouvrir le navigateur
   - Naviguer vers `/plays`
   - ✅ Pièce toujours présente
   - ✅ Contenu préservé

5. **Export PDF**
   - Ouvrir une pièce invité
   - Tester l'export PDF
   - ✅ Export fonctionne normalement

### 2. Création de compte avec migration

6. **Créer plusieurs pièces en mode invité**
   - Créer 2-3 pièces avec du contenu
   - ✅ Toutes visibles dans la liste

7. **Créer un compte**
   - Cliquer sur "Créer un compte" dans le header
   - Remplir le formulaire de création de compte
   - Soumettre
   - ✅ Compte créé avec succès
   - ✅ Modal de migration s'affiche : "Vous avez X pièces enregistrées localement"

8. **Accepter la migration**
   - Cliquer sur "Oui, importer mes X pièces"
   - ✅ Toast : "Migration des pièces en cours..."
   - ✅ Toast : "X pièce(s) importée(s) avec succès !"
   - ✅ Redirection vers `/plays`
   - ✅ Pièces importées visibles avec de nouveaux IDs (non `guest_*`)
   - ✅ `localStorage.scenacte_guest_data` supprimé

9. **Vérifier les pièces migrées**
   - Ouvrir chaque pièce
   - ✅ Contenu préservé
   - ✅ Titre et sous-titre corrects
   - ✅ Plus de bandeau "Mode invité"

### 3. Création de compte sans migration

10. **Refuser la migration**
    - Créer des pièces en mode invité
    - Créer un compte
    - Cliquer sur "Non, supprimer mes données locales"
    - ✅ Toast : "Données locales supprimées"
    - ✅ Redirection vers `/plays`
    - ✅ Liste vide (pas de pièces importées)
    - ✅ `localStorage.scenacte_guest_data` supprimé

### 4. Cas limites

11. **Création de compte sans données invité**
    - Vider le localStorage : `localStorage.clear()`
    - Naviguer vers `/register`
    - Créer un compte
    - ✅ Pas de modal de migration
    - ✅ Redirection directe vers `/plays`

12. **Navigation entre modes**
    - En mode invité, créer une pièce
    - Se connecter avec un compte existant
    - ✅ Données invité toujours dans localStorage (non migrées automatiquement)
    - Se déconnecter
    - ✅ Retour en mode invité avec les pièces locales

13. **Suppressions et filtres**
    - En mode invité, tester :
      - ✅ Suppression d'une pièce
      - ✅ Filtres par statut (draft, completed, archived)
      - ✅ Tri (dernière modification, création, titre)

## Vérifications techniques

### localStorage
```javascript
// Inspecter les données invité
JSON.parse(localStorage.getItem('scenacte_guest_data'))

// Structure attendue :
{
  "plays": [
    {
      "id": "guest_<uuid>",
      "title": "Titre",
      "subtitle": "",
      "rawContent": "Contenu...",
      "htmlContent": "<p>...</p>",
      "status": "draft",
      "createdAt": "2025-01-02T...",
      "updatedAt": "2025-01-02T...",
      "lastEditedAt": "2025-01-02T..."
    }
  ]
}
```

### Routes accessibles
- ✅ `/` → Redirige vers `/plays` (invité ou authentifié)
- ✅ `/plays` → Accessible en mode invité
- ✅ `/plays/:id` → Accessible en mode invité (si ID guest)
- ❌ `/profile` → Redirige vers `/login` (invité)
- ❌ `/preferences` → Redirige vers `/login` (invité)
- ✅ `/register` → Accessible en mode invité
- ✅ `/login` → Accessible en mode invité

## Notes

- Les pièces invitées n'ont **pas de versioning** (conforme au spec)
- Seule la **dernière version** est stockée localement
- Les données sont **persistantes** tant que le localStorage n'est pas vidé
- La migration utilise `Promise.allSettled` pour gérer les échecs partiels
