import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCandidateAuth } from "@/hooks/useCandidateAuth";
import { useRecruiterAuth } from "@/hooks/useRecruiterAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated: candidateAuth } = useCandidateAuth();
  const { isAuthenticated: recruiterAuth } = useRecruiterAuth();

  useEffect(() => {
    // Rediriger si déjà connecté
    if (candidateAuth) {
      navigate("/candidate/dashboard");
    } else if (recruiterAuth) {
      navigate("/recruiter");
    }
  }, [navigate, candidateAuth, recruiterAuth]);

  // Ne pas afficher la page d'accueil si l'utilisateur est connecté
  if (candidateAuth || recruiterAuth) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-primary">OneHCM</h1>
          <p className="text-xl text-muted-foreground">Plateforme de recrutement moderne</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Espace Candidat */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Espace Candidat</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Découvrez nos offres d'emploi et postulez aux postes qui vous intéressent
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => navigate("/jobs")}
                >
                  Voir les offres
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/candidate/login")}
                >
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Espace Recruteur */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Espace Recruteur</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Gérez vos offres d'emploi et suivez vos candidatures
              </p>
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => navigate("/recruiter")}
                >
                  Accéder au tableau de bord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
