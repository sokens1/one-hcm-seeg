import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecruiterPipeline() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tunnel de recrutement</h1>
        <p className="text-muted-foreground">
          Vue d'ensemble du processus de recrutement pour tous les postes
        </p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offres en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">5</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Candidatures totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">127</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En entretien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">23</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taux de conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">18%</div>
          </CardContent>
        </Card>
      </div>

      {/* Vue d'ensemble du tunnel */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Processus de recrutement global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">45</div>
              <div className="text-sm text-muted-foreground">Nouveaux</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">32</div>
              <div className="text-sm text-muted-foreground">Présélectionnés</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">23</div>
              <div className="text-sm text-muted-foreground">Entretien</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">15</div>
              <div className="text-sm text-muted-foreground">Sélectionnés</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-2">12</div>
              <div className="text-sm text-muted-foreground">Refusés</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}