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
  },
  {
    id: "err1",
    question: "Erreur affichant un code script",
    keywords: ["script", "code", "erreur", "stack", "trace", "bundling", "maintenance"],
    response: "Ce type d'erreur apparaît généralement lors d'une mise à jour ou d'un incident de chargement.\n• Vérifiez si une maintenance est en cours\n• Actualisez la page (Ctrl/Cmd+R) ou videz le cache (Ctrl+F5)\n• Réessayez après 1 à 2 minutes\nSi le problème persiste, contactez le support avec une capture d'écran."
  },
  {
    id: "err2",
    question: "Les boutons ne réagissent pas (login, register)",
    keywords: ["bouton", "clique", "click", "login", "register", "connexion", "inscription", "bloqué"],
    response: "Essayez ces étapes :\n• Actualisez la page\n• Assurez-vous que tous les champs obligatoires sont valides\n• Attendez la fin d'une action en cours (icône de chargement)\n• Essayez un autre navigateur (Chrome/Edge/Firefox)\n• Vérifiez qu'aucune maintenance n'est en cours"
  },
  {
    id: "err3",
    question: "Maintenance",
    keywords: ["maintenance", "indisponible", "maj", "mise à jour", "downtime"],
    response: "MISE À JOUR : une indisponibilité du site peut être prévue entre 00h00 et 00h40 lors des fenêtres de maintenance planifiées.\nDurant ce créneau, certaines pages peuvent être inaccessibles ou lentes. Réessayez après la fenêtre indiquée."
  },
  {
    id: "err4",
    question: "Puis-je candidater à plusieurs postes ?",
    keywords: ["plusieurs", "multi", "postes", "offres", "candidater"],
    response: "Oui, vous pouvez postuler à plusieurs offres.\n1) Ouvrez le catalogue des offres\n2) Cliquez sur 'Postuler' pour chaque offre\n3) Suivez l'état de chaque dossier dans 'Mes candidatures'"
  },
  {
    id: "err5",
    question: "La page des offres charge longtemps",
    keywords: ["offres", "chargement", "lent", "long", "catalogue"],
    response: "Si la page charge longtemps :\n• Patientez 1 à 2 minutes (surtout après une mise à jour)\n• Actualisez la page\n• Essayez une autre connexion (réseau d'entreprise / 4G)\n• Si cela persiste, contactez le support"
  },
  {
    id: "err6",
    question: "Comment retrouver mes informations",
    keywords: ["retrouver", "informations", "mes infos", "profil", "données"],
    response: "Rendez-vous dans votre Espace Candidat → Mon Profil / Paramètres.\nVous pouvez consulter et mettre à jour : informations personnelles, coordonnées, adresse, et documents déposés.\nAstuce : suivez la progression de complétion de profil et téléchargez vos dossiers depuis 'Mes candidatures' si disponible."
  },
  {
    id: "err7",
    question: "J'ai oublié mon mot de passe",
    keywords: ["mot de passe", "oublié", "reset", "réinitialiser", "email"],
    response: "Sur l'écran de connexion, cliquez sur 'Mot de passe oublié', saisissez votre email.\nVous recevrez un lien de réinitialisation (page /reset-password).\nVérifiez vos spams. En cas d'erreur 'email introuvable', vérifiez l'adresse. Attendez ~60s entre deux demandes."
  },
  {
    id: "err8",
    question: "Je ne vois pas mes notifications",
    keywords: ["notifications", "alerte", "cloche", "non lu", "messages"],
    response: "Dans l'espace candidat, ouvrez la cloche de notifications en haut.\n• Actualisez la page et vérifiez que vous êtes connecté au bon compte\n• Si aucune notification n'apparaît, il se peut qu'il n'y ait pas de nouveauté sur vos dossiers\n• Vérifiez votre messagerie pour les emails\nSi le souci persiste, contactez le support"
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