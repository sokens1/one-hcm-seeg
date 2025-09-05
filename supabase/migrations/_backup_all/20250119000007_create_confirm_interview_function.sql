-- Fonction pour confirmer un entretien et notifier le candidat
CREATE OR REPLACE FUNCTION confirm_interview_slot(
  p_application_id UUID,
  p_interview_date DATE,
  p_interview_time TIME,
  p_candidate_name TEXT,
  p_job_title TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  interview_slot_id UUID;
  candidate_email TEXT;
  result JSON;
BEGIN
  -- Trouver le créneau d'entretien
  SELECT id INTO interview_slot_id
  FROM interview_slots 
  WHERE application_id = p_application_id 
  AND date = p_interview_date 
  AND time = p_interview_time 
  AND status = 'scheduled';

  IF interview_slot_id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Créneau d''entretien introuvable'
    );
  END IF;

  -- Marquer le créneau comme confirmé
  UPDATE interview_slots 
  SET status = 'confirmed', 
      updated_at = NOW()
  WHERE id = interview_slot_id;

  -- Récupérer l'email du candidat depuis la table applications
  SELECT u.email INTO candidate_email
  FROM applications a
  JOIN auth.users u ON a.user_id = u.id
  WHERE a.id = p_application_id;

  -- Envoyer une notification email (simulation - à remplacer par un vrai service d'email)
  -- Pour l'instant, on log juste l'information
  RAISE NOTICE 'Email de confirmation envoyé à % pour l''entretien du % à % pour le poste %', 
    candidate_email, p_interview_date, p_interview_time, p_job_title;

  -- Créer une notification dans la table notifications (si elle existe)
  -- Sinon, on peut créer une table de notifications plus tard
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    created_at
  )
  SELECT 
    a.user_id,
    'Entretien confirmé',
    format('Votre entretien pour le poste %s a été confirmé pour le %s à %s', 
           p_job_title, 
           to_char(p_interview_date, 'DD/MM/YYYY'), 
           to_char(p_interview_time, 'HH24:MI')),
    'interview_confirmed',
    NOW()
  FROM applications a
  WHERE a.id = p_application_id;

  RETURN json_build_object(
    'success', true, 
    'message', 'Entretien confirmé et candidat notifié',
    'candidate_email', candidate_email
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', SQLERRM
    );
END;
$$;

-- Créer la table notifications si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- RLS pour la table notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Mettre à jour le statut du créneau d'entretien pour inclure 'confirmed'
ALTER TABLE public.interview_slots 
DROP CONSTRAINT IF EXISTS interview_slots_status_check;

ALTER TABLE public.interview_slots 
ADD CONSTRAINT interview_slots_status_check 
CHECK (status IN ('scheduled', 'completed', 'cancelled', 'confirmed'));












