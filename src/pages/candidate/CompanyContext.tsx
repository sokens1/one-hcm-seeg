import { useEffect, useState } from 'react';
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Wrench, Shield, Coins, Handshake, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function CompanyContext() {
  const [jobCount, setJobCount] = useState<number>(0);

  useEffect(() => {
    const fetchJobCount = async () => {
      const { count, error } = await supabase
        .from('job_offers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (!error && count !== null) {
        setJobCount(count);
      }
    };

    fetchJobCount();
  }, []);

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
                Contexte du recrutement
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Vision SEEG 2025 - 2035
              </h1>
              <p className="text-xl md:text-2xl opacity-90">
              Comprendre les fondements stratégiques du recrutement de l’équipe dirigeante
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 -mt-16">
          <div className="max-w-4xl mx-auto">
            {/* Bouton retour */}
            <Button variant="outline" className="mb-8 bg-white text-blue-600 backdrop-blur-sm" asChild>
              <a href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux offres
              </a>
            </Button>

            {/* Contenu principal */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 md:p-12 space-y-12">
                {/* Vision SEEG */}
                <section>
                  <h2 className="text-3xl font-bold text-blue-800 mb-4">Vision SEEG 2025 2035</h2>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    Une vision transformatrice s'impose pour sortir du cycle des crises récurrentes et offrir un service de qualité et fiable d'accès universel à l'eau et à l'électricité aux populations et industries du Gabon. Cette vision doit intégrer les retours d'expérience et leçons du passé, la posture actuelle et les aspirations futures du Gabon.
                  </p>
                </section>

                {/* Contexte */}
                <section>
                  <h3 className="text-2xl font-bold text-blue-700 border-b-2 border-blue-200 pb-3 mb-6">Contexte</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                    <p>
                      La SEEG ne remplit pas convenablement, depuis des années, ses obligations dans sa mission régalienne déléguée par la République Gabonaise (Convention de concession). En effet, une évaluation sur presque toutes les activités de base et de support de la société conduit à une performance proche de la médiocrité ;
                    </p>
                    <p className="font-semibold text-slate-800">Il en ressort :</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Infrastructures vieillissantes et mal entretenues depuis des décennies de mauvaise gestion entraînant délestages électriques et situation de stress hydrique récurrents ;</li>
                      <li>Gestion des ressources non conformes aux procédures internes ni aux pratiques dans l'industrie ;</li>
                      <li>Endettement important et problèmes de gouvernance, incluant des allégations de détournements de fonds via des sociétés écrans ;</li>
                      <li>Tension croissante entre la SEEG et l'Etat, avec des risques de sanctions pour interruptions de   services ;</li>
                      <li>Mécontentement des populations et interrogation des industries.</li>
                    </ul>
                  </div>
                </section>

                {/* Vision Stratégique */}
                <section>
                  <h3 className="text-2xl font-bold text-blue-700 border-b-2 border-blue-200 pb-3 mb-6">Vision Stratégique pour la SEEG</h3>
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-10 mt-6">
                    {/* Theme 1 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Users className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 1 : Réorganisation</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Ramener les charges salariales de 26% à 15% du CA soit une réduction de 23 milliards/an ;</li>
                          <li>Se conformer à un split des effectifs Techniques vs Support à 65/35 au lieu de 46/54 ;</li>
                          <li>Resculpter la pyramide organisationnelle faisant sens (15 Directeurs max., Managers 30%, Ingénieurs et techniciens 60%, Admin et Supports 20%, contractuels et temporaires) ;</li>
                          <li>Coût estimé du plan social en fin 2025 circa 40 milliards (18-24 mois de salaires + droits).</li>
                        </ul>
                      </div>
                    </div>
                    {/* Theme 2 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Wrench className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 2 : Réhabilitation/modernisation</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Un plan d'investissement ambitieux de 500 milliards XAF pour la réhabilitation et l'extension des réseaux ;</li>
                          <li>Des partenariats techniques (ex : contrat SUEZ, EDF) jusqu'à la compétence avérée locale ;</li>
                          <li>Suivi des travaux et réception de nouvelles centrales et la maintenance rigoureuse des existantes ;</li>
                          <li>Suivi des travaux et réception du Réseau Interconnecté National.</li>
                        </ul>
                      </div>
                    </div>
                    {/* Theme 3 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Shield className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 3 : Gouvernance renforcée</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Mise en place d'un système de contrôle indépendant impliquant l'ARSEE ;</li>
                          <li>Audit Régulier des comptes et procédures ;</li>
                          <li>Digitalisation des processus pour limiter les interférences humaines ;</li>
                          <li>Revues Trimestrielle et Annuelle de la Performance et Responsabilisation des dirigeants.</li>
                        </ul>
                      </div>
                    </div>
                    {/* Theme 4 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Coins className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 4: Modèle Economique Viable</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Résolution des impayés pesant sur la trésorerie (ex : Etat, dignitaires) ;</li>
                          <li>Facturation de tous les clients bénéficiant des services ;</li>
                          <li>Tarification sociale mais réaliste ;</li>
                          <li>Achat électricité chez les Producteurs Indépendants à un prix acceptable ;</li>
                          <li>Réduire/Eradiquer la production permanente au Gasoil.</li>
                        </ul>
                      </div>
                    </div>
                    {/* Theme 5 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Handshake className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 5 : Parties prenantes</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Participation active des associations de consommateurs dans le contrôle qualité ;</li>
                          <li>Formation et motivation des employés ;</li>
                          <li>Dialogue constructif entre l'Etat, la SEEG et les partenaires techniques.</li>
                        </ul>
                      </div>
                    </div>
                    {/* Theme 6 */}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full"><Leaf className="w-6 h-6" /></div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 mb-2">Thème 6 : Transition Energétique</h4>
                        <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm">
                          <li>Intégration progressive des énergies renouvelables (ex : solaire) ;</li>
                          <li>Solutions décentralisées pour les zones rurales éloignées ;</li>
                          <li>Adoption de technologies intelligentes (compteurs connectés, etc.).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Conclusion */}
                <section>
                  <h3 className="text-2xl font-bold text-blue-700 border-b-2 border-blue-200 pb-3 mb-6">Conclusion</h3>
                  <p className="text-lg text-slate-700 leading-relaxed">
                    La renaissance de la SEEG nécessite une approche holistique combinant rigueur managériale, Investissements Stratégiques et implication citoyenne. Le Gabon dispose des ressources et du potentiel humain pour transformer sa société d'Energie et d'Eau en un modèle de performance au service du développement national.
                  </p>
                </section>

                {/* P.S */}
                <section>
                  <h3 className="text-2xl font-bold text-blue-700 border-b-2 border-blue-200 pb-3 mb-6">P.S :</h3>
                  <div className="space-y-4 text-slate-600 leading-relaxed">
                    <p>
                      L'Etat est propriétaire des infrastructures de la Concession, il est de sa compétence de porter les Investissements structurants.
                    </p>
                    <p>
                      La SEEG est liée à l'Etat Gabonais par Une Convention de Concession qui, globalement, exige que la SEEG exploite et maintienne, selon les standards et pratiques de l'industrie, les infrastructures mises à disposition. Dans sa période de renaissance et de restructuration, la SEEG devra se concentrer sur ces obligations de réhabilitation de l'outil de travail et de production, transport et distribution ainsi que sur l'efficacité de toutes ses opérations, de la commercialisation et du service au public comme attendu par la population et les industries.
                    </p>
                    <p>
                      Les ambitions révélées de l'Etat, pour une industrialisation ambitieuse, placent en la SEEG des attentes comme jamais auparavant et à l'horizon 2029. La SEEG sera au cœur du plan d'investissement global pour se transformer rapidement aux fins d'une capacité à exploiter une production nationale.
                    </p>
                  </div>
                </section>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center py-12">
              <Card className="shadow-xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white rounded-2xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4">
                  Prêt à rejoindre l’équipe dirigeante ?
                  </h2>
                  <p className="mb-6 opacity-90 text-lg">
                  {jobCount} profils recherchés pour une mission d’intérêt
                  national. Et si c’était vous ?
                    {/* Découvrez nos {jobCount} poste{jobCount > 1 ? 's' : ''} disponible{jobCount > 1 ? 's' : ''} et contribuez à la renaissance de la SEEG. */}
                  </p>
                  <Button variant="secondary" size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-bold" asChild>
                    <a href="/">
                      Voir les Offres Disponibles
                    </a>
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