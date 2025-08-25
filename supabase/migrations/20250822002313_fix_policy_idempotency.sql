-- Rendre les créations de politiques idempotentes pour éviter l'erreur 42710
-- Si les politiques existent déjà, on ne les recrée pas

BEGIN;

-- Applications: politique globale pour recruteurs/admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'applications' 
      AND policyname = 'Recruiters and admins can view all applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Recruiters and admins can view all applications" ON public.applications
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
          )
        )
    $$;
  END IF;
END$$;

-- Applications: politique pour que les candidats voient leurs candidatures
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'applications' 
      AND policyname = 'Candidates can view their own applications'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Candidates can view their own applications" ON public.applications
        FOR SELECT USING (candidate_id = auth.uid())
    $$;
  END IF;
END$$;

-- Application documents: lecture globale pour recruteurs/admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'application_documents' 
      AND policyname = 'Recruiters and admins can view all application documents'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Recruiters and admins can view all application documents" ON public.application_documents
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role IN ('recruteur', 'admin')
          )
        )
    $$;
  END IF;
END$$;

-- Users: lecture par recruteurs/admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'users' 
      AND policyname = 'Recruiters can read users'
  ) THEN
    EXECUTE $$
      CREATE POLICY "Recruiters can read users" ON public.users
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('recruteur', 'admin')
          )
        )
    $$;
  END IF;
END$$;

COMMIT;
