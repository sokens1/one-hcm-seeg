/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, ArrowRight, Upload, CheckCircle, User, FileText, Send, Calendar as CalendarIcon, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useApplications } from "@/hooks/useApplications";
import { useFileUpload, UploadedFile } from "@/hooks/useFileUpload";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationFormProps {
  jobTitle: string;
  jobId?: string;
  onBack: () => void;
  onSubmit?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | null;
  currentPosition: string;
  cv: UploadedFile | null;
  coverLetter: string;
  certificates: UploadedFile[];
  recommendations: UploadedFile[];
  references: string;
  question1: string;
  question2: string;
  question3: string;
  consent: boolean;
}

export function ApplicationForm({ jobTitle, jobId, onBack, onSubmit }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitApplication } = useApplications();
  const { uploadFile, isUploading } = useFileUpload();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: null,
    currentPosition: "",
    cv: null,
    coverLetter: "",
    certificates: [],
    recommendations: [],
    references: "",
    question1: "",
    question2: "",
    question3: "",
    consent: false
  });

  // Prefill personal info from public.users and candidate_profiles
  useEffect(() => {
    let isMounted = true;
    const prefill = async () => {
      try {
        if (!user?.id) return;

        const [{ data: dbUser, error: userError }, { data: profile, error: profileError }] = await Promise.all([
          supabase
            .from('users')
            .select('first_name, last_name, email, date_of_birth')
            .eq('id', user.id)
            .maybeSingle(),
          supabase
            .from('candidate_profiles')
            .select('current_position')
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (userError) throw userError;
        if (profileError) throw profileError;

        if (!isMounted) return;

        // Fallbacks depuis les métadonnées d'auth (providers):
        const meta: any = (user as any)?.user_metadata || {};
        // Essayer différentes clés communes
        let metaFirst: string | undefined = meta.first_name || meta.prenom || meta.given_name;
        let metaLast: string | undefined = meta.last_name || meta.nom || meta.family_name;
        if ((!metaFirst || !metaLast) && typeof meta.name === 'string') {
          const parts = meta.name.trim().split(/\s+/);
          if (!metaFirst && parts.length > 0) metaFirst = parts[0];
          if (!metaLast && parts.length > 1) metaLast = parts.slice(1).join(' ');
        }

        setFormData((prev) => ({
          ...prev,
          firstName: prev.firstName || dbUser?.first_name || metaFirst || '',
          lastName: prev.lastName || dbUser?.last_name || metaLast || '',
          email: prev.email || dbUser?.email || user.email || '',
          dateOfBirth: prev.dateOfBirth || (dbUser?.date_of_birth ? new Date(dbUser.date_of_birth) : null),
          currentPosition: prev.currentPosition || profile?.current_position || '',
        }));
      } catch (e: any) {
        console.error('Prefill error:', e);
        // Ne bloque pas l'utilisateur, informe simplement en silencieux
      }
    };

    prefill();
    return () => {
      isMounted = false;
    };
  }, [user, user?.id, user?.email]);

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

  const handleSubmit = async () => {
    if (!jobId) {
      toast.error("ID de l'offre d'emploi manquant");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitApplication({
        job_offer_id: jobId,
        cover_letter: formData.coverLetter,
        motivation: formData.question1,
        ref_contacts: formData.references
      });

      setIsSubmitted(true);
      toast.success("Candidature envoyée avec succès!");
      
      // Appeler onSubmit si fourni après un délai
      setTimeout(() => {
        onSubmit?.();
      }, 2000);
    } catch (error: any) {
      toast.error("Erreur lors de l'envoi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'certificates' | 'recommendations') => {
    const files = e.target.files;
    if (!files) return;

    try {
      if (type === 'cv') {
        const uploadedFile = await uploadFile(files[0], 'cv');
        setFormData({ ...formData, cv: uploadedFile });
        toast.success("CV uploadé avec succès!");
      } else if (type === 'certificates') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'certificates'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, certificates: [...formData.certificates, ...uploadedFiles] });
        toast.success("Certificats uploadés avec succès!");
      } else if (type === 'recommendations') {
        const uploadPromises = Array.from(files).map(file => uploadFile(file, 'recommendations'));
        const uploadedFiles = await Promise.all(uploadPromises);
        setFormData({ ...formData, recommendations: [...formData.recommendations, ...uploadedFiles] });
        toast.success("Recommandations uploadées avec succès!");
      }
    } catch (error: any) {
      toast.error("Erreur lors de l'upload: " + error.message);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto animate-bounce-soft">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Candidature envoyée !</h1>
            <p className="text-muted-foreground">
              Merci, <strong>{formData.firstName}</strong> ! Nous avons bien reçu votre candidature pour le poste de{" "}
              <strong>{jobTitle}</strong> et nous reviendrons vers vous très prochainement.
            </p>
            <div className="space-y-3">
              <Button variant="hero" onClick={onBack} className="w-full">
                Retour aux offres
              </Button>
              <Button variant="outline" className="w-full">
                Postuler à une autre offre
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'offre
          </Button>
          
          <div className="text-center space-y-4">
            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              Plateforme de Recrutement Nouvelle Génération
            </div>
            <h1 className="text-4xl font-bold">Rejoignez l'Excellence</h1>
            <h2 className="text-2xl font-light">{jobTitle}</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Découvrez un processus de candidature révolutionnaire qui valorise vos compétences, 
              votre potentiel et votre ambition.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar with modern design */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step <= currentStep 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                  }`}>
                    {step <= currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`h-1 w-16 mx-2 rounded-full transition-all ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 text-center">
              <span>Infos Personnelles</span>
              <span>Parcours & Documents</span>
              <span>Questionnaire MTP</span>
              <span>Finalisation</span>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content with modern layout */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left side - Progress info */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Étape {currentStep}/4 complétée
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Évaluation 360°</h3>
                    <p className="text-sm text-gray-600">Analyse complète des compétences</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Compétences Techniques</span>
                          <span className="font-medium">85%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Leadership</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '78%'}}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Adaptabilité</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    {currentStep === 1 && <><User className="w-6 h-6" /> Informations Personnelles</>}
                    {currentStep === 2 && <><FileText className="w-6 h-6" /> Parcours & Documents</>}
                    {currentStep === 3 && <><CheckCircle className="w-6 h-6" /> Questionnaire MTP</>}
                    {currentStep === 4 && <><Send className="w-6 h-6" /> Finalisation</>}
                  </CardTitle>
                </CardHeader>

            <CardContent className="space-y-6">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre.email@exemple.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.dateOfBirth && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dateOfBirth ? (
                            format(formData.dateOfBirth, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateOfBirth || undefined}
                          onSelect={(date) => setFormData({ ...formData, dateOfBirth: date || null })}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="currentPosition">Poste actuel *</Label>
                    <Input
                      id="currentPosition"
                      value={formData.currentPosition}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="Votre poste actuel"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Experience & Documents */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <Label htmlFor="cv">Votre CV *</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                        {isUploading ? (
                          <div className="space-y-2">
                            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                            <p className="text-sm text-muted-foreground">Upload en cours...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                              {formData.cv ? formData.cv.name : "Glissez votre CV ici ou cliquez pour parcourir"}
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, 'cv')}
                          className="hidden"
                          id="cv-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('cv-upload')?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Upload..." : "Choisir un fichier"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="coverLetter">Lettre de motivation *</Label>
                    <Textarea
                      id="coverLetter"
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      placeholder="Expliquez votre motivation pour ce poste..."
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="certificates">Certificat(s) (facultatif)</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {formData.certificates.length > 0 ? `${formData.certificates.length} fichier(s) sélectionné(s)` : "Ajouter des certificats"}
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'certificates')}
                          className="hidden"
                          id="certificates-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('certificates-upload')?.click()}
                        >
                          Choisir des fichiers
                        </Button>
                      </div>
                      {formData.certificates.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.certificates.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                              <span>{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newCertificates = formData.certificates.filter((_, i) => i !== index);
                                  setFormData({ ...formData, certificates: newCertificates });
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recommendations">Lettre(s) de recommandation (facultatif)</Label>
                    <div className="mt-2">
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {formData.recommendations.length > 0 ? `${formData.recommendations.length} fichier(s) sélectionné(s)` : "Ajouter des lettres de recommandation"}
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'recommendations')}
                          className="hidden"
                          id="recommendations-upload"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('recommendations-upload')?.click()}
                        >
                          Choisir des fichiers
                        </Button>
                      </div>
                      {formData.recommendations.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.recommendations.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                              <span>{file.name}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newRecommendations = formData.recommendations.filter((_, i) => i !== index);
                                  setFormData({ ...formData, recommendations: newRecommendations });
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="references">Références de recommandation (facultatif)</Label>
                    <Textarea
                      id="references"
                      value={formData.references}
                      onChange={(e) => setFormData({ ...formData, references: e.target.value })}
                      placeholder="Nom, poste, entreprise, téléphone/email de vos références..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Questionnaire MTP */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2">Questionnaire : Métier, Talent et Paradigme</h3>
                    <p className="text-muted-foreground">Quelques questions pour mieux comprendre vos aspirations et votre vision.</p>
                  </div>

                  <div>
                    <Label htmlFor="question1">Question 1 : Décrivez ce qui vous passionne le plus dans votre métier</Label>
                    <Textarea
                      id="question1"
                      value={formData.question1}
                      onChange={(e) => setFormData({ ...formData, question1: e.target.value })}
                      placeholder="Partagez votre passion..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question2">Question 2 : Quel est le talent unique que vous apporteriez à la SEEG ?</Label>
                    <Textarea
                      id="question2"
                      value={formData.question2}
                      onChange={(e) => setFormData({ ...formData, question2: e.target.value })}
                      placeholder="Décrivez votre talent unique..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question3">Question 3 : Partagez un exemple où vous avez changé de paradigme pour résoudre un problème complexe</Label>
                    <Textarea
                      id="question3"
                      value={formData.question3}
                      onChange={(e) => setFormData({ ...formData, question3: e.target.value })}
                      placeholder="Racontez votre exemple..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <h4 className="text-xl font-semibold text-center mb-6">Récapitulatif de votre candidature</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Informations Personnelles</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>Modifier</Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Nom complet:</span>
                          <p>{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <p>{formData.email}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Date de naissance:</span>
                          <p>{formData.dateOfBirth ? format(formData.dateOfBirth, "PPP", { locale: fr }) : "Non renseigné"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Poste actuel:</span>
                          <p>{formData.currentPosition || "Non renseigné"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Parcours & Documents</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>Modifier</Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">CV:</span>
                          <p>{formData.cv?.name || "Non fourni"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lettre de motivation:</span>
                          <p>{formData.coverLetter ? "Fournie" : "Non fournie"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Certificats:</span>
                          <p>{formData.certificates.length} fichier(s)</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lettres de recommandation:</span>
                          <p>{formData.recommendations.length} fichier(s)</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Questionnaire MTP</h5>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStep(3)}>Modifier</Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Question 1:</span>
                          <p>{formData.question1 ? "Répondue" : "Non répondue"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Question 2:</span>
                          <p>{formData.question2 ? "Répondue" : "Non répondue"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Question 3:</span>
                          <p>{formData.question3 ? "Répondue" : "Non répondue"}</p>
                        </div>
                      </div>
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
                      conformément à la politique de confidentialité de OneHCM.
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
                    variant="hero"
                    onClick={handleNext}
                    disabled={
                      (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.dateOfBirth || !formData.currentPosition)) ||
                      (currentStep === 2 && (!formData.cv || !formData.coverLetter)) ||
                      (currentStep === 3 && (!formData.question1 || !formData.question2 || !formData.question3))
                    }
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={!formData.consent}
                  >
                    Envoyer ma candidature
                    <Send className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}