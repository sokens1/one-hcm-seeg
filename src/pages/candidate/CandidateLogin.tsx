import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CandidateLogin() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Rediriger vers la page d'authentification unifiée
    navigate("/auth");
  }, [navigate]);

  return null;
}