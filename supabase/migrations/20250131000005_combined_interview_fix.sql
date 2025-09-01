-- Migration combinée pour corriger la fonctionnalité de programmation d'entretien
-- Cette migration combine toutes les corrections nécessaires

-- 1. Ajouter la colonne interview_date à la table applications
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'interview_date') THEN
        ALTER TABLE public.applications ADD COLUMN interview_date TIMESTAMP WITH TIME ZONE;
        COMMENT ON COLUMN public.applications.interview_date IS 'Date et heure de l''entretien programmé';
    END IF;
END $$;

-- 2. Modifier la contrainte CHECK du statut pour inclure 'entretien_programme'
DO $$ 
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'applications' 
        AND constraint_name LIKE '%status%'
        AND constraint_type = 'CHECK'
    ) THEN
        -- Trouver le nom exact de la contrainte
        EXECUTE (
            'ALTER TABLE public.applications DROP CONSTRAINT ' || 
            (SELECT constraint_name FROM information_schema.table_constraints 
             WHERE table_name = 'applications' 
             AND constraint_name LIKE '%status%'
             AND constraint_type = 'CHECK' LIMIT 1)
        );
    END IF;
    
    -- Ajouter la nouvelle contrainte avec le statut 'entretien_programme'
    ALTER TABLE public.applications 
    ADD CONSTRAINT applications_status_check 
    CHECK (status IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme'));
    
END $$;

-- 3. Créer ou recréer la table interview_slots
DROP TABLE IF EXISTS public.interview_slots CASCADE;

CREATE TABLE public.interview_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true NOT NULL,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    recruiter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    candidate_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Contrainte d'unicité pour éviter les doubles réservations
    UNIQUE(date, time)
);

-- 4. Créer les index nécessaires
CREATE INDEX IF NOT EXISTS idx_interview_slots_date_time ON public.interview_slots(date, time);
CREATE INDEX IF NOT EXISTS idx_interview_slots_application_id ON public.interview_slots(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_slots_available ON public.interview_slots(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_interview_slots_recruiter_id ON public.interview_slots(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interview_slots_candidate_id ON public.interview_slots(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_interview_date ON public.applications(interview_date);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- 5. Activer RLS
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour interview_slots
CREATE POLICY "Recruiters can manage all interview slots" ON public.interview_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'recruteur'
        )
    );

CREATE POLICY "Candidates can view their own interview slots" ON public.interview_slots
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE candidate_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all interview slots" ON public.interview_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_interview_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger pour updated_at
DROP TRIGGER IF EXISTS set_interview_slots_timestamp ON public.interview_slots;
CREATE TRIGGER set_interview_slots_timestamp
    BEFORE UPDATE ON public.interview_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_interview_slots_updated_at();

-- 9. Vérifier que toutes les applications existantes ont un statut valide
UPDATE public.applications 
SET status = 'candidature' 
WHERE status IS NULL OR status NOT IN ('candidature', 'incubation', 'embauche', 'refuse', 'entretien_programme');

-- 10. S'assurer que la colonne status a une valeur par défaut
ALTER TABLE public.applications ALTER COLUMN status SET DEFAULT 'candidature';

-- 11. Ajouter une contrainte NOT NULL sur status si elle n'existe pas
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'applications' 
        AND column_name = 'status' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE public.applications ALTER COLUMN status SET NOT NULL;
    END IF;
END $$;

-- 12. Commentaires sur les tables et colonnes
COMMENT ON TABLE public.interview_slots IS 'Gestion des créneaux d''entretiens pour les candidatures';
COMMENT ON COLUMN public.interview_slots.date IS 'Date de l''entretien';
COMMENT ON COLUMN public.interview_slots.time IS 'Heure de l''entretien (créneaux fixes)';
COMMENT ON COLUMN public.interview_slots.is_available IS 'Indique si le créneau est disponible';
COMMENT ON COLUMN public.interview_slots.application_id IS 'ID de la candidature associée';
COMMENT ON COLUMN public.interview_slots.recruiter_id IS 'ID du recruteur qui programme l''entretien';
COMMENT ON COLUMN public.interview_slots.candidate_id IS 'ID du candidat';
COMMENT ON COLUMN public.interview_slots.notes IS 'Notes additionnelles sur l''entretien';
COMMENT ON COLUMN public.applications.status IS 'Statut de la candidature: candidature, incubation, embauche, refuse, entretien_programme';
COMMENT ON COLUMN public.applications.interview_date IS 'Date et heure de l''entretien programmé';

-- 13. Insérer quelques créneaux de test pour septembre 2025
INSERT INTO public.interview_slots (date, time, is_available, application_id, recruiter_id, candidate_id, notes)
SELECT 
    date_series.date,
    time_series.time,
    true,
    NULL,
    NULL,
    NULL,
    'Créneau disponible'
FROM (
    SELECT generate_series(
        '2025-09-01'::date,
        '2025-09-30'::date,
        '1 day'::interval
    )::date as date
) date_series
CROSS JOIN (
    SELECT unnest(ARRAY['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']::time[]) as time
) time_series
WHERE date_series.date >= CURRENT_DATE
ON CONFLICT (date, time) DO NOTHING;
