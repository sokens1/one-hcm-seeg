import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function ResponsiveTest() {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Test de Responsivité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Badge variant="outline" className="w-fit">
              {isMobile ? "Mode Mobile" : "Mode Desktop"}
            </Badge>
            <Badge variant="secondary" className="w-fit">
              Largeur: {typeof window !== 'undefined' ? window.innerWidth : 0}px
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="font-semibold text-sm sm:text-base">Carte 1</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Contenu responsive qui s'adapte à la taille d'écran
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm sm:text-base">Carte 2</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Test des breakpoints Tailwind CSS
              </p>
            </Card>
            <Card className="p-4">
              <h3 className="font-semibold text-sm sm:text-base">Carte 3</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Vérification des espacements
              </p>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              Bouton 1
            </Button>
            <Button className="w-full sm:w-auto">
              Bouton 2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


