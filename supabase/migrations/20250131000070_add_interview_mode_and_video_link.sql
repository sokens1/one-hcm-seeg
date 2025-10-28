-- Migration: Ajout des colonnes pour le mode d'entretien (présentiel/distanciel) et lien visio
-- Date: 2025-01-31

-- Ajouter la colonne interview_mode (présentiel ou distanciel)
ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS interview_mode TEXT DEFAULT 'presentiel' CHECK (interview_mode IN ('presentiel', 'distanciel'));

-- Ajouter la colonne video_link pour stocker le lien de visioconférence
ALTER TABLE interview_slots 
ADD COLUMN IF NOT EXISTS video_link TEXT;

-- Créer un index pour améliorer les performances des requêtes par mode
CREATE INDEX IF NOT EXISTS idx_interview_slots_mode ON interview_slots(interview_mode);

-- Commentaires pour documentation
COMMENT ON COLUMN interview_slots.interview_mode IS 'Mode de l''entretien: presentiel ou distanciel';
COMMENT ON COLUMN interview_slots.video_link IS 'Lien de visioconférence si mode distanciel (Teams, Zoom, etc.)';

