-- Add mtp_answers column to the applications table to store test/questionnaire answers
ALTER TABLE public.applications
ADD COLUMN mtp_answers JSONB;
