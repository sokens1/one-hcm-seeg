-- Vérifier les titres exacts des 2 offres qui ont encore des questions null
SELECT 
  id,
  title,
  LENGTH(title) as longueur_titre,
  status_offerts
FROM job_offers 
WHERE title LIKE '%Systèmes d%Information%' OR title LIKE '%Technique Eau%'
ORDER BY title;

-- Mise à jour pour "Directeur des Systèmes d'Information" (toutes les variantes possibles)
UPDATE job_offers 
SET 
  mtp_questions_metier = ARRAY[
    'Quelles sont les problématiques que vous identifiez aujourd''hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?',
    'Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant des systèmes d''information à la SEEG ?',
    'Expliquez ce que vous savez des normes informatiques et bonnes pratiques requises pour développer et garantir la maîtrise de l''architecture d''entreprise (EA) dans une entreprise publique telle que la SEEG.',
    'Racontez une expérience où vous avez géré un projet d''Architecture d''Entreprise ou tout autre projet impliquant la contribution à la maîtrise de systèmes d''informations.',
    'Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec les systèmes d''information.',
    'Donnez un exemple concret illustrant la meilleure façon de piloter les systèmes d''information d''une entreprise comme la SEEG, en garantissant la performance technologique, la sécurité des données et le soutien aux objectifs stratégiques.',
    'Comment garantirez-vous que les systèmes d''information de la SEEG respectent les normes légales et réglementaires en matière de sécurité et de protection des données afin de réduire les risques d''interruption de service et de cyberattaques ?'
  ],
  mtp_questions_talent = ARRAY[
    'Quelle innovation digitale prioriseriez-vous pour renforcer la performance et la transparence de la SEEG ?',
    'Comment utiliseriez-vous la data pour réduire les interruptions de service ?',
    'Comment assureriez-vous la cybersécurité dans un contexte de modernisation accélérée ?'
  ],
  mtp_questions_paradigme = ARRAY[
    'Quelle valeur donnez-vous à la donnée : un actif stratégique ou un simple outil de gestion ?',
    'Comment articulez-vous innovation technologique et protection des usagers ?',
    'Quels principes guident vos choix face aux enjeux de cybersécurité et d''intelligence artificielle ?'
  ]
WHERE title LIKE '%Systèmes d%Information%' OR title LIKE '%Systemes d%Information%';

-- Mise à jour pour "Directeur Technique Eau" (toutes les variantes possibles)
UPDATE job_offers 
SET 
  mtp_questions_metier = ARRAY[
    'Quelles sont les problématiques que vous identifiez aujourd''hui à la SEEG, pour ce poste ? Quelles solutions préconisez-vous ? Quels pourraient être les obstacles au déploiement de votre solution ?',
    'Quels sont les trois principaux challenges que vous comptez relever en tant que dirigeant technique eau à la SEEG ?',
    'Expliquez ce que vous savez des normes techniques requises pour gérer une concession d''eau.',
    'Racontez une expérience où vous avez dirigé un projet d''investissement orienté réseaux d''adduction d''eau.',
    'Décrivez deux réalisations majeures que vous avez accomplies dans votre carrière, en lien avec la technique des réseaux d''eau.',
    'Donnez un exemple concret illustrant la meilleure façon de piloter les projets techniques liés à l''eau et d''améliorer la performance des installations à la SEEG.',
    'Comment garantirez-vous que les projets techniques liés à l''eau respectent les normes légales et réglementaires afin de réduire les risques d''interruption de service et de garantir la qualité de l''approvisionnement ?'
  ],
  mtp_questions_talent = ARRAY[
    'Comment structureriez-vous un plan de modernisation des installations hydrauliques ?',
    'Quelle approche adopteriez-vous pour intégrer des solutions décentralisées en zones rurales ?',
    'Comment garantiriez-vous la qualité de l''eau distribuée selon les standards internationaux ?'
  ],
  mtp_questions_paradigme = ARRAY[
    'Quelle valeur accordez-vous à l''innovation technique dans l''accès à l''eau potable ?',
    'Comment jugez-vous l''importance des solutions décentralisées pour les zones rurales ?',
    'Quelle est votre vision de la qualité de l''eau distribuée comme facteur de santé publique ?'
  ]
WHERE title LIKE '%Technique Eau%';

-- Vérification finale
SELECT 
  title,
  status_offerts,
  CASE 
    WHEN mtp_questions_metier IS NULL THEN 'null'
    WHEN array_length(mtp_questions_metier, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_metier, 1)::text || ' questions'
  END as metier_status,
  CASE 
    WHEN mtp_questions_talent IS NULL THEN 'null'
    WHEN array_length(mtp_questions_talent, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_talent, 1)::text || ' questions'
  END as talent_status,
  CASE 
    WHEN mtp_questions_paradigme IS NULL THEN 'null'
    WHEN array_length(mtp_questions_paradigme, 1) = 0 THEN 'VIDE'
    ELSE array_length(mtp_questions_paradigme, 1)::text || ' questions'
  END as paradigme_status
FROM job_offers 
ORDER BY title;
