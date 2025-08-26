-- Migration pour ajouter les notifications automatiques dynamiques
-- Objectif: Notifier automatiquement les utilisateurs lors d'événements importants

-- 1. Fonction pour créer une notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_link TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_application_id)
  VALUES (p_user_id, p_title, p_message, p_type, NULL);
END;
$$;

-- 2. Trigger pour notifier le recruteur lors d'une nouvelle candidature
CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_title TEXT;
  job_recruiter_id UUID;
  candidate_name TEXT;
BEGIN
  -- Récupérer les infos de l'offre et du recruteur
  SELECT jo.title, jo.recruiter_id, u.first_name || ' ' || u.last_name
  INTO job_title, job_recruiter_id, candidate_name
  FROM public.job_offers jo
  JOIN public.users u ON u.id = NEW.candidate_id
  WHERE jo.id = NEW.job_offer_id;

  -- Notifier le recruteur
  IF job_recruiter_id IS NOT NULL THEN
    PERFORM public.create_notification(
      job_recruiter_id,
      'Nouvelle candidature reçue',
      candidate_name || ' a postulé pour le poste "' || job_title || '"',
      'info'
    );
  END IF;

  -- Notifier le candidat de la réception de sa candidature
  PERFORM public.create_notification(
    NEW.candidate_id,
    'Candidature envoyée avec succès',
    'Votre candidature pour le poste "' || job_title || '" a bien été reçue et sera examinée prochainement.',
    'success'
  );

  RETURN NEW;
END;
$$;

-- 3. Trigger pour notifier lors d'un changement de statut de candidature
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_title TEXT;
  status_message TEXT;
  notification_type TEXT;
BEGIN
  -- Ne rien faire si le statut n'a pas changé
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Récupérer le titre du poste
  SELECT jo.title INTO job_title
  FROM public.job_offers jo
  WHERE jo.id = NEW.job_offer_id;

  -- Définir le message selon le nouveau statut
  CASE NEW.status
    WHEN 'incubation' THEN
      status_message := 'Votre candidature pour le poste "' || job_title || '" est passée en phase d''incubation. Félicitations !';
      notification_type := 'success';
    WHEN 'embauche' THEN
      status_message := 'Excellente nouvelle ! Vous avez été sélectionné(e) pour le poste "' || job_title || '". Félicitations !';
      notification_type := 'success';
    WHEN 'refuse' THEN
      status_message := 'Votre candidature pour le poste "' || job_title || '" n''a malheureusement pas été retenue cette fois-ci.';
      notification_type := 'info';
    ELSE
      -- Pour les autres statuts, ne pas envoyer de notification
      RETURN NEW;
  END CASE;

  -- Notifier le candidat du changement de statut
  PERFORM public.create_notification(
    NEW.candidate_id,
    'Mise à jour de votre candidature',
    status_message,
    notification_type
  );

  RETURN NEW;
END;
$$;

-- 4. Créer les triggers
DROP TRIGGER IF EXISTS trigger_notify_new_application ON public.applications;
CREATE TRIGGER trigger_notify_new_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_application();

DROP TRIGGER IF EXISTS trigger_notify_status_change ON public.applications;
CREATE TRIGGER trigger_notify_status_change
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_status_change();

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_notification(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_new_application() TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_application_status_change() TO authenticated;
