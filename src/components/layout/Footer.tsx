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
    <footer className="bg-primary-dark text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 max-w-6xl mx-auto px-4 w-full">
          {/* Company Info */}
          <div className="flex-1 min-w-[300px] space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <img src="/LOGO HCM WHITE.png" alt="Logo OneHCM" className="w-full h-full object-contain" />
              </div>
              {/* <div>
                <h3 className="text-lg font-bold text-white">OneHCM</h3>
                <p className="text-xs text-white/80">Sourcing Talents</p>
              </div> */}
            </div>
            <p className="text-sm text-white/90">
              Plateforme de recrutement dédiée à la détection des 
              talents pour créer une passerelle entre l'entreprise 
              et ses potentiels internes.
            </p>
          </div>

          {/* Contact Info
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Mail className="w-4 h-4" />
                cnxonehcm@gmail.com
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
          </div> */}

          {/* Quick Links */}
          <div className="flex-1 min-w-[200px] space-y-4 md:text-right">
            <h4 className="font-semibold text-white">Liens rapides</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-white/90 hover:text-white transition-colors">
                Postes à pourvoir
              </Link>
              <Link to="/recruiter" className="block text-[13px] sm:text-sm text-white/90 hover:text-white transition-colors">
                Espace recruteurs
              </Link>
              {/* <a href="#" className="block text-sm text-white/90 hover:text-white transition-colors">
                À propos
              </a> */}
              {/* <a href="#" className="block text-sm text-white/90 hover:text-white transition-colors">
                Politique de confidentialité
              </a> */}
            </div>
          </div>

          {/* About
          <div className="space-y-4">
            <h4 className="font-semibold text-white">OneHCM</h4>
            <p className="text-sm text-white/90">
              Notre mission est de faciliter la rencontre entre les talents gabonais 
              et les opportunités professionnelles, contribuant ainsi au développement 
              économique du Gabon.
            </p>
          </div> */}
        </div>

        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="text-center text-sm text-white/90">
            <p>&copy; {new Date().getFullYear()} OneHCM | Talent source. Tous droits
            réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}