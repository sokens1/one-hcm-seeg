import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, User, FileText, Send, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { isApplicationClosed } from "@/utils/applicationUtils";

interface ApplicationFormAdvancedProps {
  jobTitle: string;
  onBack: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  currentPosition: string;
  cv: File | null;
  motivationLetter: string;
  certificates: File[];
  recommendations: File[];
  referenceContacts: string;
  mtpQuestion1: string;
  mtpQuestion2: string;
  mtpQuestion3: string;
  consent: boolean;
}

export function ApplicationFormAdvanced({ jobTitle, onBack }: ApplicationFormAdvancedProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.user_metadata.first_name || "",
    lastName: user?.user_metadata.last_name || "",
    email: user?.email || "",
    birthDate: user?.user_metadata.birth_date || "",
    currentPosition: user?.user_metadata.current_position || "",
    cv: null,
    motivationLetter: "",
    certificates: [],
    recommendations: [],
    referenceContacts: "",
    mtpQuestion1: "",
    mtpQuestion2: "",
    mtpQuestion3: "",
    consent: false
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Candidature envoyée avec succès !",
      description: "Nous reviendrons vers vous très prochainement.",
    });
    setIsSubmitted(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (files) {
      if (field === "cv") {
        setFormData({ ...formData, cv: files[0] });
      } else if (field === "certificates") {
        setFormData({ ...formData, certificates: [...formData.certificates, ...Array.from(files)] });
      } else if (field === "recommendations") {
        setFormData({ ...formData, recommendations: [...formData.recommendations, ...Array.from(files)] });
      }
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Candidature envoyée !</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Merci, <strong>{formData.firstName}</strong> ! Nous avons bien reçu votre candidature pour le poste de{" "}
              <strong>{jobTitle}</strong> et nous reviendrons vers vous très prochainement.
            </p>
            <div className="space-y-3">
              <Button variant="default" onClick={onBack} className="w-full bg-white text-blue-600 text-sm sm:text-base py-2 sm:py-3">
                Retour aux offres
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/candidate/dashboard?view=dashboard">Voir mon tableau de bord</a>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const stepTitles = [
    "Informations Personnelles",
    "Parcours & Documents", 
    "Questionnaire MTP",
    "Finalisation"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-blue-600 bg-white text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Retour à l'offre
          </Button>
          
          <div className="text-center space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight">Candidature pour {jobTitle}</h1>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 max-w-2xl mx-auto px-2">
              Processus de candidature en 4 étapes pour rejoindre le comité de direction de la SEEG
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all ${
                    step <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step <= currentStep ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`h-0.5 sm:h-1 w-12 sm:w-16 lg:w-20 mx-1 sm:mx-2 rounded-full transition-all ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-600">
              {stepTitles.map((title, index) => (
                <span key={index} className="text-center max-w-16 sm:max-w-20 leading-tight">{title}</span>
              ))}
            </div>
            <div className="mt-3 sm:mt-4 bg-gray-200 rounded-full h-1.5 sm:h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                {currentStep === 1 && <><User className="w-5 h-5 sm:w-6 sm:h-6" /> Informations Personnelles</>}
                {currentStep === 2 && <><FileText className="w-5 h-5 sm:w-6 sm:h-6" /> Parcours & Documents</>}
                {currentStep === 3 && <><MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" /> Questionnaire : Métier, Talent et Paradigme</>}
                {currentStep === 4 && <><Send className="w-5 h-5 sm:w-6 sm:h-6" /> Finalisation</>}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 sm:space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm sm:text-base">Prénom *</Label>
                       <Input
                         id="firstName"
                         value={formData.firstName}
                         onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                         required
                         className="text-sm sm:text-base"
                       />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm sm:text-base">Nom *</Label>
                       <Input
                         id="lastName"
                         value={formData.lastName}
                         onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                         required
                         className="text-sm sm:text-base"
                       />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Email *</Label>
                     <Input
                       id="email"
                       type="email"
                       value={formData.email}
                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                       required
                       className="text-sm sm:text-base"
                     />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="birthDate" className="text-sm sm:text-base">Date de naissance *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        required
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPosition" className="text-sm sm:text-base">Poste actuel *</Label>
                      <Input
                        id="currentPosition"
                        value={formData.currentPosition}
                        onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                        required
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Documents */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <Label htmlFor="cv">Votre CV *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {formData.cv ? formData.cv.name : "Glissez votre CV ici ou cliquez pour parcourir"}
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, "cv")}
                          className="hidden"
                          id="cv-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('cv-upload')?.click()}
                        >
                          Choisir un fichier
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="motivationLetter">Lettre de motivation *</Label>
                    <Textarea
                      id="motivationLetter"
                      value={formData.motivationLetter}
                      onChange={(e) => setFormData({ ...formData, motivationLetter: e.target.value })}
                      placeholder="Exprimez votre motivation pour ce poste..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="certificates">Certificat(s) (facultatif)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={(e) => handleFileUpload(e, "certificates")}
                        className="hidden"
                        id="certificates-upload"
                        multiple
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('certificates-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Ajouter des certificats
                      </Button>
                      {formData.certificates.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.certificates.map((file, index) => (
                            <p key={index} className="text-sm text-muted-foreground">{file.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Lettre(s) de recommandation (facultatif)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "recommendations")}
                        className="hidden"
                        id="recommendations-upload"
                        multiple
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('recommendations-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Ajouter des recommandations
                      </Button>
                      {formData.recommendations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.recommendations.map((file, index) => (
                            <p key={index} className="text-sm text-muted-foreground">{file.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="referenceContacts">Références de recommandation (facultatif)</Label>
                    <Textarea
                      id="referenceContacts"
                      value={formData.referenceContacts}
                      onChange={(e) => setFormData({ ...formData, referenceContacts: e.target.value })}
                      placeholder="Nom, poste, entreprise, téléphone/email des personnes pouvant vous recommander..."
                      className="min-h-24"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: MTP Questionnaire */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Questionnaire : Métier, Talent et Paradigme</h3>
                    <p className="text-blue-700 text-sm">
                      Quelques questions pour mieux comprendre vos aspirations et votre vision.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="mtpQuestion1">Question 1 : Décrivez ce qui vous passionne le plus dans votre métier *</Label>
                    <Textarea
                      id="mtpQuestion1"
                      value={formData.mtpQuestion1}
                      onChange={(e) => setFormData({ ...formData, mtpQuestion1: e.target.value })}
                      placeholder="Partagez ce qui vous motive au quotidien dans votre profession..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mtpQuestion2">Question 2 : Quel est le talent unique que vous apporteriez à la SEEG ? *</Label>
                    <Textarea
                      id="mtpQuestion2"
                      value={formData.mtpQuestion2}
                      onChange={(e) => setFormData({ ...formData, mtpQuestion2: e.target.value })}
                      placeholder="Décrivez votre valeur ajoutée spécifique..."
                      className="min-h-32"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="mtpQuestion3">Question 3 : Partagez un exemple où vous avez changé de paradigme pour résoudre un problème complexe *</Label>
                    <Textarea
                      id="mtpQuestion3"
                      value={formData.mtpQuestion3}
                      onChange={(e) => setFormData({ ...formData, mtpQuestion3: e.target.value })}
                      placeholder="Racontez une situation où vous avez innové dans votre approche..."
                      className="min-h-32"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-muted rounded-lg p-6 space-y-4">
                    <h4 className="font-medium text-lg">Récapitulatif de votre candidature</h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nom complet:</span>
                        <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{formData.email}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date de naissance:</span>
                        <p className="font-medium">{formData.birthDate || "Non renseigné"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Poste actuel:</span>
                        <p className="font-medium">{formData.currentPosition || "Non renseigné"}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">Documents fournis:</h5>
                      <ul className="text-sm space-y-1">
                        <li>• CV: {formData.cv?.name || "Non fourni"}</li>
                        <li>• Lettre de motivation: {formData.motivationLetter ? "✓ Fournie" : "Non fournie"}</li>
                        <li>• Certificats: {formData.certificates.length} fichier(s)</li>
                        <li>• Recommandations: {formData.recommendations.length} fichier(s)</li>
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      <h5 className="font-medium mb-2">Questionnaire MTP:</h5>
                      <ul className="text-sm space-y-1">
                        <li>• Passion métier: {formData.mtpQuestion1 ? "✓ Répondu" : "Non répondu"}</li>
                        <li>• Talent unique: {formData.mtpQuestion2 ? "✓ Répondu" : "Non répondu"}</li>
                        <li>• Changement paradigme: {formData.mtpQuestion3 ? "✓ Répondu" : "Non répondu"}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="consent"
                      checked={formData.consent}
                      onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    />
                    <Label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                      J'accepte que mes données personnelles soient traitées dans le cadre de cette candidature
                      conformément à la <Link to="/privacy-policy" className="underline underline-offset-2 text-blue-700 hover:text-blue-800">politique de confidentialité</Link> de la SEEG et aux règlements RGPD.
                    </Label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    variant="default"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.birthDate || !formData.currentPosition)) ||
                      (currentStep === 2 && (!formData.cv || !formData.motivationLetter)) ||
                      (currentStep === 3 && (!formData.mtpQuestion1 || !formData.mtpQuestion2 || !formData.mtpQuestion3))
                    }
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={handleSubmit}
                    disabled={!formData.consent}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Envoyer ma candidature...
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}