# 🔧 Guide de Dépannage - Talent Flow Gabon

Ce document répertorie les problèmes connus de l'application et leurs solutions.

## 🚨 Problèmes Critiques Résolus

### 1. **Erreur DOM removeChild** ❌ → ✅ **RÉSOLU**

**Symptômes :**
```
Erreur d'application inattendue !
Échec de l'exécution de « removeChild » sur « Node » : 
le nœud à supprimer n'est pas un enfant de ce nœud.
NotFoundError : échec de l'exécution de removeChild
```

**Quand ça arrive :**
- ✅ Lors de la déconnexion
- ✅ Lors de la première connexion 
- ✅ En cliquant sur les selects (genre, etc.)
- ✅ Disparaît après actualisation
- ✅ Plus fréquent en ligne qu'en local

**Cause racine :**
- Composants Radix UI (Select, Popover) qui utilisent des portals
- Race conditions lors des changements d'état rapides
- Tentative de nettoyage DOM après destruction du parent

**Solutions appliquées :**
1. **SafeSelect Component** (`src/components/ui/SafeSelect.tsx`)
   - Wrapper sécurisé pour les composants Select
   - Gestion propre des portals et du lifecycle
   - Cleanup sécurisé avec délais

2. **Gestion d'erreur globale** (`src/main.tsx`)
   - Capture et ignore les erreurs DOM non-critiques
   - Logs en mode debug uniquement
   - Prévention des crashes utilisateur

3. **Transitions améliorées** (`src/components/layout/Header.tsx`)
   - Fermeture propre des composants avant déconnexion
   - Délais pour éviter les race conditions
   - Navigation sécurisée

**Tests effectués :**
- ✅ Connexion/déconnexion répétée
- ✅ Utilisation des selects genre
- ✅ Navigation rapide entre pages
- ✅ Actualisation pendant les interactions

---

### 2. **Erreurs d'Authentification Supabase** ❌ → ✅ **RÉSOLU**

**Symptômes :**
```
400 Bad Request: refresh_token_not_found
403 Forbidden: Invalid session
409 Conflict: duplicate key value violates unique constraint "users_matricule_key"
```

**Solutions appliquées :**
1. **Gestion robuste des sessions** (`src/hooks/useAuth.tsx`)
2. **Nettoyage localStorage** (tokens expirés)
3. **Contrainte matricule intelligente** (`src/pages/Auth.tsx`)

---

## 🔍 Problèmes Potentiels à Surveiller

### 1. **Performance sur Mobile**
**Symptômes potentiels :**
- Lenteur sur les appareils bas de gamme
- Animations saccadées
- Timeout sur les requêtes

**Solutions préventives :**
- Lazy loading des composants lourds
- Debounce sur les recherches
- Compression des images
- Cache intelligent

### 2. **Problèmes de Réseau**
**Symptômes potentiels :**
- Échec de chargement en connexion lente
- Timeout sur les uploads
- Perte de données de formulaire

**Solutions préventives :**
- Retry automatique
- Indicateurs de connexion
- Sauvegarde locale (brouillons)
- Compression des uploads

### 3. **Compatibilité Navigateurs**
**Symptômes potentiels :**
- Problèmes sur Safari iOS
- Incompatibilités IE/Edge Legacy
- Différences de rendu

**Solutions préventives :**
- Polyfills pour les APIs modernes
- Tests cross-browser
- Fallbacks CSS
- Detection de features

---

## 🧪 Protocole de Test

### Tests de Régression DOM
```bash
# 1. Test de déconnexion répétée
- Se connecter
- Ouvrir un select
- Se déconnecter immédiatement
- Vérifier : pas d'erreur removeChild

# 2. Test de navigation rapide
- Naviguer rapidement entre pages
- Ouvrir/fermer des modals
- Vérifier : pas de race conditions

# 3. Test mobile
- Tester sur appareils réels
- Connexion 3G/4G
- Vérifier : pas de timeout
```

### Tests d'Authentification
```bash
# 1. Test de session expirée
- Laisser l'app ouverte 24h
- Tenter une action
- Vérifier : reconnexion propre

# 2. Test multi-onglets
- Ouvrir l'app dans 2 onglets
- Se déconnecter dans un onglet
- Vérifier : synchronisation
```

---

## 🚀 Outils de Debug

### Console Commands
```javascript
// Activer les logs debug
localStorage.setItem('debug', 'true');

// Vérifier l'état des portals
document.querySelectorAll('[data-radix-portal]').length

// Nettoyer le localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.startsWith('sb-')) {
    localStorage.removeItem(key);
  }
});
```

### Monitoring
- Console logs filtrés (non-critiques masqués)
- Capture d'erreur avec contexte
- Métriques de performance

---

## 📞 Support

### Signalement de Bug
1. **Reproduire** le problème
2. **Capturer** la console (F12)
3. **Noter** les étapes exactes
4. **Inclure** : navigateur, OS, connexion
5. **Vérifier** si l'actualisation résout

### Escalade
- **Critique** : Crash, perte de données
- **Majeur** : Fonctionnalité cassée
- **Mineur** : UI/UX, performance
- **Cosmétique** : Texte, couleurs

---

## 📈 Historique des Versions

### v1.2.0 (2025-01-28)
- ✅ **RÉSOLU** : Erreur DOM removeChild
- ✅ **RÉSOLU** : Erreurs auth Supabase  
- ✅ **AJOUTÉ** : SafeSelect component
- ✅ **AJOUTÉ** : Gestion d'erreur globale
- ✅ **AJOUTÉ** : Brouillons permanents

### v1.1.0 (2025-01-15)
- ✅ **RÉSOLU** : Problèmes de déconnexion
- ✅ **RÉSOLU** : Contraintes matricule
- ✅ **AMÉLIORÉ** : Performance mobile

---

*Dernière mise à jour : 28 janvier 2025*
