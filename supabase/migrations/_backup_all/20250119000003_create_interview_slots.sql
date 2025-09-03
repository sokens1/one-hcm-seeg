-- Création de la table interview_slots pour gérer les créneaux d'entretien
CREATE TABLE IF NOT EXISTS public.interview_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    application_id UUID NOT NULL,
    candidate_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Contrainte d'unicité pour éviter les doubles réservations
    UNIQUE(date, time, status) DEFERRABLE INITIALLY DEFERRED
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_interview_slots_date_time ON public.interview_slots(date, time);
CREATE INDEX IF NOT EXISTS idx_interview_slots_application_id ON public.interview_slots(application_id);
CREATE INDEX IF NOT EXISTS idx_interview_slots_status ON public.interview_slots(status);

-- RLS (Row Level Security)
ALTER TABLE public.interview_slots ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Authenticated users can view interview slots" ON public.interview_slots
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert interview slots" ON public.interview_slots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update interview slots" ON public.interview_slots
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete interview slots" ON public.interview_slots
    FOR DELETE USING (auth.role() = 'authenticated');

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON public.interview_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
