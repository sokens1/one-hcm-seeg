# Composants de Prévisualisation de Documents

Ce dossier contient des composants React optimisés pour la prévisualisation et la gestion des documents dans l'interface recruteur.

## 🚀 Composants Disponibles

### 1. DocumentPreviewModal
Modal de prévisualisation standard avec support multi-formats et contrôles de base.

**Fonctionnalités :**
- Support PDF, images, documents Office, fichiers texte
- Zoom et rotation pour les images
- Mode plein écran intégré
- Téléchargement et ouverture externe
- Interface responsive

**Utilisation :**
```tsx
import { DocumentPreviewModal } from "@/components/ui";

<DocumentPreviewModal
  fileUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  showToolbar={true}
  allowDownload={true}
  allowExternal={true}
/>
```

### 2. FullscreenDocumentViewer
Visualiseur de documents optimisé pour le mode plein écran avec navigation avancée.

**Fonctionnalités :**
- Interface plein écran optimisée
- Raccourcis clavier complets
- Navigation entre documents
- Toolbar auto-masquée
- Support multi-formats

**Utilisation :**
```tsx
import { FullscreenDocumentViewer } from "@/components/ui";

<FullscreenDocumentViewer
  fileUrl="https://example.com/document.pdf"
  fileName="document.pdf"
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onNavigate={(direction) => handleNavigation(direction)}
  hasPrevious={true}
  hasNext={true}
  showInfo={true}
  allowDownload={true}
  allowExternal={true}
/>
```

### 3. DocumentGallery
Galerie de documents avec vue grille/liste et actions rapides.

**Fonctionnalités :**
- Vue grille et liste
- Icônes par type de fichier
- Actions rapides au survol
- Navigation fluide entre documents
- Intégration avec les composants de prévisualisation

**Utilisation :**
```tsx
import { DocumentGallery } from "@/components/ui";

<DocumentGallery
  documents={documents}
  title="Documents de candidature"
  allowDownload={true}
  allowExternal={true}
  showThumbnails={true}
  maxHeight="400px"
/>
```

## ⌨️ Raccourcis Clavier (Mode Plein Écran)

| Touche | Action |
|--------|--------|
| `+` / `-` | Zoom avant/arrière |
| `R` / `L` | Rotation droite/gauche |
| `0` | Reset vue |
| `H` | Afficher/masquer toolbar |
| `I` | Panneau d'information |
| `←` / `→` | Navigation entre documents |
| `Échap` | Fermer |
| Mouvement souris | Afficher toolbar |

## 🎨 Personnalisation

### Props communes
- `allowDownload` : Autoriser le téléchargement
- `allowExternal` : Autoriser l'ouverture externe
- `showToolbar` : Afficher la barre d'outils
- `showInfo` : Afficher le panneau d'information

### Styles
Les composants utilisent Tailwind CSS et peuvent être personnalisés via les classes CSS ou en modifiant les composants de base.

## 🔧 Intégration

### Dans CandidateAnalysis.tsx
```tsx
// Remplacer l'ancien DocumentPreviewModal par le nouveau
import { DocumentPreviewModal } from "@/components/ui";

// Ajouter le bouton plein écran
<Button
  variant="outline"
  size="sm"
  onClick={() => openFullscreen(doc, index)}
  className="text-xs sm:text-sm"
>
  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
  Plein écran
</Button>
```

### Dans d'autres composants
```tsx
// Utiliser DocumentGallery pour afficher une liste de documents
<DocumentGallery
  documents={applicationDocuments}
  title="Documents de candidature"
  allowDownload={!isObserver}
  allowExternal={true}
/>
```

## 📱 Support des Formats

| Format | Prévisualisation | Zoom | Rotation | Notes |
|--------|------------------|------|----------|-------|
| PDF | ✅ | ❌ | ❌ | Support natif |
| Images (JPG, PNG, GIF, etc.) | ✅ | ✅ | ✅ | Contrôles complets |
| Word (DOC, DOCX) | ✅ | ❌ | ❌ | Via Office Online |
| Excel (XLS, XLSX) | ✅ | ❌ | ❌ | Via Office Online |
| PowerPoint (PPT, PPTX) | ✅ | ❌ | ❌ | Via Office Online |
| Texte (TXT, RTF) | ✅ | ❌ | ❌ | Support basique |
| Autres | ❌ | ❌ | ❌ | Téléchargement uniquement |

## 🚀 Améliorations Futures

- [ ] Support des annotations sur les documents
- [ ] Mode présentation pour les slides
- [ ] Comparaison côte à côte de documents
- [ ] Historique des consultations
- [ ] Partage de documents avec annotations
- [ ] Support des signatures électroniques

## 🐛 Dépannage

### Problèmes courants
1. **Documents non visibles** : Vérifier les permissions RLS Supabase
2. **Erreurs de chargement** : Vérifier l'URL du document
3. **Mode plein écran bloqué** : Vérifier les permissions du navigateur

### Logs de débogage
Les composants incluent des logs de débogage pour faciliter le dépannage. Vérifiez la console du navigateur pour plus d'informations.

## 📚 Exemples

Consultez `DocumentPreviewExample.tsx` pour des exemples complets d'utilisation de tous les composants.

