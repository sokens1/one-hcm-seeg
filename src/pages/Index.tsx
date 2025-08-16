import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection automatique vers la page des candidats
    navigate("/jobs");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirection en cours...</h1>
        <p className="text-xl text-muted-foreground">Vous allez être redirigé vers OneHCM</p>
      </div>
    </div>
  );
};

export default Index;
