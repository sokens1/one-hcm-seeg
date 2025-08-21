import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary-dark text-white mt-8 sm:mt-12 lg:mt-16">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                <img src="/LOGO HCM4.png" alt="Logo OneHCM" className="w-8 h-7 sm:w-10 sm:h-9 object-contain" />
              </div>
              {/* <div>
                <h3 className="text-base sm:text-lg font-bold text-white">OneHCM</h3>
                <p className="text-xs text-white/80">Talent Flow Gabon</p>
              </div> */}
            </div>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Plateforme de recrutement dédiée aux talents gabonais. 
              Connectons les entreprises aux meilleurs candidats du Gabon.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-white">Contact</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 text-sm sm:text-base text-white/90">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="break-all">cnxonehcm@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-white/90">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                +241 76 40 40 86
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-white/90">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                Libreville, Gabon
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-white">Liens rapides</h4>
            <div className="space-y-2 sm:space-y-3">
              <a href="/" className="block text-sm sm:text-base text-white/90 hover:text-white transition-colors">
                Offres d'emploi
              </a>
              <a href="/recruiter" className="block text-sm sm:text-base text-white/90 hover:text-white transition-colors">
                Espace recruteur
              </a>
              <a href="#" className="block text-sm sm:text-base text-white/90 hover:text-white transition-colors">
                À propos
              </a>
              <a href="#" className="block text-sm sm:text-base text-white/90 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>

          {/* About */}
          <div className="space-y-2 sm:space-y-3 lg:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-white">Notre Mission</h4>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Notre mission est de faciliter la rencontre entre les talents gabonais 
              et les opportunités professionnelles, contribuant ainsi au développement 
              économique du Gabon.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 sm:mt-8 lg:mt-12 pt-4 sm:pt-6 lg:pt-8">
          <div className="text-center text-sm sm:text-base text-white/90">
            <p>&copy; 2025 OneHCM - Talent Flow Gabon. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}