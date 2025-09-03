import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentPreviewModal, FullscreenDocumentViewer, DocumentGallery } from "@/components/ui";
import { FileText, Eye, Maximize2, Grid3X3 } from "lucide-react";

// Données d'exemple
const sampleDocuments = [
  {
    id: '1',
    file_name: 'CV_Candidat.pdf',
    file_url: 'https://example.com/sample.pdf',
    document_type: 'CV',
    file_size: 1024000,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    file_name: 'Lettre_Motivation.docx',
    file_url: 'https://example.com/sample.docx',
    document_type: 'Lettre de motivation',
    file_size: 512000,
    created_at: '2024-01-15'
  },
  {
    id: '3',
    file_name: 'Photo_Profil.jpg',
    file_url: 'https://example.com/sample.jpg',
    document_type: 'Photo',
    file_size: 2048000,
    created_at: '2024-01-15'
  },
  {
    id: '4',
    file_name: 'Certificat_Formation.pdf',
    file_url: 'https://example.com/sample2.pdf',
    document_type: 'Certificat',
    file_size: 768000,
    created_at: '2024-01-14'
  }
];

export const DocumentPreviewExample: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<typeof sampleDocuments[0] | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openPreview = (document: typeof sampleDocuments[0], index: number) => {
    setSelectedDocument(document);
    setCurrentIndex(index);
    setIsPreviewModalOpen(true);
  };

  const openFullscreen = (document: typeof sampleDocuments[0], index: number) => {
    setSelectedDocument(document);
    setCurrentIndex(index);
    setIsFullscreenOpen(true);
  };

  const navigateDocument = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setSelectedDocument(sampleDocuments[newIndex]);
    } else if (direction === 'next' && currentIndex < sampleDocuments.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setSelectedDocument(sampleDocuments[newIndex]);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Démonstration - Prévisualisation de Documents</h1>
        <p className="text-muted-foreground">
          Composants améliorés pour la prévisualisation des documents avec mode plein écran
        </p>
      </div>

      {/* Section 1: Composant DocumentGallery */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5" />
            Galerie de Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentGallery
            documents={sampleDocuments}
            title="Documents de candidature"
            allowDownload={true}
            allowExternal={true}
            showThumbnails={true}
            maxHeight="300px"
          />
        </CardContent>
      </Card>

      {/* Section 2: Boutons de démonstration */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de démonstration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold">Prévisualisation simple</h3>
              <div className="flex flex-wrap gap-2">
                {sampleDocuments.slice(0, 2).map((doc, index) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    onClick={() => openPreview(doc, index)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Prévisualiser {doc.file_name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Mode plein écran</h3>
              <div className="flex flex-wrap gap-2">
                {sampleDocuments.slice(0, 2).map((doc, index) => (
                  <Button
                    key={doc.id}
                    variant="outline"
                    onClick={() => openFullscreen(doc, index)}
                    className="flex items-center gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Plein écran {doc.file_name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">📱 Prévisualisation Modal</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Support multi-formats (PDF, images, Office)</li>
                <li>• Zoom et rotation pour les images</li>
                <li>• Mode plein écran intégré</li>
                <li>• Téléchargement et ouverture externe</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">🖥️ Mode Plein Écran</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Interface optimisée plein écran</li>
                <li>• Raccourcis clavier (+, -, R, L, 0)</li>
                <li>• Navigation entre documents</li>
                <li>• Toolbar auto-masquée</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-primary">📚 Galerie de Documents</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vue grille et liste</li>
                <li>• Icônes par type de fichier</li>
                <li>• Actions rapides au survol</li>
                <li>• Navigation fluide</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Raccourcis clavier */}
      <Card>
        <CardHeader>
          <CardTitle>Raccourcis clavier (mode plein écran)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">+ / -</div>
              <div className="text-sm text-muted-foreground">Zoom avant/arrière</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">R / L</div>
              <div className="text-sm text-muted-foreground">Rotation droite/gauche</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">0</div>
              <div className="text-sm text-muted-foreground">Reset vue</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">H</div>
              <div className="text-sm text-muted-foreground">Afficher/masquer toolbar</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">I</div>
              <div className="text-sm text-muted-foreground">Panneau d'info</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">← →</div>
              <div className="text-sm text-muted-foreground">Navigation documents</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">Échap</div>
              <div className="text-sm text-muted-foreground">Fermer</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-mono mb-1">Souris</div>
              <div className="text-sm text-muted-foreground">Afficher toolbar</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedDocument && (
        <>
          <DocumentPreviewModal
            fileUrl={selectedDocument.file_url}
            fileName={selectedDocument.file_name}
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            showToolbar={true}
            allowDownload={true}
            allowExternal={true}
          />

          <FullscreenDocumentViewer
            fileUrl={selectedDocument.file_url}
            fileName={selectedDocument.file_name}
            isOpen={isFullscreenOpen}
            onClose={() => setIsFullscreenOpen(false)}
            onNavigate={navigateDocument}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < sampleDocuments.length - 1}
            showInfo={true}
            allowDownload={true}
            allowExternal={true}
          />
        </>
      )}
    </div>
  );
};

