import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  return (
    <Layout showFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-20">
            <div className="flex justify-start mb-4">
              <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </div>
            <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                Politique de Confidentialité
              </div>
              <h1 className="text-3xl md:text-5xl font-bold">
                Protection de vos données personnelles
              </h1>
              <p className="text-base md:text-xl opacity-90">
                Nous nous engageons à respecter votre vie privée et à protéger vos informations.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-10 md:py-12 -mt-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 md:p-10 space-y-8">
                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">1. Responsable du traitement</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Le responsable du traitement des données collectées via cette plateforme est OneHCM/SEEG.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">2. Données collectées</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Nous collectons les informations que vous nous fournissez lors de la création de compte et de la candidature (ex. identité, coordonnées, documents, réponses au formulaire), ainsi que des données techniques d’usage (journalisation, sécurité).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">3. Finalités et bases légales</h2>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>Gestion des candidatures et du processus de recrutement.</li>
                    <li>Communication avec les candidats et suivi des dossiers.</li>
                    <li>Amélioration du service et sécurité de la plateforme.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">4. Destinataires</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Vos données sont strictement accessibles aux équipes habilitées de OneHCM/SEEG et, le cas échéant, à nos partenaires techniques dans le cadre du recrutement.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">5. Durée de conservation</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Les données sont conservées pour la durée nécessaire au traitement des candidatures, puis archivées ou supprimées conformément aux exigences légales.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">6. Vos droits</h2>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>Droit d’accès, de rectification, d’effacement.</li>
                    <li>Droit d’opposition et de limitation du traitement.</li>
                    <li>Droit à la portabilité des données.</li>
                  </ul>
                  <p className="text-slate-700 leading-relaxed mt-2">
                    Pour exercer vos droits, contactez-nous via les coordonnées disponibles sur la plateforme.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">7. Sécurité</h2>
                  <p className="text-slate-700 leading-relaxed">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">8. Transferts hors UE</h2>
                  <p className="text-slate-700 leading-relaxed">
                    S’il y a des transferts de données hors de l’Union Européenne, ceux-ci sont encadrés par des garanties appropriées conformément à la réglementation.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">9. Mise à jour</h2>
                  <p className="text-slate-700 leading-relaxed">
                    La présente politique peut être mise à jour. En cas de modifications majeures, nous vous en informerons par les canaux habituels.
                  </p>
                </section>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-10">
              <Card className="shadow-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Prêt à continuer votre candidature ?
                  </h2>
                  <p className="mb-6 opacity-90">
                    Revenez aux offres et poursuivez votre parcours.
                  </p>
                  <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold" asChild>
                    <a href="/jobs">Voir les Offres Disponibles</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
