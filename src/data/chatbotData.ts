export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface PredefinedQuestion {
  id: string;
  question: string;
  keywords: string[];
  response: string;
}

export const predefinedQuestions: PredefinedQuestion[] = [
  {
    id: "1",
    question: "Comment postuler à une offre ?",
    keywords: ["postuler", "candidature", "procédure", "soumettre", "dossier"],
    response: "Pour postuler interne :\n1. Connectez-vous à votre espace\n2. Ouvrez le catalogue des offres\n3. Cliquez sur 'Postuler' sur l'offre choisie\n4. Complétez le formulaire et joignez vos documents\n5. Validez l'envoi."
  },
  {
    id: "2",
    question: "Quels documents dois-je fournir ?",
    keywords: ["documents", "cv", "lettre", "diplômes", "pièces"],
    response: "Documents généralement requis :\n• CV à jour\n• Lettre de motivation\n• Copies de diplômes et attestations\n• Pièce d'identité\n\nConseil : utilisez des PDF lisibles et à jour."
  },
  {
    id: "3",
    question: "Comment suivre ma candidature ?",
    keywords: ["suivre", "statut", "mes candidatures", "état"],
    response: "Suivi :\n1. Allez dans 'Mes candidatures'\n2. Consultez le statut mis à jour par les RH\n3. Vous serez notifié en cas d'évolution importante."
  },
  {
    id: "4",
    question: "Puis-je modifier ma candidature ?",
    keywords: ["modifier", "changement", "mise à jour"],
    response: "La modification d'une candidature n'est pas possible après soumission.\nVérifiez bien les informations et documents avant de valider."
  },
  {
    id: "5",
    question: "Processus d'entretien",
    keywords: ["entretien", "processus", "évaluation", "rencontre"],
    response: "Le processus d'entretien comprend plusieurs échanges (RH, technique, décision).\nAucune durée fixe n'est prédéfinie; les modalités sont communiquées par les RH."
  },
  {
    id: "6",
    question: "Mobilité interne et éligibilité",
    keywords: ["mobilité", "interne", "éligibilité", "critères", "conditions"],
    response: "La mobilité interne est encouragée selon les besoins et critères en vigueur.\nRéférez-vous à la politique interne ou contactez les RH pour précisions."
  },
  {
    id: "7",
    question: "Contact et support",
    keywords: ["contact", "support", "téléphone", "email", "assistance"],
    response: "Support plateforme :\n📧 Email : support@seeg-talentsource.com\n📞 Téléphone : +241 076402886"
  },
  {
    id: "8",
    question: "Problème technique",
    keywords: ["bug", "erreur", "technique", "connexion", "chargement"],
    response: "Dépannage rapide :\n1. Actualisez la page (F5)\n2. Essayez un autre navigateur\n\nSi le problème persiste :\n📧 support@seeg-talentsource.com\n📞 +241 076402886"
  }
];

export const defaultMessages = [
  "Bonjour ! Assistant SEEG (interne) à votre service.",
  "Je peux vous aider sur :",
  "• Postuler à une offre",
  "• Documents requis",
  "• Suivi de candidature",
  "• Processus d'entretien",
  "• Support: support@seeg-talentsource.com / +241 076402886"
];

export const findBestResponse = (userMessage: string): string => {
  const normalizedMessage = userMessage.toLowerCase();
  
  // Recherche d'une correspondance exacte ou partielle
  for (const predefined of predefinedQuestions) {
    const hasKeyword = predefined.keywords.some(keyword => 
      normalizedMessage.includes(keyword.toLowerCase())
    );
    
    if (hasKeyword) {
      return predefined.response;
    }
  }
  
  // Réponse par défaut si aucune correspondance
  return "Je ne suis pas sûr de comprendre votre question. Voici quelques sujets sur lesquels je peux vous aider :\n\n• Comment postuler à une offre ?\n• Quels documents fournir ?\n• Comment suivre ma candidature ?\n• Informations sur SEEG\n• Processus d'entretien\n• Contact et support";
};