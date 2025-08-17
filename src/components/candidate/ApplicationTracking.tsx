import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, Users, Trophy, FileCheck, Eye, MessageSquare, Calendar } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const mockApplicationData = {
  1: {
    poste: "Directeur des Ressources Humaines",
    dateDepot: "15 Décembre 2024",
    etapeActuelle: 3,
    protocole1: {
      etapes: [
        { 
          numero: 1, 
          titre: "Dépôt de candidature", 
          statut: "completed", 
          icon: CheckCircle,
          description: "Votre candidature a bien été soumise",
          date: "15 Décembre 2024"
        },
        { 
          numero: 2, 
          titre: "Documents requis vérifiés", 
          statut: "completed", 
          icon: FileCheck,
          description: "Documents reçus et validés",
          date: "16 Décembre 2024"
        },
        { 
          numero: 3, 
          titre: "Adhérence MTP", 
          statut: "current", 
          icon: Clock,
          description: "Evaluation en cours",
          date: "En cours"
        },
        { 
          numero: 4, 
          titre: "Décision globale", 
          statut: "pending", 
          icon: Trophy,
          description: "Candidature retenue / non retenue",
          date: "À venir"
        }
      ]
    },
    protocole2: {
      visible: false, // Sera visible quand le candidat avance
      etapes: [
        { 
          numero: 1, 
          titre: "Visite physique", 
          statut: "pending", 
          icon: Eye,
          description: "Visite effectuée",
          date: "À planifier"
        },
        { 
          numero: 2, 
          titre: "Entretien", 
          statut: "pending", 
          icon: MessageSquare,
          description: "Entretien effectué",
          date: "À planifier"
        },
        { 
          numero: 3, 
          titre: "Jeux de rôle", 
          statut: "pending", 
          icon: Users,
          description: "Evaluation en cours",
          date: "À planifier"
        },
        { 
          numero: 4, 
          titre: "Jeux de CoDir", 
          statut: "pending", 
          icon: Users,
          description: "Prévus",
          date: "À planifier"
        },
        { 
          numero: 5, 
          titre: "Édition fiche de fonction", 
          statut: "pending", 
          icon: FileCheck,
          description: "En préparation",
          date: "À planifier"
        },
        { 
          numero: 6, 
          titre: "Gap de compétences", 
          statut: "pending", 
          icon: Trophy,
          description: "Analyse en cours",
          date: "À planifier"
        }
      ]
    }
  }
};

export function ApplicationTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const application = mockApplicationData[parseInt(id || "1") as keyof typeof mockApplicationData] || mockApplicationData[1];

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "completed":
        return "bg-green-500 border-green-500 text-white";
      case "current":
        return "bg-blue-500 border-blue-500 text-white animate-pulse";
      default:
        return "bg-white border-gray-300 text-gray-400";
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>;
      case "current":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">En attente</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Button>
      </div>

      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">
          Suivi de ma candidature pour : {application.poste}
        </h1>
        <p className="text-lg text-muted-foreground">
          Candidature déposée le {application.dateDepot}
        </p>
      </div>

      {/* Protocole 1 */}
      <Card className="shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Protocole 1 - Étape d'évaluation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {application.protocole1.etapes.map((etape, index) => {
              const IconComponent = etape.icon;
              return (
                <div key={etape.numero} className="flex items-start gap-4">
                  {/* Timeline line */}
                  {index < application.protocole1.etapes.length - 1 && (
                    <div className="absolute ml-6 mt-12 w-0.5 h-16 bg-gradient-to-b from-primary to-gray-300"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${getStatusColor(etape.statut)}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{etape.titre}</h3>
                      {getStatusBadge(etape.statut)}
                    </div>
                    <p className="text-muted-foreground mb-1">{etape.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {etape.date}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Protocole 2 (conditionnel) */}
      {application.protocole2.visible && (
        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Protocole 2 - Étape d'évaluation avancée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {application.protocole2.etapes.map((etape, index) => {
                const IconComponent = etape.icon;
                return (
                  <div key={etape.numero} className="flex items-start gap-4">
                    {/* Timeline line */}
                    {index < application.protocole2.etapes.length - 1 && (
                      <div className="absolute ml-6 mt-12 w-0.5 h-16 bg-gradient-to-b from-primary to-gray-300"></div>
                    )}
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${getStatusColor(etape.statut)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{etape.titre}</h3>
                        {getStatusBadge(etape.statut)}
                      </div>
                      <p className="text-muted-foreground mb-1">{etape.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {etape.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statut global */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Statut actuel de votre candidature</h3>
            <p className="text-blue-700 mb-4">
              Votre dossier est en cours d'analyse par notre équipe de recrutement. 
              Vous recevrez une notification dès que nous aurons avancé. 
              Estimation : 5 jours ouvrés.
            </p>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Étape {application.etapeActuelle} en cours
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}