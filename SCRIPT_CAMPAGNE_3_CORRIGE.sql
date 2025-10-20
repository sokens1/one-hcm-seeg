-- ============================================================================
-- INSERTION CAMPAGNE 3 - SCRIPT CORRIGÉ
-- ============================================================================

-- RECRUTEUR
INSERT INTO public.users (id, email, matricule, role, first_name, last_name, phone, date_of_birth, candidate_status, created_at, updated_at) 
VALUES ('ff967d0b-e250-40dc-8cb6-fc16429dceed'::uuid, 'jessymac33@gmail.com', '0001', 'recruteur', 'Jessy', 'Mac Modifié', '+24162788840', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
ON CONFLICT (id) DO NOTHING;

-- OFFRES DE CAMPAGNE 3
-- Note: Pour obtenir les INSERT complets avec toutes les descriptions, exécutez cette requête dans votre BASE SOURCE:

SELECT 
    '(' ||
    quote_literal(id::text) || '::uuid, ' ||
    quote_literal(recruiter_id) || ', ' ||
    quote_literal(title) || ', ' ||
    quote_literal(COALESCE(description, '')) || ', ' ||
    quote_literal(location) || ', ' ||
    quote_literal(contract_type) || ', ' ||
    COALESCE(quote_literal(department), 'NULL') || ', ' ||
    COALESCE(salary_min::text, 'NULL') || ', ' ||
    COALESCE(salary_max::text, 'NULL') || ', ' ||
    COALESCE(quote_literal(requirements::text) || '::text[]', 'NULL') || ', ' ||
    COALESCE(quote_literal(benefits::text) || '::text[]', 'NULL') || ', ' ||
    quote_literal(status) || ', ' ||
    COALESCE(quote_literal(status_offerts), 'NULL') || ', ' ||
    COALESCE(quote_literal(application_deadline::text) || '::date', 'NULL') || ', ' ||
    campaign_id::text || ', ' ||
    COALESCE(quote_literal(reporting_line), 'NULL') || ', ' ||
    COALESCE(quote_literal(job_grade), 'NULL') || ', ' ||
    COALESCE(quote_literal(salary_note), 'NULL') || ', ' ||
    COALESCE(quote_literal(start_date::text) || '::date', 'NULL') || ', ' ||
    COALESCE(quote_literal(responsibilities::text) || '::text[]', 'NULL') || ', ' ||
    'CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)' ||
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY title) < COUNT(*) OVER () THEN ','
        ELSE ';'
    END as values_clause
FROM public.job_offers
WHERE campaign_id = 3
ORDER BY title;

-- Puis collez les résultats ici après "INSERT INTO public.job_offers (...) VALUES"


