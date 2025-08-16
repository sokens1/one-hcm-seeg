import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Lightbulb, Users, Zap } from "lucide-react";

export default function CompanyContext() {
  return (
    <Layout showFooter={true}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-36 -translate-y-36"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-48 translate-y-48"></div>
          </div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-sm font-medium">
                Vision & Ambitions SEEG
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                La Renaissance de la SEEG
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
                Découvrez la vision et les ambitions derrière cette campagne de recrutement exceptionnelle
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Bouton retour */}
            <Button variant="outline" className="mb-8" asChild>
              <a href="/jobs">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux offres
              </a>
            </Button>

            {/* Contenu principal */}
            <div className="space-y-8">
              {/* Vision */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Notre Vision pour 2025</h2>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        La SEEG s'engage dans une transformation majeure pour devenir le leader incontournable 
                        des services énergétiques et hydriques au Gabon. Cette campagne de recrutement marque 
                        le début d'une nouvelle ère, où l'excellence opérationnelle et l'innovation technologique 
                        convergent pour servir les ambitions de développement durable du pays.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enjeux */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Les Enjeux de la Renaissance</h2>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-600 mb-2">Modernisation des Infrastructures</h3>
                          <p className="text-muted-foreground">
                            Investissement massif dans la rénovation et l'extension du réseau électrique et hydraulique 
                            pour répondre aux besoins croissants de la population gabonaise.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-600 mb-2">Transition Énergétique</h3>
                          <p className="text-muted-foreground">
                            Développement des énergies renouvelables et mise en place de solutions énergétiques 
                            durables pour un Gabon plus vert et plus autonome.
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-purple-600 mb-2">Excellence Opérationnelle</h3>
                          <p className="text-muted-foreground">
                            Optimisation des processus, amélioration de la qualité de service et renforcement 
                            de la satisfaction client à travers l'innovation et la formation continue.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profils recherchés */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="w-full">
                      <h2 className="text-2xl font-bold mb-4">Les Profils que Nous Recherchons</h2>
                      <p className="text-muted-foreground mb-6">
                        Cette campagne de recrutement vise à constituer un comité de direction d'exception, 
                        capable de porter la vision de transformation de la SEEG.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground">Compétences Techniques</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Expertise sectorielle reconnue</li>
                            <li>• Vision stratégique et opérationnelle</li>
                            <li>• Maîtrise des enjeux énergétiques</li>
                            <li>• Expérience en transformation d'entreprise</li>
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground">Qualités Humaines</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Leadership inspirant et fédérateur</li>
                            <li>• Engagement pour le service public</li>
                            <li>• Capacité d'innovation et d'adaptation</li>
                            <li>• Sens de l'éthique et de la responsabilité</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ambitions */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Zap className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Nos Ambitions à 5 ans</h2>
                      <div className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          Faire de la SEEG un modèle d'excellence en Afrique centrale, reconnu pour :
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-bold text-2xl text-blue-600 mb-2">100%</h3>
                            <p className="text-sm text-muted-foreground">Couverture électrique nationale</p>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <h3 className="font-bold text-2xl text-green-600 mb-2">50%</h3>
                            <p className="text-sm text-muted-foreground">Énergies renouvelables</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <h3 className="font-bold text-2xl text-purple-600 mb-2">99%</h3>
                            <p className="text-sm text-muted-foreground">Satisfaction client</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center py-8">
                <Card className="shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold mb-4">
                      Prêt à Rejoindre cette Aventure ?
                    </h2>
                    <p className="mb-6 opacity-90">
                      Découvrez nos 19 postes de direction et contribuez à la renaissance de la SEEG
                    </p>
                    <Button variant="secondary" size="lg" asChild>
                      <a href="/jobs">
                        Voir les Offres Disponibles
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}