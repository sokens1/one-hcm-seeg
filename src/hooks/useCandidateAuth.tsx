import { useState, useEffect } from "react";

interface CandidateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  matricule?: string;
  birthDate?: string;
  currentPosition?: string;
}

export function useCandidateAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<CandidateUser | null>(null);

  useEffect(() => {
    // Vérifier l'état d'authentification au chargement
    const authenticated = localStorage.getItem("candidate_authenticated") === "true";
    const userData = localStorage.getItem("candidate_user");
    
    setIsAuthenticated(authenticated);
    if (authenticated && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: CandidateUser) => {
    localStorage.setItem("candidate_authenticated", "true");
    localStorage.setItem("candidate_user", JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("candidate_authenticated");
    localStorage.removeItem("candidate_user");
    setIsAuthenticated(false);
    setUser(null);
  };

  const updateUser = (userData: CandidateUser) => {
    localStorage.setItem("candidate_user", JSON.stringify(userData));
    setUser(userData);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    updateUser
  };
}