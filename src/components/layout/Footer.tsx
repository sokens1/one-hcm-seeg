import { Building2, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-hero text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">OneHCM</h3>
                <p className="text-xs text-white/80">Talent Flow Gabon</p>
              </div>
            </div>
            <p className="text-sm text-white/90">
              Plateforme de recrutement dédiée aux talents gabonais. 
              Connectons les entreprises aux meilleurs candidats du Gabon.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Mail className="w-4 h-4" />
                contact@onehcm.ga
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Phone className="w-4 h-4" />
                +241 XX XX XX XX
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <MapPin className="w-4 h-4" />
                Libreville, Gabon
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Liens rapides</h4>
            <div className="space-y-2">
              <a href="/" className="block text-sm text-white/90 hover:text-white transition-colors">
                Offres d'emploi
              </a>
              <a href="/recruiter" className="block text-sm text-white/90 hover:text-white transition-colors">
                Espace recruteur
              </a>
              <a href="#" className="block text-sm text-white/90 hover:text-white transition-colors">
                À propos
              </a>
              <a href="#" className="block text-sm text-white/90 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">OneHCM</h4>
            <p className="text-sm text-white/90">
              Notre mission est de faciliter la rencontre entre les talents gabonais 
              et les opportunités professionnelles, contribuant ainsi au développement 
              économique du Gabon.
            </p>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="text-center text-sm text-white/90">
            <p>&copy; 2024 OneHCM - Talent Flow Gabon. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}