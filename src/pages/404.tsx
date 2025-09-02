import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page non trouvée</h2>
          <p className="text-muted-foreground">
            Désolé, nous n'avons pas trouvé la page que vous recherchez.
          </p>
        </div>
        <div className="flex justify-center">
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la page précédente
          </Button>
        </div>
      </div>
    </div>
  );
}
