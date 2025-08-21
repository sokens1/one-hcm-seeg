import { Building2, Mail, Phone, MapPin } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleOffersClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();
    if (location.pathname === "/") {
      document.getElementById("job-list")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => document.getElementById("job-list")?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };
  return (
    <footer className="bg-primary-dark text-white mt-10 sm:mt-16">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">OneHCM</h3>
                <p className="text-[11px] sm:text-xs text-white/80">Talent Flow Gabon</p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-white/90">
              Plateforme de recrutement dédiée aux talents gabonais. 
              Connectons les entreprises aux meilleurs candidats du Gabon.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-white text-sm sm:text-base">Contact</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 text-[13px] sm:text-sm text-white/90">
                <Mail className="w-4 h-4 flex-shrink-0" />
                contact@onehcm.ga
              </div>
              <div className="flex items-center gap-2 text-[13px] sm:text-sm text-white/90">
                <Phone className="w-4 h-4 flex-shrink-0" />
                +241 XX XX XX XX
              </div>
              <div className="flex items-center gap-2 text-[13px] sm:text-sm text-white/90">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                Libreville, Gabon
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-white text-sm sm:text-base">Liens rapides</h4>
            <div className="space-y-1.5 sm:space-y-2">
              <Link to="/" onClick={handleOffersClick} className="block text-[13px] sm:text-sm text-white/90 hover:text-white transition-colors">
                Offres d'emploi
              </Link>
              <Link to="/recruiter" className="block text-[13px] sm:text-sm text-white/90 hover:text-white transition-colors">
                Espace recruteur
              </Link>
              <a href="#" className="block text-[13px] sm:text-sm text-white/90 hover:text-white transition-colors">
                À propos
              </a>
              <a href="#" className="block text-[13px] sm:text-sm text-white/90 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>

          {/* About */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-semibold text-white text-sm sm:text-base">OneHCM</h4>
            <p className="text-sm sm:text-base text-white/90">
              Notre mission est de faciliter la rencontre entre les talents gabonais 
              et les opportunités professionnelles, contribuant ainsi au développement 
              économique du Gabon.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="text-center text-[13px] sm:text-sm text-white/90">
            <p>&copy; 2024 OneHCM - Talent Flow Gabon. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}