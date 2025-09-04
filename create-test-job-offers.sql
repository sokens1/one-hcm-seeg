-- Script pour créer des offres d'emploi de test
-- Vérifier et créer des offres d'emploi actives pour permettre les candidatures

-- 1. Vérifier l'état actuel des offres d'emploi
SELECT 
    COUNT(*) as total_offers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_offers,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_offers,
    COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed_offers
FROM public.job_offers;

-- 2. Vérifier s'il y a des recruteurs dans la base
SELECT 
    id, 
    first_name, 
    last_name, 
    role,
    email
FROM public.users 
WHERE role IN ('recruteur', 'recruiter', 'admin')
LIMIT 5;

-- 3. Créer des offres d'emploi de test si nécessaire
DO $$
DECLARE
    recruiter_id UUID;
    job_count INTEGER;
BEGIN
    -- Récupérer un recruteur ou admin
    SELECT id INTO recruiter_id 
    FROM public.users 
    WHERE role IN ('recruteur', 'recruiter', 'admin')
    LIMIT 1;
    
    -- Compter les offres actives
    SELECT COUNT(*) INTO job_count 
    FROM public.job_offers 
    WHERE status = 'active';
    
    -- Si pas de recruteur, créer un utilisateur admin par défaut
    IF recruiter_id IS NULL THEN
        INSERT INTO public.users (id, first_name, last_name, email, role, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Admin',
            'SEEG',
            'admin@seeg.ga',
            'admin',
            now(),
            now()
        )
        RETURNING id INTO recruiter_id;
        
        RAISE NOTICE 'Utilisateur admin créé avec ID: %', recruiter_id;
    END IF;
    
    -- Si pas d'offres actives, créer des offres de test
    IF job_count = 0 THEN
        -- Offre 1: Développeur Full Stack
        INSERT INTO public.job_offers (
            id, recruiter_id, title, description, location, contract_type, 
            status, created_at, updated_at, categorie_metier, date_limite
        ) VALUES (
            gen_random_uuid(),
            recruiter_id,
            'Développeur Full Stack',
            'Nous recherchons un développeur full stack passionné pour rejoindre notre équipe technique. Vous serez responsable du développement et de la maintenance de nos applications web et mobiles.',
            'Libreville, Gabon',
            'CDI',
            'active',
            now(),
            now(),
            'Informatique',
            (now() + INTERVAL '30 days')::date
        );
        
        -- Offre 2: Chef de Projet
        INSERT INTO public.job_offers (
            id, recruiter_id, title, description, location, contract_type, 
            status, created_at, updated_at, categorie_metier, date_limite
        ) VALUES (
            gen_random_uuid(),
            recruiter_id,
            'Chef de Projet Digital',
            'Nous cherchons un chef de projet digital expérimenté pour piloter nos projets de transformation numérique. Vous coordonnerez les équipes et assurerez la réussite des projets.',
            'Libreville, Gabon',
            'CDI',
            'active',
            now(),
            now(),
            'Management',
            (now() + INTERVAL '45 days')::date
        );
        
        -- Offre 3: Analyste Financier
        INSERT INTO public.job_offers (
            id, recruiter_id, title, description, location, contract_type, 
            status, created_at, updated_at, categorie_metier, date_limite
        ) VALUES (
            gen_random_uuid(),
            recruiter_id,
            'Analyste Financier',
            'Rejoignez notre équipe financière en tant qu''analyste. Vous serez chargé de l''analyse des données financières, de la préparation des rapports et du support aux décisions stratégiques.',
            'Libreville, Gabon',
            'CDI',
            'active',
            now(),
            now(),
            'Finance',
            (now() + INTERVAL '20 days')::date
        );
        
        RAISE NOTICE '3 offres d''emploi de test créées avec succès';
    ELSE
        RAISE NOTICE 'Des offres actives existent déjà (% offres)', job_count;
    END IF;
    
    -- Vérification finale
    SELECT COUNT(*) INTO job_count 
    FROM public.job_offers 
    WHERE status = 'active';
    
    RAISE NOTICE 'Total des offres actives après traitement: %', job_count;
END $$;

-- 4. Vérification finale des offres créées
SELECT 
    id,
    title,
    location,
    contract_type,
    status,
    categorie_metier,
    date_limite,
    created_at
FROM public.job_offers 
WHERE status = 'active'
ORDER BY created_at DESC;

-- 5. Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Offres d''emploi de test créées avec succès !';
    RAISE NOTICE '🎯 Les candidats peuvent maintenant voir et postuler aux offres';
    RAISE NOTICE '📱 Accédez à /jobs ou /candidate/dashboard pour tester';
END $$;
