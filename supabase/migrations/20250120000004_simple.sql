-- Migration simple : Table d'historique des statuts
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_application_status_history_app_id 
ON public.application_status_history(application_id);

-- Permissions
GRANT SELECT, INSERT ON public.application_status_history TO authenticated;
GRANT SELECT, INSERT ON public.application_status_history TO anon;
