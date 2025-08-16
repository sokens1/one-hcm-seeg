import { useState, useEffect } from "react";

export function useRecruiterAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const authenticated = localStorage.getItem("recruiter_authenticated") === "true";
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  }, []);

  const login = () => {
    localStorage.setItem("recruiter_authenticated", "true");
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("recruiter_authenticated");
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}