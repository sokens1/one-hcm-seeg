-- Solution immédiate : Désactiver RLS complètement
-- Cette commande est très simple et ne devrait pas causer de timeout
ALTER TABLE protocol1_evaluations DISABLE ROW LEVEL SECURITY;
