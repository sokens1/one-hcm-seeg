# Système de Gestion des Erreurs - Talent Flow

## Vue d'ensemble

Le système de gestion des erreurs de Talent Flow fournit une expérience utilisateur cohérente et professionnelle pour tous les types d'erreurs dans l'application. Il remplace tous les messages d'erreur basiques par des pages d'erreur élégantes et informatives.

## Composants Principaux

### 1. **ErrorPage** - Page d'erreur principale
Composant de base pour afficher les erreurs avec un design professionnel.

```tsx
import { ErrorPage } from '@/components/ui/ErrorPage';

<ErrorPage
  type="connection"
  title="Problème de Connexion"
  message="Impossible de se connecter aux serveurs."
  onRetry={() => window.location.reload()}
  onGoHome={() => navigate('/')}
  onGoBack={() => navigate(-1)}
/>
```

### 2. **ErrorFallback** - Remplacement des messages d'erreur
Composant pour remplacer les messages d'erreur existants.

```tsx
import { ErrorFallback } from '@/components/ui/ErrorFallback';

// Remplace ceci :
if (error) {
  return <p className="text-red-600">Erreur: {error.message}</p>;
}

// Par ceci :
if (error) {
  return <ErrorFallback error={error} onRetry={() => refetch()} />;
}
```

### 3. **ErrorBoundary** - Capture des erreurs React
Composant pour capturer les erreurs JavaScript non gérées.

```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 4. **useErrorHandler** - Hook de gestion d'erreurs
Hook pour gérer les erreurs de manière centralisée.

```tsx
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { handleError, handleConnectionError, handleApiError } = useErrorHandler();

// Gestion d'erreurs API
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    await handleApiError(response);
  }
} catch (error) {
  handleConnectionError(error);
}
```

## Types d'Erreurs Supportés

### 1. **Connection** - Problèmes de connexion
- Erreurs réseau
- Timeouts
- Problèmes de serveur

### 2. **Refresh** - Erreurs de rafraîchissement
- Pages obsolètes
- Erreurs de chargement de chunks
- Sessions expirées

### 3. **Browser** - Problèmes de navigateur
- Navigateurs non compatibles
- Erreurs JavaScript
- Problèmes de syntaxe

### 4. **Generic** - Erreurs génériques
- Erreurs inattendues
- Erreurs système
- Erreurs non catégorisées

## Migration des Messages d'Erreur Existants

### Avant (Message d'erreur basique)
```tsx
if (error) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 mb-4">Erreur: Impossible de charger les données.</p>
      <Button onClick={() => navigate(-1)}>Retour</Button>
    </div>
  );
}
```

### Après (Page d'erreur professionnelle)
```tsx
if (error) {
  return (
    <ErrorFallback
      error={error}
      onRetry={() => refetch()}
      type="generic"
    />
  );
}
```

## Intégration dans l'Application

### 1. **App.tsx** - ErrorBoundary global
```tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ui/ErrorFallback';

function App() {
  const CustomErrorFallback = (props: FallbackProps) => {
    return <ErrorFallback error={props.error} onRetry={props.resetErrorBoundary} />;
  };

  return (
    <ErrorBoundary FallbackComponent={CustomErrorFallback}>
      {/* Votre application */}
    </ErrorBoundary>
  );
}
```

### 2. **Pages individuelles** - Gestion d'erreurs spécifiques
```tsx
import { ErrorFallback } from '@/components/ui/ErrorFallback';

export function MyPage() {
  const { data, error, refetch } = useQuery('myData', fetchData);

  if (error) {
    return <ErrorFallback error={error} onRetry={refetch} />;
  }

  return <div>{/* Contenu de la page */}</div>;
}
```

### 3. **Composants** - Gestion d'erreurs locales
```tsx
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export function MyComponent() {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        inline={true}
        onRetry={() => setError(null)}
      />
    );
  }

  return <div>{/* Contenu du composant */}</div>;
}
```

## Personnalisation

### Couleurs et Design
Le système utilise les couleurs de l'application (bleu) et s'intègre parfaitement avec le design existant.

### Messages Personnalisés
```tsx
<ErrorPage
  type="generic"
  title="Mon Titre Personnalisé"
  message="Mon message d'erreur personnalisé"
  onRetry={handleRetry}
/>
```

### Actions Personnalisées
```tsx
<ErrorPage
  type="connection"
  showRetryButton={true}
  showHomeButton={false}
  showBackButton={true}
  onRetry={handleRetry}
  onGoBack={handleGoBack}
/>
```

## Avantages

### 1. **Expérience Utilisateur**
- Design professionnel et cohérent
- Messages d'erreur clairs et utiles
- Actions de récupération appropriées

### 2. **Maintenabilité**
- Gestion centralisée des erreurs
- Code réutilisable
- Facile à maintenir et mettre à jour

### 3. **Robustesse**
- Capture de tous les types d'erreurs
- Fallbacks appropriés
- Récupération automatique

### 4. **Accessibilité**
- Messages d'erreur accessibles
- Navigation clavier
- Support des lecteurs d'écran

## Exemples d'Utilisation

### 1. **Erreur de Chargement de Données**
```tsx
const { data, error, refetch } = useQuery('users', fetchUsers);

if (error) {
  return <ErrorFallback error={error} onRetry={refetch} type="connection" />;
}
```

### 2. **Erreur de Formulaire**
```tsx
const [submitError, setSubmitError] = useState(null);

if (submitError) {
  return (
    <ErrorDisplay
      error={submitError}
      inline={true}
      onRetry={() => setSubmitError(null)}
    />
  );
}
```

### 3. **Erreur de Navigation**
```tsx
const { error } = useParams();

if (error === 'not-found') {
  return <ErrorPage type="generic" title="Page Introuvable" />;
}
```

## Support et Maintenance

Le système d'erreur est conçu pour être facilement maintenable et extensible. Pour ajouter de nouveaux types d'erreurs ou personnaliser l'apparence, consultez les composants dans `src/components/ui/error/`.

## Conclusion

Le système de gestion des erreurs de Talent Flow améliore significativement l'expérience utilisateur en fournissant des pages d'erreur professionnelles et informatives. Il remplace tous les messages d'erreur basiques par une interface cohérente et élégante qui guide l'utilisateur vers la résolution du problème.
