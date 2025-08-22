// Dynamic Métier questions mapping per job offer title
// Fill this map with the 12 job offers -> 7 questions each (exact titles)
// Keys should be the job offer titles as displayed to candidates.
// If a title is not found, `defaultMetierQuestions` will be used.

export const defaultMetierQuestions: string[] = [
  "1. Quelles sont vos principales compétences techniques dans ce domaine ?",
  "2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?",
  "3. Quels défis techniques de ce métier vous motivent le plus ?",
  "4. Décrivez un projet significatif lié à ce métier et votre rôle précis.",
  "5. Comment garantissez-vous la qualité, la sécurité et la conformité dans vos missions ?",
  "6. Quelles méthodes ou outils utilisez-vous pour optimiser vos performances dans ce métier ?",
  "7. Quels indicateurs de réussite (KPIs) suivriez-vous dans ce poste et pourquoi ?",
];

// Helper to normalize titles for safer lookups
const normalize = (s: string) => s
  .toLowerCase()
  .normalize("NFD").replace(/\p{Diacritic}/gu, "") // strip accents
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

// Map by normalized title for resilient matching
const metierQuestionsByOfferNormalized: Record<string, string[]> = {
  [normalize("Directeur de l'Audit & Contrôle Interne")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'audit interne à la SEEG ?",
    "Décrivez ce que vous savez des règles pour auditer une entreprise publique, en lien avec des partenariats comme SUEZ ou EDF.",
    "Racontez une expérience où vous avez audité un projet d'investissement pour les réseaux, en vérifiant le respect du budget.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'audit ou la gestion des risques.",
    "Donnez un exemple où vous avez audité des projets d'énergie verte, comme l'intégration du solaire.",
    "Comment garantissez-vous que l'entreprise respecte les lois grâce à des audits réguliers, en réduisant les risques de coupures ?"
  ],
  
  [normalize("Directeur Qualité Hygiène Sécurité & Environnement (QHSE)")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant QHSE à la SEEG ?",
    "Expliquez ce que vous savez des normes de qualité et sécurité pour une entreprise publique, en lien avec des partenariats comme SUEZ.",
    "Racontez une expérience où vous avez géré un projet d'investissement avec un focus sur la qualité et la sécurité, en respectant le budget.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la qualité, la sécurité ou l'environnement.",
    "Partagez un exemple où vous avez contribué à des projets d'énergie verte, comme le solaire, avec un impact environnemental positif.",
    "Comment vous assurez-vous que les opérations respectent les normes de sécurité et environnementales, avec des audits réguliers ?"
  ],
  
  [normalize("Directeur Juridique, Communication & RSE")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant juridique et communication à la SEEG ?",
    "Décrivez ce que vous savez des règles juridiques pour une entreprise publique, avec un focus sur la responsabilité sociale (RSE) et des partenariats comme EDF.",
    "Racontez une expérience où vous avez géré juridiquement un projet d'investissement, en assurant le respect des contrats.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec le juridique, la communication ou la RSE.",
    "Donnez un exemple où vous avez promu la RSE dans des projets d'énergie verte, comme le solaire.",
    "Comment garantissez-vous que l'entreprise respecte les lois et gère les risques juridiques liés à la RSE ou aux coupures ?"
  ],
  
  [normalize("Directeur des Systèmes d'Informations")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant des systèmes d'information à la SEEG ?",
    "Expliquez ce que vous savez des normes informatiques pour une entreprise publique, en lien avec des partenariats techniques.",
    "Racontez une expérience où vous avez géré un projet informatique pour améliorer les réseaux, avec un budget défini.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec les systèmes d'information ou la gestion de réseaux.",
    "Partagez un exemple où vous avez travaillé sur des projets d'énergie verte, comme des compteurs connectés.",
    "Comment vous assurez-vous que les systèmes informatiques respectent les lois, notamment en cybersécurité ?"
  ],
  
  [normalize("Chef de Département Électricité")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département électricité à la SEEG ?",
    "Décrivez ce que vous savez des normes pour gérer une concession électrique, en lien avec des partenariats comme EDF.",
    "Racontez une expérience où vous avez dirigé un projet d'investissement pour les réseaux électriques, en respectant le budget.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des réseaux électriques.",
    "Donnez un exemple où vous avez contribué à des projets d'énergie verte, comme le solaire, dans votre département.",
    "Comment garantissez-vous que les opérations électriques respectent les normes de sécurité, avec des audits réguliers ?"
  ],
  
  [normalize("Directeur Exploitation Électricité")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'exploitation électricité à la SEEG ?",
    "Expliquez ce que vous savez des normes d'exploitation pour une concession électrique.",
    "Racontez une expérience où vous avez géré un projet d'investissement pour l'exploitation électrique.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'exploitation des réseaux électriques.",
    "Partagez un exemple où vous avez soutenu des projets d'énergie verte dans l'exploitation.",
    "Comment vous assurez-vous que l'exploitation électrique respecte les normes de sécurité ?"
  ],
  
  [normalize("Directeur Technique Électricité")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant technique électricité à la SEEG ?",
    "Décrivez ce que vous savez des normes techniques pour une concession électrique.",
    "Racontez une expérience où vous avez dirigé un projet technique d'investissement pour les réseaux électriques.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la technique des réseaux électriques.",
    "Donnez un exemple où vous avez contribué à des projets techniques d'énergie verte.",
    "Comment garantissez-vous que les aspects techniques respectent les normes de sécurité ?"
  ],
  
  [normalize("Chef de Département Eau")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département eau à la SEEG ?",
    "Expliquez ce que vous savez des normes pour gérer une concession d'eau, en lien avec des partenariats comme SUEZ.",
    "Racontez une expérience où vous avez dirigé un projet d'investissement pour les réseaux d'eau.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des réseaux d'eau.",
    "Partagez un exemple où vous avez soutenu des projets pour une gestion durable de l'eau.",
    "Comment vous assurez-vous que les opérations d'eau respectent les normes de sécurité ?"
  ],
  
  [normalize("Directeur Exploitation Eau")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'exploitation eau à la SEEG ?",
    "Décrivez ce que vous savez des normes d'exploitation pour une concession d'eau.",
    "Racontez une expérience où vous avez géré un projet d'investissement pour l'exploitation de l'eau.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'exploitation des réseaux d'eau.",
    "Donnez un exemple où vous avez soutenu des projets pour une gestion durable de l'eau.",
    "Comment garantissez-vous que l'exploitation de l'eau respecte les normes de sécurité ?"
  ],
  
  [normalize("Directeur Technique Eau")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant technique eau à la SEEG ?",
    "Expliquez ce que vous savez des normes techniques pour une concession d'eau.",
    "Racontez une expérience où vous avez dirigé un projet technique d'investissement pour les réseaux d'eau.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la technique des réseaux d'eau.",
    "Partagez un exemple où vous avez contribué à des projets techniques pour une gestion durable.",
    "Comment vous assurez-vous que les aspects techniques respectent les normes de sécurité ?"
  ],
  
  [normalize("Chef de Département Support")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département support à la SEEG ?",
    "Décrivez ce que vous savez des normes pour le support dans une entreprise publique.",
    "Racontez une expérience où vous avez dirigé un projet de support pour des investissements.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec le support aux infrastructures.",
    "Donnez un exemple où vous avez soutenu des projets liés à l'énergie verte.",
    "Comment garantissez-vous que les opérations de support respectent les normes de sécurité ?"
  ],
  
  [normalize("Directeur du Capital Humain")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant du capital humain à la SEEG ?",
    "Expliquez ce que vous savez des normes RH pour une entreprise publique.",
    "Racontez une expérience où vous avez géré un projet RH pour développer les équipes.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des équipes.",
    "Partagez un exemple où vous avez soutenu des projets RH liés à l'énergie verte.",
    "Comment vous assurez-vous que les pratiques RH respectent les normes de sécurité ?"
  ],
  
  [normalize("Directeur Commerciale & Recouvrement")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant commercial et recouvrement à la SEEG ?",
    "Décrivez ce que vous savez des normes commerciales pour une entreprise publique.",
    "Racontez une expérience où vous avez dirigé un projet commercial pour des investissements.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des paiements ou le commerce.",
    "Donnez un exemple où vous avez soutenu des projets commerciaux liés à l'énergie verte.",
    "Comment garantissez-vous que les opérations commerciales respectent les normes de sécurité ?"
  ],
  
  [normalize("Directeur Finances et Comptabilité")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant financier à la SEEG ?",
    "Expliquez ce que vous savez des normes financières pour une entreprise publique.",
    "Racontez une expérience où vous avez géré un projet financier pour des investissements.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion financière.",
    "Partagez un exemple où vous avez soutenu des projets financiers liés à l'énergie verte.",
    "Comment vous assurez-vous que les finances respectent les normes grâce à des audits ?"
  ],
  
  [normalize("Directeur des Moyens Généraux")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant des moyens généraux à la SEEG ?",
    "Décrivez ce que vous savez des normes pour les moyens généraux dans une entreprise publique.",
    "Racontez une expérience où vous avez dirigé un projet de moyens généraux.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la logistique ou le support.",
    "Donnez un exemple où vous avez soutenu des projets liés à l'énergie verte.",
    "Comment garantissez-vous que les moyens généraux respectent les normes de sécurité ?"
  ],
  
  [normalize("Coordination Régions")]: [
    "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
    "Quels sont les trois principaux challenges que vous comptez relever en tant que coordinateur régional à la SEEG ?",
    "Expliquez ce que vous savez des normes pour coordonner les régions dans une entreprise publique.",
    "Racontez une expérience où vous avez coordonné un projet régional d'investissement.",
    "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la coordination régionale.",
    "Partagez un exemple où vous avez soutenu des projets régionaux d'énergie verte.",
    "Comment vous assurez-vous que les opérations régionales respectent les normes de sécurité ?"
  ]
};

export function getMetierQuestionsForTitle(jobTitle?: string): string[] {
  if (!jobTitle) return defaultMetierQuestions;
  const key = normalize(jobTitle);
  console.log('[MetierQuestions] Job title:', jobTitle);
  console.log('[MetierQuestions] Normalized key:', key);
  console.log('[MetierQuestions] Available keys:', Object.keys(metierQuestionsByOfferNormalized));
  console.log('[MetierQuestions] Looking for exact match:', key);
  Object.keys(metierQuestionsByOfferNormalized).forEach(availableKey => {
    console.log('[MetierQuestions] Available key:', availableKey, '- Match:', availableKey === key);
  });
  const questions = metierQuestionsByOfferNormalized[key] ?? defaultMetierQuestions;
  console.log('[MetierQuestions] Found specific questions:', questions !== defaultMetierQuestions);
  return questions;
}
