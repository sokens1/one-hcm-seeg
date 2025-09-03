-- Étape 4: Créer une politique simple
CREATE POLICY "Allow recruiters protocol1" 
ON public.protocol1_evaluations FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND role IN ('recruteur', 'recruiter', 'admin')
  )
);
