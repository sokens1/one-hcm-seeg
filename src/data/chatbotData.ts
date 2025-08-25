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
    keywords: ["postuler", "candidature", "comment", "procédure", "application"],
    response: "Pour postuler à une offre d'emploi : \n1. Créez votre compte candidat\n2. Consultez les offres disponibles\n3. Cliquez sur 'Postuler' pour l'offre qui vous intéresse\n4. Remplissez le formulaire de candidature\n5. Téléchargez vos documents (CV, lettres de motivation, etc.)\n6. Validez votre candidature"
  },
  {
    id: "2",
    question: "Quels documents dois-je fournir ?",
    keywords: ["documents", "cv", "lettre", "motivation", "pièces", "fichiers"],
    response: "Les documents requis pour votre candidature :\n• CV à jour\n• Lettre de motivation\n• Copies des diplômes\n• Attestations de travail\n• Pièce d'identité\n• Photo d'identité récente\n\nAssurez-vous que tous vos documents sont au format PDF et lisibles."
  },
  {
    id: "3",
    question: "Comment suivre ma candidature ?",
    keywords: ["suivre", "candidature", "statut", "suivi", "état", "évolution"],
    response: "Pour suivre votre candidature :\n1. Connectez-vous à votre espace candidat\n2. Allez dans 'Mes candidatures'\n3. Vous verrez le statut de chaque candidature :\n   - En attente d'examen\n   - En cours d'évaluation\n   - Retenue pour entretien\n   - Validée ou Rejetée\n\nVous recevrez également des notifications par email."
  },
  {
    id: "4",
    question: "Combien de temps pour une réponse ?",
    keywords: ["délai", "réponse", "temps", "attente", "combien", "durée"],
    response: "Les délais de traitement des candidatures :\n• Accusé de réception : immédiat\n• Premier examen : 5 à 10 jours ouvrés\n• Évaluation complète : 2 à 3 semaines\n• Convocation entretien : selon planning\n• Décision finale : dans les 15 jours après entretien\n\nNous vous tiendrons informé à chaque étape."
  },
  {
    id: "5",
    question: "Puis-je modifier ma candidature ?",
    keywords: ["modifier", "changer", "éditer", "correction", "mettre à jour"],
    response: "Oui, vous pouvez modifier votre candidature :\n• Tant qu'elle n'a pas été examinée par nos équipes\n• Allez dans 'Mes candidatures'\n• Cliquez sur 'Modifier' si disponible\n• Mettez à jour vos informations ou documents\n• Revalidez votre candidature\n\nAprès examen, les modifications ne sont plus possibles."
  },
  {
    id: "6",
    question: "Quels sont les critères de sélection ?",
    keywords: ["critères", "sélection", "qualifications", "compétences", "profil"],
    response: "Nos critères de sélection :\n• Adéquation avec le profil recherché\n• Expérience professionnelle pertinente\n• Compétences techniques requises\n• Compétences comportementales\n• Motivation et projet professionnel\n• Capacité d'intégration à l'équipe SEEG\n\nChaque poste a ses spécificités détaillées dans l'offre."
  },
  {
    id: "7",
    question: "Contact et support",
    keywords: ["contact", "aide", "support", "téléphone", "email", "assistance"],
    response: "Pour nous contacter :\n📧 Email : recrutement@seeg.ga\n📞 Téléphone : +241 01 XX XX XX\n🏢 Adresse : Siège SEEG, Libreville, Gabon\n\n⏰ Horaires d'ouverture :\nLundi - Vendredi : 8h - 17h\n\nNotre équipe RH est à votre disposition pour toute question sur le processus de recrutement."
  },
  {
    id: "8",
    question: "Informations sur SEEG",
    keywords: ["seeg", "entreprise", "société", "présentation", "activité", "secteur"],
    response: "À propos de SEEG :\n🏢 Société d'Énergie et d'Eau du Gabon\n⚡ Secteurs : Production et distribution d'électricité et d'eau\n🌍 Couverture : Tout le territoire gabonais\n👥 Collaborateurs : Plus de 1000 employés\n🎯 Mission : Fournir des services essentiels de qualité\n\nNous recrutons des talents pour notre vision 2025-2035."
  },
  {
    id: "9",
    question: "Processus d'entretien",
    keywords: ["entretien", "interview", "processus", "évaluation", "rencontre"],
    response: "Le processus d'entretien se déroule en plusieurs étapes :\n1️⃣ Entretien RH (30-45 min)\n2️⃣ Entretien technique avec le manager (45-60 min)\n3️⃣ Entretien final avec la direction (30 min)\n\n📍 Lieu : Siège SEEG ou visioconférence\n📅 Planning : Vous serez contacté par téléphone/email\n📝 Préparation : Relisez votre CV et l'offre d'emploi"
  },
  {
    id: "10",
    question: "Avantages et rémunération",
    keywords: ["salaire", "rémunération", "avantages", "benefits", "package"],
    response: "Notre package d'avantages :\n💰 Rémunération attractive selon profil\n🏥 Couverture santé complète\n🚗 Véhicule de fonction (selon poste)\n🏡 Aide au logement\n📚 Formation continue\n🌴 Congés payés généreux\n🎯 Primes de performance\n\nDétails précis discutés lors de l'entretien final."
  },
  {
    id: "11",
    question: "Comment utiliser mon espace candidat ?",
    keywords: ["espace", "candidat", "dashboard", "tableau", "bord", "navigation", "utiliser"],
    response: "Votre espace candidat vous permet de :\n📊 Tableau de bord : Vue d'ensemble de vos candidatures\n💼 Catalogue d'offres : Consulter et postuler aux offres\n📄 Mes candidatures : Suivre l'état de vos candidatures\n⚙️ Paramètres : Modifier vos informations personnelles\n\nUtilisez le menu latéral pour naviguer entre les sections."
  },
  {
    id: "12",
    question: "Problème technique sur la plateforme",
    keywords: ["bug", "erreur", "problème", "technique", "connexion", "chargement", "marche pas"],
    response: "En cas de problème technique :\n1. Actualisez la page (F5)\n2. Videz le cache de votre navigateur\n3. Essayez avec un autre navigateur\n4. Vérifiez votre connexion internet\n\nSi le problème persiste :\n📧 support.technique@seeg.ga\n📞 +241 01 XX XX XX\n\nNotre équipe technique vous répondra rapidement."
  },
  {
    id: "13",
    question: "Puis-je postuler à plusieurs offres ?",
    keywords: ["plusieurs", "offres", "multiple", "candidatures", "postuler", "combien"],
    response: "Oui, vous pouvez postuler à plusieurs offres !\n✅ Aucune limite sur le nombre de candidatures\n✅ Chaque candidature est traitée indépendamment\n✅ Adaptez votre lettre de motivation à chaque poste\n\n💡 Conseils :\n• Priorisez les offres qui correspondent le mieux à votre profil\n• Personnalisez chaque candidature\n• Suivez l'état de chaque candidature dans votre espace"
  },
  {
    id: "14",
    question: "Formation et développement professionnel",
    keywords: ["formation", "développement", "compétences", "apprentissage", "évolution", "carrière"],
    response: "SEEG investit dans le développement de ses collaborateurs :\n📚 Plan de formation annuel personnalisé\n🎓 Formations techniques et managériales\n🌍 Possibilités de formation à l'étranger\n📈 Programme de développement de carrière\n🤝 Mentorat et coaching\n💼 Mobilité interne encouragée\n\nNous accompagnons votre évolution professionnelle sur le long terme."
  }
];

export const defaultMessages = [
  "Bonjour ! Je suis l'assistant virtuel de SEEG. Comment puis-je vous aider aujourd'hui ?",
  "Je peux répondre à vos questions sur :",
  "• Le processus de candidature",
  "• Les documents requis", 
  "• Le suivi de vos candidatures",
  "• Les informations sur SEEG",
  "• Et bien plus encore !"
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
  return "Je ne suis pas sûr de comprendre votre question. Voici quelques sujets sur lesquels je peux vous aider :\n\n• Comment postuler à une offre ?\n• Quels documents fournir ?\n• Comment suivre ma candidature ?\n• Informations sur SEEG\n• Processus d'entretien\n• Contact et support\n\nN'hésitez pas à reformuler votre question !";
};