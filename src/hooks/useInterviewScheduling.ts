import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

interface LinkedUserRecord {
  first_name?: string;
  last_name?: string;
}

interface LinkedJobOfferRecord {
  title?: string;
}

interface ApplicationDetails {
  candidate_id?: string | null;
  job_offer_id?: string | null;
  users?: LinkedUserRecord | LinkedUserRecord[];
  job_offers?: LinkedJobOfferRecord | LinkedJobOfferRecord[];
}
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface InterviewSlot {
  id?: string;
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:MM:SS
  isAvailable: boolean;
  applicationId?: string;
  recruiterId?: string;
  candidateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewSchedule {
  date: string;
  slots: InterviewSlot[];
}

export const useInterviewScheduling = (applicationId?: string) => {
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastApplicationIdRef = useRef<string>();

  // Normalisation de l'heure au format HH:MM:SS
  const normalizeTimeToHms = useCallback((value: string): string => {
    const trimmed = (value || '').trim();
    const hms = /^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/; // HH:MM:SS
    const hm = /^([01]?\d|2[0-3]):([0-5]\d)$/; // HH:MM
    if (hms.test(trimmed)) return trimmed;
    if (hm.test(trimmed)) return `${trimmed}:00`;
    // Tentative de rattrapage 9:0 -> 09:00:00
    const parts = trimmed.split(':').map(p => p.padStart(2, '0'));
    if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
    if (parts.length === 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;
    return trimmed; // on laisse tel quel, la DB rejettera si invalide
  }, []);

  // Créneaux horaires disponibles (alignés sur HH:MM:SS)
  const timeSlots = useMemo(() => (
    ['09:00:00', '10:00:00', '11:00:00', '14:00:00', '15:00:00', '16:00:00', '17:00:00']
  ), []);

  // Charger les créneaux d'entretien
  const loadInterviewSlots = useCallback(async () => {
    if (!applicationId) return;

    // Cache simple pour éviter les rechargements inutiles
    const cacheKey = `slots_${applicationId}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    const cacheTime = sessionStorage.getItem(`${cacheKey}_time`);
    
    // Utiliser le cache si il a moins de 30 secondes
    if (cachedData && cacheTime && (Date.now() - parseInt(cacheTime)) < 30000) {
      try {
        const parsedData = JSON.parse(cachedData);
        setSchedules(parsedData);
        setIsLoading(false);
        console.log('📦 Données chargées depuis le cache');
        return;
      } catch (e) {
        console.log('❌ Cache invalide, rechargement...');
      }
    }

    // Éviter les appels multiples pour la même application
    if (lastApplicationIdRef.current === applicationId && schedules.length > 0) {
      console.log('⏭️ Chargement ignoré - données déjà présentes pour:', applicationId);
      return;
    }

    // Annuler le timeout précédent s'il existe
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }

    setIsLoading(true);
    lastApplicationIdRef.current = applicationId;
    
    try {
      console.log('🔄 Chargement des créneaux pour application:', applicationId);
      
      // Récupérer seulement les créneaux nécessaires avec une requête optimisée
      const { data, error } = await supabase
        .from('interview_slots')
        .select('id, date, time, is_available, application_id, recruiter_id, candidate_id, created_at, updated_at')
        .or(`is_available.eq.true,application_id.eq.${applicationId}`)
        .gte('date', new Date().toISOString().split('T')[0]) // Seulement les dates futures
        .order('date', { ascending: true })
        .limit(100); // Limiter le nombre de résultats

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Données reçues:', data);

      // Optimisation : Organiser les créneaux par date avec Map plus efficace
      const schedulesMap = new Map<string, Map<string, InterviewSlot>>();
      
      data?.forEach(slot => {
        const date = slot.date;
        const time = slot.time;
        
        if (!schedulesMap.has(date)) {
          schedulesMap.set(date, new Map());
        }
        
        schedulesMap.get(date)!.set(time, {
          id: slot.id,
          date: slot.date,
          time: slot.time,
          isAvailable: slot.is_available,
          applicationId: slot.application_id,
          recruiterId: slot.recruiter_id,
          candidateId: slot.candidate_id,
          createdAt: slot.created_at,
          updatedAt: slot.updated_at
        });
      });

      // Convertir en array avec génération optimisée des créneaux manquants
      const schedules: InterviewSchedule[] = [];
      schedulesMap.forEach((timeMap, date) => {
        const allSlots: InterviewSlot[] = timeSlots.map(time => {
          return timeMap.get(time) || {
            date,
            time,
            isAvailable: true,
            applicationId: undefined
          };
        });
        schedules.push({ date, slots: allSlots });
      });

      console.log('📅 Schedules générés:', schedules);
      
      // Mettre en cache les données pour 30 secondes
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(schedules));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      } catch (e) {
        console.log('⚠️ Impossible de mettre en cache');
      }
      
      setSchedules(schedules);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des créneaux:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux d'entretien",
        variant: "destructive",
      });
    } finally {
      // Délai pour éviter les changements d'état trop rapides
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 200);
    }
  }, [applicationId, toast, schedules.length, timeSlots]);

  // Programmer un entretien
  const scheduleInterview = useCallback(async (date: string, time: string) => {
    if (!applicationId || !user) return false;

    setIsSaving(true);
    try {
      const normalizedTime = normalizeTimeToHms(time);
      console.log('🔄 Programmation entretien pour:', { date, time: normalizedTime, applicationId, userId: user.id });

      // Récupérer les informations du job et du candidat pour remplir les champs obligatoires
      const { data: applicationDetails, error: appDetailsError } = await supabase
        .from('applications')
        .select(`
          candidate_id,
          job_offer_id,
          users:users!applications_candidate_id_fkey(first_name, last_name),
          job_offers:job_offers!applications_job_offer_id_fkey(title)
        `)
        .eq('id', applicationId)
        .single();

      if (appDetailsError) {
        console.error('❌ Erreur lors de la récupération des détails:', appDetailsError);
        throw appDetailsError;
      }

      // Certains retours de jointure peuvent être typés comme des tableaux
      const appDet = applicationDetails as unknown as ApplicationDetails;
      const usersField = appDet.users;
      const jobOffersField = appDet.job_offers;
      const userRecord: LinkedUserRecord | undefined = Array.isArray(usersField) ? usersField[0] : usersField;
      const jobOfferRecord: LinkedJobOfferRecord | undefined = Array.isArray(jobOffersField) ? jobOffersField[0] : jobOffersField;

      const candidateName = `${userRecord?.first_name || ''} ${userRecord?.last_name || ''}`.trim();
      const jobTitle = jobOfferRecord?.title || 'Poste non spécifié';

      console.log('📋 Détails récupérés:', { candidateName, jobTitle, candidateId: applicationDetails.candidate_id });

      // Vérifier si le créneau existe déjà et s'il est occupé
      const { data: existingSlot, error: checkError } = await supabase
        .from('interview_slots')
        .select('id, application_id, is_available')
        .eq('date', date)
        .eq('time', normalizedTime)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erreur lors de la vérification du créneau:', checkError);
        throw checkError;
      }

      // Si le créneau existe et est occupé par une autre application
      if (existingSlot && existingSlot.application_id && existingSlot.application_id !== applicationId && !existingSlot.is_available) {
        toast({
          title: "Créneau occupé",
          description: "Ce créneau est déjà réservé par une autre candidature",
          variant: "destructive",
        });
        return false;
      }

      let insertError;
      if (existingSlot) {
        // Mettre à jour le créneau existant
        const { error } = await supabase
          .from('interview_slots')
          .update({
            application_id: applicationId,
            candidate_name: candidateName,
            job_title: jobTitle,
            status: 'scheduled',
            is_available: false,
            recruiter_id: user.id,
            candidate_id: applicationDetails.candidate_id,
            notes: 'Entretien programmé',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSlot.id);
        insertError = error;
      } else {
        // Créer ou mettre à jour via upsert en cas de conflit (date,time).
        // Si l'upsert renvoie 400 (contrainte unique manquante), fallback insert->update en cas de doublon.
        let upsertError;
        try {
          const { error } = await supabase
            .from('interview_slots')
            .upsert({
              date,
              time: normalizedTime,
              application_id: applicationId,
              candidate_name: candidateName,
              job_title: jobTitle,
              status: 'scheduled',
              is_available: false,
              recruiter_id: user.id,
              candidate_id: applicationDetails.candidate_id,
              notes: 'Entretien programmé',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'date,time' });
          upsertError = error;
        } catch (e) {
          // cas rare: throw réseau
          upsertError = e as unknown as { code?: string; message?: string };
        }

        if (upsertError) {
          // Fallback: tentative d'insert simple
          const { error: insErr } = await supabase
            .from('interview_slots')
            .insert({
              date,
              time: normalizedTime,
              application_id: applicationId,
              candidate_name: candidateName,
              job_title: jobTitle,
              status: 'scheduled',
              is_available: false,
              recruiter_id: user.id,
              candidate_id: applicationDetails.candidate_id,
              notes: 'Entretien programmé',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insErr && (insErr as unknown as { code?: string }).code === '23505') {
            // Doublon: Update du slot existant sur (date,time)
            const { error: updErr } = await supabase
              .from('interview_slots')
              .update({
                application_id: applicationId,
                candidate_name: candidateName,
                job_title: jobTitle,
                status: 'scheduled',
                is_available: false,
                recruiter_id: user.id,
                candidate_id: applicationDetails.candidate_id,
                notes: 'Entretien programmé',
                updated_at: new Date().toISOString()
              })
              .eq('date', date)
              .eq('time', normalizedTime);
            insertError = updErr;
          } else {
            insertError = insErr;
          }
        } else {
          insertError = undefined;
        }
      }

      if (insertError) {
        console.error('❌ Erreur lors de la création du créneau:', insertError);
        throw insertError;
      }

      // Invalider le cache après une programmation réussie
      const cacheKey = `slots_${applicationId}`;
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(`${cacheKey}_time`);

      // Mettre à jour l'application avec la date d'entretien
      const interviewDateTime = new Date(`${date}T${normalizedTime}`);
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          interview_date: interviewDateTime.toISOString(),
          status: 'entretien_programme',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour de l\'application:', updateError);
        throw updateError;
      }

      toast({
        title: "Entretien programmé",
        description: `Félicitations, votre candidature a été retenue. Vous avez un entretien programmé pour le ${new Date(date).toLocaleDateString('fr-FR')} à ${normalizedTime.slice(0,5)} suite à votre candidature pour le poste de ${jobTitle}`,
      });

      // Recharger les créneaux
      lastApplicationIdRef.current = undefined; // Force le rechargement
      await loadInterviewSlots();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la programmation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer l'entretien",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, user, toast, loadInterviewSlots, normalizeTimeToHms]);

  // Annuler un entretien
  const cancelInterview = useCallback(async (date: string, time: string) => {
    if (!applicationId) return false;

    setIsSaving(true);
    try {
      // Marquer le créneau comme disponible
      const normalizedTime = normalizeTimeToHms(time);
      const { error } = await supabase
        .from('interview_slots')
        .update({
          is_available: true,
          status: 'cancelled',
          recruiter_id: null,
          candidate_id: null,
          notes: 'Créneau libéré',
          updated_at: new Date().toISOString()
        })
        .eq('date', date)
        .eq('time', normalizedTime)
        .eq('application_id', applicationId);

      if (error) throw error;

      // Mettre à jour l'application
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          interview_date: null,
          status: 'candidature',
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      toast({
        title: "Entretien annulé",
        description: "L'entretien a été annulé",
      });

      // Recharger les créneaux
      lastApplicationIdRef.current = undefined; // Force le rechargement
      await loadInterviewSlots();
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'annulation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'entretien",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, toast, loadInterviewSlots, normalizeTimeToHms]);

  // Vérifier si un créneau est occupé
  const isSlotBusy = useCallback((date: string, time: string) => {
    const schedule = schedules.find(s => s.date === date);
    if (!schedule) return false;
    
    const slot = schedule.slots.find(s => s.time === time);
    return slot ? !slot.isAvailable : false;
  }, [schedules]);

  // Vérifier si une date est complètement occupée
  const isDateFullyBooked = useCallback((date: string) => {
    const schedule = schedules.find(s => s.date === date);
    if (!schedule) return false;
    
    return schedule.slots.every(slot => !slot.isAvailable);
  }, [schedules]);

  // Obtenir les créneaux disponibles pour une date
  const getAvailableSlots = useCallback((date: string) => {
    const schedule = schedules.find(s => s.date === date);
    if (!schedule) return timeSlots;
    
    return schedule.slots
      .filter(slot => slot.isAvailable)
      .map(slot => slot.time);
  }, [schedules, timeSlots]);

  // Générer le calendrier pour un mois donné
  const generateCalendar = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Générer 42 jours (6 semaines)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return { days, firstDay, lastDay };
  }, []);

  // Charger les créneaux au montage du composant
  useEffect(() => {
    loadInterviewSlots();
    
    // Cleanup function
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loadInterviewSlots]);

  // Fonction pour forcer le rechargement
  const forceReload = useCallback(() => {
    lastApplicationIdRef.current = undefined;
    loadInterviewSlots();
  }, [loadInterviewSlots]);

  return {
    schedules,
    isLoading,
    isSaving,
    timeSlots,
    loadInterviewSlots,
    forceReload,
    scheduleInterview,
    cancelInterview,
    isSlotBusy,
    isDateFullyBooked,
    getAvailableSlots,
    generateCalendar
  };
};
