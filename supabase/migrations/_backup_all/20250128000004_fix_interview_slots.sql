-- Migration pour adapter la table interview_slots existante
-- Vérifier et ajouter les colonnes manquantes

-- Ajouter la colonne is_available si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_slots' AND column_name = 'is_available') THEN
        ALTER TABLE public.interview_slots ADD COLUMN is_available BOOLEAN DEFAULT true NOT NULL;
    END IF;
END $$;

-- Ajouter la colonne recruiter_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_slots' AND column_name = 'recruiter_id') THEN
        ALTER TABLE public.interview_slots ADD COLUMN recruiter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ajouter la colonne candidate_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_slots' AND column_name = 'candidate_id') THEN
        ALTER TABLE public.interview_slots ADD COLUMN candidate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Ajouter la colonne notes si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_slots' AND column_name = 'notes') THEN
        ALTER TABLE public.interview_slots ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Ajouter l'index pour is_available seulement si la colonne existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'interview_slots' AND column_name = 'is_available') THEN
        CREATE INDEX IF NOT EXISTS idx_interview_slots_available ON public.interview_slots(is_available) WHERE is_available = true;
    END IF;
END $$;

-- RLS (Row Level Security) - seulement si pas déjà activé
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'interview_slots' AND relrowsecurity = true) THEN
        ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Politiques RLS - supprimer d'abord les anciennes si elles existent
DROP POLICY IF EXISTS "Recruiters can manage all interview slots" ON public.interview_slots;
DROP POLICY IF EXISTS "Candidates can view their own interview slots" ON public.interview_slots;
DROP POLICY IF EXISTS "Admins can manage all interview slots" ON public.interview_slots;

-- Politique pour les recruteurs : peuvent voir et modifier tous les créneaux
CREATE POLICY "Recruiters can manage all interview slots" ON public.interview_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'recruteur'
        )
    );

-- Politique pour les candidats : peuvent voir leurs propres créneaux
CREATE POLICY "Candidates can view their own interview slots" ON public.interview_slots
    FOR SELECT USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE candidate_id = auth.uid()
        )
    );

-- Politique pour les admins : accès complet
CREATE POLICY "Admins can manage all interview slots" ON public.interview_slots
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.interview_slots IS 'Gestion des créneaux d''entretiens pour les candidatures';
COMMENT ON COLUMN public.interview_slots.date IS 'Date de l''entretien';
COMMENT ON COLUMN public.interview_slots.time IS 'Heure de l''entretien (créneaux fixes)';
COMMENT ON COLUMN public.interview_slots.is_available IS 'Indique si le créneau est disponible';
COMMENT ON COLUMN public.interview_slots.application_id IS 'ID de la candidature associée';
COMMENT ON COLUMN public.interview_slots.recruiter_id IS 'ID du recruteur qui programme l''entretien';
COMMENT ON COLUMN public.interview_slots.candidate_id IS 'ID du candidat';
COMMENT ON COLUMN public.interview_slots.notes IS 'Notes additionnelles sur l''entretien';
