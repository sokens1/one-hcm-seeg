import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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

  // Créneaux horaires disponibles
  const timeSlots = [
    '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00'
  ];

  // Charger les créneaux d'entretien
  const loadInterviewSlots = useCallback(async () => {
    if (!applicationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('application_id', applicationId)
        .order('date', { ascending: true });

      if (error) throw error;

      // Organiser les créneaux par date
      const schedulesMap = new Map<string, InterviewSlot[]>();
      
      data?.forEach(slot => {
        const date = slot.date;
        if (!schedulesMap.has(date)) {
          schedulesMap.set(date, []);
        }
        schedulesMap.get(date)!.push(slot);
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
            applicationId
          };
        });
        schedules.push({ date, slots: allSlots });
      });

      setSchedules(schedules);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les créneaux d'entretien",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, timeSlots, toast]);

  // Programmer un entretien
  const scheduleInterview = useCallback(async (date: string, time: string) => {
    if (!applicationId) return false;

    setIsSaving(true);
    try {
      // Vérifier si le créneau est déjà pris
      const { data: existingSlot, error: checkError } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('date', date)
        .eq('time', time)
        .eq('is_available', false)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingSlot) {
        toast({
          title: "Créneau occupé",
          description: "Ce créneau est déjà réservé",
          variant: "destructive",
        });
        return false;
      }

      // Créer ou mettre à jour le créneau
      const { error } = await supabase
        .from('interview_slots')
        .upsert({
          date,
          time,
          is_available: false,
          application_id: applicationId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

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

      if (updateError) throw updateError;

      toast({
        title: "Entretien programmé",
        description: `Entretien programmé le ${new Date(date).toLocaleDateString('fr-FR')} à ${time}`,
      });

      // Recharger les créneaux
      await loadInterviewSlots();
      return true;
    } catch (error) {
      console.error('Erreur lors de la programmation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de programmer l'entretien",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [applicationId, toast, loadInterviewSlots]);

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
          application_id: null,
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
      await loadInterviewSlots();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
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
  }, [loadInterviewSlots]);

  return {
    schedules,
    isLoading,
    isSaving,
    timeSlots,
    loadInterviewSlots,
    scheduleInterview,
    cancelInterview,
    isSlotBusy,
    isDateFullyBooked,
    getAvailableSlots,
    generateCalendar
  };
};
