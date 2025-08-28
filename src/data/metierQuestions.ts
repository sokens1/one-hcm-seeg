// Dynamic Métier questions mapping per job offer title
// Fill this map with the 12 job offers -> 7 questions each (exact titles)
// Keys should be the job offer titles as displayed to candidates.
// If a title is not found, `defaultMetierQuestions` will be used.

export interface MTPQuestions {
  metier: string[];
  talent: string[];
  paradigme: string[];
}

export const defaultMTPQuestions: MTPQuestions = {
  metier: [
    "1. Quelles sont vos principales compétences techniques dans ce domaine ?",
    "2. Comment votre expérience professionnelle vous prépare-t-elle à ce poste ?",
    "3. Quels défis techniques de ce métier vous motivent le plus ?",
    "4. Décrivez un projet significatif lié à ce métier et votre rôle précis.",
    "5. Comment garantissez-vous la qualité, la sécurité et la conformité dans vos missions ?",
    "6. Quelles méthodes ou outils utilisez-vous pour optimiser vos performances dans ce métier ?",
    "7. Quels indicateurs de réussite (KPIs) suivriez-vous dans ce poste et pourquoi ?",
  ],
  talent: [
    "1. Quelle est votre plus grande force en tant que professionnel ?",
    "2. Décrivez une situation où vous avez dû apprendre une nouvelle compétence rapidement.",
    "3. Comment gérez-vous la pression et les délais serrés ?",
  ],
  paradigme: [
    "1. Qu'est-ce qui vous motive le plus dans votre carrière ?",
    "2. Comment vous tenez-vous au courant des évolutions de votre secteur ?",
    "3. Quelle est votre vision du travail en équipe ?",
  ],
};

// Helper to normalize titles for safer lookups
const normalize = (s: string) => s
  .toLowerCase()
  .normalize("NFD").replace(/\p{Diacritic}/gu, "") // strip accents
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

// Map by normalized title for resilient matching
const mtpQuestionsByOfferNormalized: Record<string, MTPQuestions> = {
    [normalize("Directeur Audit & Contrôle interne")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'Audit et du Contrôle interne à la SEEG ?",
        "Décrivez ce que vous savez des règles et bonnes pratiques requises pour auditer efficacement une entreprise publique telle que la SEEG.",
        "Racontez une expérience où vous avez audité un projet d'investissement.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'audit ou la gestion des risques.",
        "Donnez un exemple pratique pouvant illustrer la meilleure façon de performer l'Audit et le Contrôle interne dans une entreprise comme la SEEG.",
        "Comment garantirez-vous que l'entreprise respecte les lois et les réglementations visant la réduction des risques d'interruption de services ?"
    ],
    talent: [
        "Comment transformeriez-vous la fonction audit en un outil stratégique de gouvernance et de transparence à la SEEG ?",
        "Donnez un exemple où vous avez mis en place un contrôle qui a réduit significativement les risques opérationnels.",
        "Comment garantiriez-vous la confiance des parties prenantes par une meilleure redevabilité ?"
    ],
    paradigme: [
        "Quelle place accordez-vous à la transparence et à l'éthique dans la performance d'une entreprise publique ?",
        "Comment conciliez-vous rigueur de contrôle et soutien à l'innovation ?",
        "Quel est le rôle d'un audit dans la confiance entre l'entreprise, l'État et les citoyens ?"
    ]
  },
  
    [normalize("Directeur Qualité, Hygiène, Sécurité & Environnement")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant QHSE à la SEEG ?",
        "Expliquez ce que vous savez des normes de qualité et sécurité requises pour assurer l'excellence des processus métier et support au sein d'une entreprise publique telle que la SEEG.",
        "Racontez une expérience où vous avez géré un projet d'investissement avec un focus sur la Qualité, l'Hygiène, la Sécurité et l'Environnement.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la qualité, la sécurité ou l'environnement.",
        "Donnez un exemple pratique pouvant illustrer la meilleure façon d'assurer la Qualité, l'Hygiène, la Sécurité et le respect de l'Environnement dans une entreprise comme la SEEG, en montrant comment vos actions ont contribué à réduire les risques, améliorer la conformité et renforcer la performance durable.",
        "Comment garantirez-vous que la SEEG respecte les normes légales et réglementaires en matière de qualité, d'hygiène, de sécurité et d'environnement afin de réduire les risques d'incidents et d'assurer la continuité des services ?"
    ],
    talent: [
        "Comment établiriez-vous une culture QHSE alignée avec la transition énergétique et la fiabilité du service ?",
        "Citez une initiative concrète que vous mèneriez pour réduire durablement les incidents de service.",
        "Comment assureriez-vous la conformité aux normes internationales tout en tenant compte du contexte local ?"
    ],
    paradigme: [
        "Quelle importance accordez-vous à la sécurité des usagers par rapport aux contraintes économiques ?",
        "Comment définiriez-vous la responsabilité de l'entreprise vis-à-vis de l'environnement ?",
        "Jusqu'où seriez-vous prêt à aller pour instaurer une culture sécurité dans une organisation résistante au changement ?"
    ]
  },
  
    [normalize("Directeur Juridique, Communication & RSE")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant juridique et communication à la SEEG ?",
        "Décrivez ce que vous savez des règles juridiques et des bonnes pratiques de communication pour une entreprise publique comme la SEEG, avec un focus sur la responsabilité sociale (RSE).",
        "Racontez une expérience où vous avez géré juridiquement un projet d'investissement, en assurant le respect des contrats ainsi que les aspects de communications associés.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec le juridique, la communication ou la RSE.",
        "Donnez un exemple concret illustrant la meilleure façon d'assurer la sécurité juridique, la communication institutionnelle et la responsabilité sociétale dans une entreprise comme la SEEG.",
        "Comment garantirez-vous que la SEEG respecte ses obligations légales et réglementaires tout en assurant une communication claire et en intégrant la responsabilité sociétale pour limiter les risques de litiges et préserver la réputation de l'entreprise ?"
    ],
    talent: [
        "Comment transformeriez-vous la communication juridique et institutionnelle en levier de confiance publique ?",
        "Quelle stratégie adopteriez-vous pour intégrer la RSE au cœur de la gouvernance de la SEEG ?",
        "Comment sécuriseriez-vous les relations avec l'État et les partenaires tout en protégeant l'image de l'entreprise ?"
    ],
    paradigme: [
        "Pour vous, qu'est-ce qu'une gouvernance responsable dans une entreprise publique ?",
        "Comment équilibrez-vous la protection juridique, la transparence et la réputation institutionnelle ?",
        "Quelle est votre conception d'une communication éthique et citoyenne ?"
    ]
  },
  
    [normalize("Directeur des Systèmes d'Information")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant des systèmes d'information à la SEEG ?",
        "Expliquez ce que vous savez des normes informatiques et bonnes pratiques requises pour développer et garantir la maîtrise de l'architecture d'entreprise (EA) dans une entreprise publique telle que la SEEG.",
        "Racontez une expérience où vous avez géré un projet d'Architecture d'Entreprise ou tout autre projet impliquant la contribution à la maîtrise de systèmes d'informations.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec les systèmes d'information.",
        "Donnez un exemple concret illustrant la meilleure façon de piloter les systèmes d'information d'une entreprise comme la SEEG, en garantissant la performance technologique, la sécurité des données et le soutien aux objectifs stratégiques.",
        "Comment garantirez-vous que les systèmes d'information de la SEEG respectent les normes légales et réglementaires en matière de sécurité et de protection des données afin de réduire les risques d'interruption de service et de cyberattaques ?"
    ],
    talent: [
        "Quelle innovation digitale prioriseriez-vous pour renforcer la performance et la transparence de la SEEG ?",
        "Comment utiliseriez-vous la data pour réduire les interruptions de service ?",
        "Comment assureriez-vous la cybersécurité dans un contexte de modernisation accélérée ?"
    ],
    paradigme: [
        "Quelle valeur donnez-vous à la donnée : un actif stratégique ou un simple outil de gestion ?",
        "Comment articulez-vous innovation technologique et protection des usagers ?",
        "Quels principes guident vos choix face aux enjeux de cybersécurité et d'intelligence artificielle ?"
    ]
  },
  
    [normalize("Chef de Département Electricité")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département électricité à la SEEG ?",
        "Décrivez ce que vous savez des normes requises pour gérer une concession électrique.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux électriques.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des réseaux électriques.",
        "Donnez un exemple concret illustrant la meilleure façon de gérer la distribution et la maintenance de l'électricité dans une entreprise comme la SEEG.",
        "Comment garantirez-vous que les activités du département Électricité respectent les normes légales et réglementaires afin de réduire les risques de défaillance et d'assurer la continuité de la distribution électrique ?"
    ],
    talent: [
        "Quelle action prioritaire mettriez-vous en œuvre pour améliorer la fiabilité du réseau électrique ?",
        "Comment garantiriez-vous la maintenance efficace des infrastructures vieillissantes ?",
        "Comment intégreriez-vous les énergies renouvelables dans la gestion du réseau existant ?"
    ],
    paradigme: [
        "Comment percevez-vous la mission de fournir une électricité fiable dans un service public national ?",
        "Quelle valeur accordez-vous à la maintenance préventive face à la pression de résultats immédiats ?",
        "Quelle est pour vous la place des énergies renouvelables dans la vision énergétique du pays ?"
    ]
  },
  
    [normalize("Directeur Exploitation Electricité")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'exploitation électricité à la SEEG ?",
        "Expliquez ce que vous savez des normes d'exploitation requises pour gérer une concession électrique.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux électriques.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'exploitation des réseaux électriques.",
        "Donnez un exemple concret illustrant la meilleure façon d'assurer l'exploitation optimale et la continuité du service électrique à la SEEG.",
        "Comment garantirez-vous que l'exploitation électrique respecte les normes légales et réglementaires afin de réduire les risques de panne et d'assurer un service continu aux usagers ?"
    ],
    talent: [
        "Comment assureriez-vous la continuité du service malgré des infrastructures fragiles ?",
        "Quelle méthode appliqueriez-vous pour réduire les délestages électriques ?",
        "Comment organiseriez-vous vos équipes pour optimiser la performance et la sécurité du réseau ?"
    ],
    paradigme: [
        "Quel est le devoir premier d'un responsable exploitation : réduire les coûts ou garantir la continuité du service ?",
        "Comment hiérarchisez-vous sécurité, rapidité d'intervention et satisfaction client ?",
        "Quelle est votre vision d'une exploitation électrique responsable ?"
    ]
  },
  
    [normalize("Directeur Technique Electricité")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant technique électricité à la SEEG ?",
        "Décrivez ce que vous savez des normes techniques requises pour gérer une concession électrique.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux électriques.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la technique des réseaux électriques.",
        "Donnez un exemple concret illustrant la meilleure façon de piloter les projets techniques liés à l'électricité et d'améliorer la performance des installations à la SEEG.",
        "Comment garantirez-vous que les projets et infrastructures électriques respectent les exigences légales et réglementaires afin de réduire les risques techniques et renforcer la fiabilité des installations ?"
    ],
    talent: [
        "Comment piloteriez-vous un projet de modernisation d'infrastructures électriques critiques ?",
        "Quelle solution technique privilégieriez-vous pour réduire les pertes en ligne ?",
        "Comment garantiriez-vous la conformité technique aux standards internationaux ?"
    ],
    paradigme: [
        "Quelle valeur donnez-vous au respect strict des normes techniques internationales ?",
        "Comment conciliez-vous performance technique et contraintes budgétaires ?",
        "Pour vous, que signifie « moderniser » une infrastructure publique ?"
    ]
  },
  
    [normalize("Chef de Département Eau")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département eau à la SEEG ?",
        "Expliquez ce que vous savez des normes requises pour gérer une concession d'eau.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux d'adduction d'eau.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des réseaux d'eau.",
        "Donnez un exemple concret illustrant la meilleure façon de gérer la distribution et la maintenance des infrastructures d'eau à la SEEG.",
        "Comment garantirez-vous que les projets techniques liés à l'eau respectent les normes légales et réglementaires afin de réduire les risques d'interruption de service et de garantir la qualité de l'approvisionnement ?"
    ],
    talent: [
        "Quelle stratégie adopteriez-vous pour améliorer la disponibilité de l'eau dans un contexte de stress hydrique ?",
        "Comment assureriez-vous la maintenance préventive du réseau d'eau ?",
        "Comment concilier efficacité technique et satisfaction des usagers ?"
    ],
    paradigme: [
        "Selon vous, l'accès universel à l'eau est-il un droit ou un service marchand ?",
        "Quelle valeur accordez-vous à la gestion durable des ressources hydriques ?",
        "Comment jugez-vous la priorité entre rentabilité économique et qualité du service public de l'eau ?"
    ]
  },
  
    [normalize("Directeur Exploitation Eau")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant de l'exploitation eau à la SEEG ?",
        "Décrivez ce que vous savez des normes d'exploitation requises pour gérer une concession d'eau.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux d'adduction d'eau.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec l'exploitation des réseaux d'eau.",
        "Donnez un exemple concret illustrant la meilleure façon d'assurer l'exploitation optimale et la continuité du service en eau à la SEEG.",
        "Comment garantirez-vous que l'exploitation des réseaux d'eau respecte les normes légales et réglementaires afin de limiter les risques de défaillance et d'assurer une distribution continue et sûre ?"
    ],
    talent: [
        "Comment optimiseriez-vous l'exploitation pour garantir un approvisionnement continu en eau ?",
        "Quelle innovation appliqueriez-vous pour réduire les pertes en eau potable ?",
        "Comment renforceriez-vous la résilience du réseau face aux aléas climatiques ?"
    ],
    paradigme: [
        "Quelle place accordez-vous à la satisfaction des usagers dans l'exploitation quotidienne ?",
        "Comment définiriez-vous la responsabilité d'un gestionnaire d'eau vis-à-vis des générations futures ?",
        "Pour vous, que représente la résilience face au stress hydrique récurrent ?"
    ]
  },
  
    [normalize("Directeur Technique Eau")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant technique eau à la SEEG ?",
        "Expliquez ce que vous savez des normes techniques requises pour gérer une concession d'eau.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement orienté réseaux d'adduction d'eau.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la technique des réseaux d'eau.",
        "Donnez un exemple concret illustrant la meilleure façon de piloter les projets techniques liés à l'eau et d'améliorer la performance des installations à la SEEG.",
        "Comment garantirez-vous que les projets techniques liés à l'eau respectent les normes légales et réglementaires afin de réduire les risques d'interruption de service et de garantir la qualité de l'approvisionnement ?"
    ],
    talent: [
        "Comment structureriez-vous un plan de modernisation des installations hydrauliques ?",
        "Quelle approche adopteriez-vous pour intégrer des solutions décentralisées en zones rurales ?",
        "Comment garantiriez-vous la qualité de l'eau distribuée selon les standards internationaux ?"
    ],
    paradigme: [
        "Quelle valeur accordez-vous à l'innovation technique dans l'accès à l'eau potable ?",
        "Comment jugez-vous l'importance des solutions décentralisées pour les zones rurales ?",
        "Quelle est votre vision de la qualité de l'eau distribuée comme facteur de santé publique ?"
    ]
  },
  
    [normalize("Chef de Département Support")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que chef du département support à la SEEG ?",
        "Décrivez ce que vous savez des normes requises pour concevoir la politique et gérer les processus support dans une entreprise publique telle que la SEEG.",
        "Racontez une expérience où vous avez dirigé un projet d'investissement visant l'efficacité et l'efficience des processus support.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec le support aux infrastructures.",
        "Donnez un exemple concret illustrant la meilleure façon d'organiser et de renforcer les fonctions support afin d'optimiser la performance globale de la SEEG.",
        "Comment garantirez-vous que les activités de support respectent les exigences légales et réglementaires afin de réduire les risques organisationnels et de soutenir la continuité des opérations de la SEEG ?"
    ],
    talent: [
        "Comment feriez-vous du support un levier d'efficacité plutôt qu'un centre de coûts ?",
        "Donnez un exemple où vous avez amélioré la productivité grâce à une meilleure organisation support.",
        "Comment assureriez-vous l'alignement des services support avec les objectifs stratégiques de la SEEG ?"
    ],
    paradigme: [
        "Pour vous, quel rôle jouent les fonctions support dans la performance globale ?",
        "Comment arbitrer entre réduction des coûts et qualité du service interne ?",
        "Quelles valeurs doivent guider une fonction support dans une entreprise de service public ?"
    ]
  },
  
    [normalize("Directeur du Capital Humain")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant du capital humain à la SEEG ?",
        "Expliquez ce que vous savez des bonnes pratiques de Gestion du Capital Humain pour accompagner la transformation des Hommes et de l'entreprise.",
        "Racontez une expérience où vous avez géré un projet RH visant le développement des Hommes au service de la croissance de l'entreprise.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des équipes.",
        "Donnez un exemple concret illustrant la meilleure façon de gérer le capital humain et de mobiliser les talents au service de la transformation de la SEEG.",
        "Comment garantirez-vous que la gestion du capital humain respecte le cadre légal et réglementaire du travail afin de réduire les risques sociaux et d'assurer la stabilité des opérations de la SEEG ?"
    ],
    talent: [
        "Comment transformeriez-vous la fonction RH en moteur de la performance collective ?",
        "Quelle action prioritaire mèneriez-vous pour attirer et retenir des talents rares ?",
        "Comment équilibreriez-vous la réduction de la masse salariale et la motivation des équipes ?"
    ],
    paradigme: [
        "Quelle est votre conception de la valeur humaine dans une entreprise publique ?",
        "Comment conciliez-vous équité sociale et performance économique ?",
        "Pour vous, qu'est-ce qu'un capital humain « stratégique » ?"
    ]
  },
  
    [normalize("Directeur Commercial et Recouvrement")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant commercial et recouvrement à la SEEG ?",
        "Décrivez ce que vous savez des bonnes pratiques commerciales pour gérer efficacement l'expérience client.",
        "Racontez une expérience où vous avez dirigé un projet d'investissements visant le développement commercial de l'entreprise.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion des paiements ou le commerce.",
        "Donnez un exemple concret illustrant la meilleure façon d'améliorer la relation client et d'optimiser le recouvrement à la SEEG.",
        "Comment garantirez-vous que les pratiques commerciales et de recouvrement respectent les lois et réglementations afin de réduire les risques financiers et de préserver la relation de confiance avec les usagers ?"
    ],
    talent: [
        "Quelle stratégie adopteriez-vous pour améliorer le taux de recouvrement tout en préservant la relation client ?",
        "Comment instaureriez-vous une tarification sociale mais viable pour la SEEG ?",
        "Comment digitaliseriez-vous la facturation et le suivi client pour réduire les impayés ?"
    ],
    paradigme: [
        "Comment équilibrez-vous exigence de recouvrement et justice sociale ?",
        "Quelle place accordez-vous à la relation client dans une entreprise publique ?",
        "Pour vous, que signifie « facturer équitablement » ?"
    ]
  },
  
    [normalize("Directeur Finances et Comptabilité")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant financier à la SEEG ?",
        "Expliquez ce que vous savez des normes et bonnes pratiques pour assurer l'orthodoxie financière de l'entreprise.",
        "Racontez une expérience où vous avez géré une situation financière complexe (budget, audit, trésorerie, restructuration) et expliquez comment vos décisions ont garanti la conformité, amélioré la performance et soutenu la stratégie de l'entreprise.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la gestion financière.",
        "Donnez un exemple concret illustrant la meilleure façon de gérer les finances et la comptabilité pour assurer la conformité et soutenir la stratégie de la SEEG.",
        "Comment garantirez-vous que les activités financières et comptables respectent les normes légales et réglementaires afin de réduire les risques de non-conformité et de soutenir la pérennité financière de la SEEG ?"
    ],
    talent: [
        "Comment garantiriez-vous la fiabilité des comptes dans un contexte d'endettement élevé ?",
        "Quelle stratégie financière appliqueriez-vous pour sécuriser la trésorerie ?",
        "Comment aligneriez-vous la gestion financière sur le modèle économique viable de la Vision 2025-2035 ?"
    ],
    paradigme: [
        "Quelle importance accordez-vous à la transparence financière dans la confiance publique ?",
        "Comment conciliez-vous rigueur budgétaire et investissement dans la modernisation ?",
        "Selon vous, que signifie un modèle économique « viable et responsable » ?"
    ]
  },
  
    [normalize("Directeur Moyens Généraux")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant des moyens généraux à la SEEG ?",
        "Décrivez ce que vous savez des bonnes pratiques pour gérer efficacement les moyens généraux de l'entreprise.",
        "Racontez une expérience où vous avez géré une organisation logistique ou administrative complexe et expliquez comment vos décisions ont optimisé les ressources, garanti la continuité et renforcé la performance de l'institution.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la logistique ou le support.",
        "Donnez un exemple concret illustrant la meilleure façon de gérer les moyens généraux et d'assurer la continuité opérationnelle de la SEEG.",
        "Comment garantirez-vous que la gestion des moyens généraux respecte les normes légales et réglementaires afin de réduire les risques logistiques et de maintenir la continuité opérationnelle de la SEEG ?"
    ],
    talent: [
        "Comment optimiseriez-vous la gestion logistique pour assurer la continuité opérationnelle ?",
        "Quelle méthode appliqueriez-vous pour réduire les coûts tout en améliorant le service interne ?",
        "Comment sécuriseriez-vous la gestion des infrastructures et du patrimoine matériel de la SEEG ?"
    ],
    paradigme: [
        "Quelle est pour vous la valeur d'une gestion rigoureuse des ressources matérielles ?",
        "Comment conciliez-vous durabilité des infrastructures et contraintes budgétaires ?",
        "Quelle place accordez-vous à la logistique dans la continuité des services publics ?"
    ]
  },
  
    [normalize("Coordonnateur des Régions")]: {
    metier: [
        "Quelles sont les problématiques que vous identifiez aujourd'hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?",
        "Quels sont les trois principaux challenges que vous comptez relever en tant que coordinateur régional à la SEEG ?",
        "Décrivez ce que vous savez des bonnes pratiques en matière de coordinations multisectorielles, multi-sites.",
        "Racontez une expérience où vous avez coordonné des actions multisectorielles dans plusieurs zones ou régions et expliquez comment vos décisions ont renforcé la cohérence, amélioré la performance locale et soutenu les priorités nationales.",
        "Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la coordination régionale.",
        "Donnez un exemple concret illustrant la meilleure façon de coordonner les activités régionales et d'assurer la cohérence entre les priorités locales et les objectifs nationaux de la SEEG.",
        "Comment garantirez-vous que les activités régionales respectent les lois et réglementations locales afin de réduire les risques de rupture de service et d'assurer la cohérence avec les priorités nationales de la SEEG ?"
    ],
    talent: [
        "Comment assureriez-vous la cohérence des activités régionales avec les priorités nationales de la SEEG ?",
        "Donnez un exemple de stratégie pour renforcer la performance des régions éloignées.",
        "Comment impliqueriez-vous les parties prenantes locales dans la réussite des objectifs de la Vision 2025-2035 ?"
    ],
    paradigme: [
        "Comment définissez-vous la valeur de la proximité avec les usagers dans les régions ?",
        "Quelle importance accordez-vous à l'équité territoriale dans la distribution des services ?",
        "Selon vous, quel est le rôle des parties prenantes locales dans la réussite de la SEEG ?"
    ]
  }
};

export const getMetierQuestionsForTitle = (title: string): MTPQuestions => {
  if (!title) return defaultMTPQuestions;
  const key = normalize(title);
  // Fallback to default if a specific set of MTP questions isn't found
  const questions = mtpQuestionsByOfferNormalized[key] ?? defaultMTPQuestions;
  return questions;
}
