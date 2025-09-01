import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface InterviewSlot {
  id?: string;
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:MM
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

  // Créneaux horaires disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00'
  ];

  // Charger les créneaux d'entretien
  const loadInterviewSlots = useCallback(async () => {
    if (!applicationId) return;

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
      
      // Récupérer tous les créneaux disponibles et ceux réservés pour cette application
      const { data, error } = await supabase
        .from('interview_slots')
        .select('*')
        .or(`is_available.eq.true,application_id.eq.${applicationId}`)
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      console.log('✅ Données reçues:', data);

      // Organiser les créneaux par date
      const schedulesMap = new Map<string, InterviewSlot[]>();
      
      data?.forEach(slot => {
        const date = slot.date;
        if (!schedulesMap.has(date)) {
          schedulesMap.set(date, []);
        }
        schedulesMap.get(date)!.push({
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

      // Convertir en array et s'assurer que toutes les heures sont présentes
      const schedules: InterviewSchedule[] = [];
      schedulesMap.forEach((slots, date) => {
        const allSlots: InterviewSlot[] = timeSlots.map(time => {
          const existingSlot = slots.find(slot => slot.time === time);
          return existingSlot || {
            date,
            time,
            isAvailable: true,
            applicationId: undefined
          };
        });
        schedules.push({ date, slots: allSlots });
      });

      console.log('📅 Schedules générés:', schedules);
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
  }, [applicationId, toast, schedules.length]);

  // Programmer un entretien
  const scheduleInterview = useCallback(async (date: string, time: string) => {
    if (!applicationId || !user) return false;

    setIsSaving(true);
    try {
      console.log('🔄 Programmation entretien pour:', { date, time, applicationId, userId: user.id });

      // Vérifier si le créneau est déjà pris
      const { data: existingSlots, error: checkError } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('date', date)
        .eq('time', time)
        .eq('is_available', false);

      if (checkError) {
        console.error('❌ Erreur lors de la vérification du créneau:', checkError);
        throw checkError;
      }

      if (existingSlots && existingSlots.length > 0) {
        toast({
          title: "Créneau occupé",
          description: "Ce créneau est déjà réservé",
          variant: "destructive",
        });
        return false;
      }

      // Récupérer les informations du job et du candidat pour remplir les champs obligatoires
      const { data: applicationDetails, error: appDetailsError } = await supabase
        .from('applications')
        .select(`
          candidate_id,
          job_offer_id,
          users!applications_candidate_id_fkey(first_name, last_name),
          job_offers!applications_job_offer_id_fkey(title)
        `)
        .eq('id', applicationId)
        .single();

      if (appDetailsError) {
        console.error('❌ Erreur lors de la récupération des détails:', appDetailsError);
        throw appDetailsError;
      }

      const candidateName = `${applicationDetails.users?.first_name || ''} ${applicationDetails.users?.last_name || ''}`.trim();
      const jobTitle = applicationDetails.job_offers?.title || 'Poste non spécifié';

      // Créer ou mettre à jour le créneau avec tous les champs obligatoires
      const { error: insertError } = await supabase
        .from('interview_slots')
        .upsert({
          date,
          time,
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
        }, {
          onConflict: 'date,time'
        });

      if (insertError) {
        console.error('❌ Erreur lors de la création du créneau:', insertError);
        throw insertError;
      }

      // Mettre à jour l'application avec la date d'entretien
      const interviewDateTime = new Date(`${date}T${time}`);
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
        description: `Entretien programmé le ${new Date(date).toLocaleDateString('fr-FR')} à ${time}`,
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
  }, [applicationId, user, toast, loadInterviewSlots]);

  // Annuler un entretien
  const cancelInterview = useCallback(async (date: string, time: string) => {
    if (!applicationId) return false;

    setIsSaving(true);
    try {
      // Marquer le créneau comme disponible
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
        .eq('time', time)
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
  }, [applicationId, toast, loadInterviewSlots]);

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
