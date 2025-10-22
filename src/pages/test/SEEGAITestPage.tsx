import React from 'react';
import { ObserverLayout } from '@/components/layout/ObserverLayout';
import { SEEGAITestComponent } from '@/components/test/SEEGAITestComponent';

export default function SEEGAITestPage() {
  return (
    <ObserverLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Test API SEEG AI</h1>
          <p className="text-muted-foreground mt-2">
            Page de test pour vérifier l'intégration avec l'API SEEG AI
          </p>
        </div>
        
        <SEEGAITestComponent />
      </div>
    </ObserverLayout>
  );
}
