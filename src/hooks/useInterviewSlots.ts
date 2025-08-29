import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InterviewSlot {
  id: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM
  application_id: string;
  candidate_name: string;
  job_title: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  applicationId?: string;
  candidateName?: string;
}

export const useInterviewSlots = () => {
  const [bookedSlots, setBookedSlots] = useState<InterviewSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Créneaux horaires d'1 heure (9h-12h, 14h-17h)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00'
  ];

  // Charger tous les créneaux réservés
  const loadBookedSlots = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_slots')
        .select('*')
        .eq('status', 'scheduled')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement des créneaux:', error);
        return;
      }

      setBookedSlots(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des créneaux:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vérifier si un créneau est occupé
  const isSlotBooked = useCallback((date: Date, time: string): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedSlots.some(slot => 
      slot.date === dateStr && 
      slot.time === time && 
      slot.status === 'scheduled'
    );
  }, [bookedSlots]);

  // Obtenir les créneaux disponibles pour une date
  const getAvailableSlots = useCallback((date: Date): TimeSlot[] => {
    const dateStr = date.toISOString().split('T')[0];
    
    return timeSlots.map(time => {
      const bookedSlot = bookedSlots.find(slot => 
        slot.date === dateStr && 
        slot.time === time && 
        slot.status === 'scheduled'
      );
      
      return {
        time,
        isAvailable: !bookedSlot,
        applicationId: bookedSlot?.application_id,
        candidateName: bookedSlot?.candidate_name
      };
    });
  }, [bookedSlots, timeSlots]);

  // Réserver un créneau
  const bookSlot = useCallback(async (
    date: Date, 
    time: string, 
    applicationId: string, 
    candidateName: string, 
    jobTitle: string
  ): Promise<boolean> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Vérifier si le créneau est déjà pris
      if (isSlotBooked(date, time)) {
        throw new Error('Ce créneau est déjà réservé');
      }

      // Annuler l'ancien créneau s'il existe
      const { error: cancelError } = await supabase
        .from('interview_slots')
        .update({ status: 'cancelled' })
        .eq('application_id', applicationId)
        .eq('status', 'scheduled');

      if (cancelError) {
        console.error('Erreur lors de l\'annulation de l\'ancien créneau:', cancelError);
      }

      // Créer le nouveau créneau
      const { error: insertError } = await supabase
        .from('interview_slots')
        .insert({
          date: dateStr,
          time,
          application_id: applicationId,
          candidate_name: candidateName,
          job_title: jobTitle,
          status: 'scheduled'
        });

      if (insertError) {
        throw insertError;
      }

      // Recharger les créneaux
      await loadBookedSlots();
      return true;
    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      return false;
    }
  }, [isSlotBooked, loadBookedSlots]);

  // Annuler un créneau
  const cancelSlot = useCallback(async (applicationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('interview_slots')
        .update({ status: 'cancelled' })
        .eq('application_id', applicationId)
        .eq('status', 'scheduled');

      if (error) {
        throw error;
      }

      // Recharger les créneaux
      await loadBookedSlots();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
      return false;
    }
  }, [loadBookedSlots]);

  // Obtenir le créneau réservé pour une candidature
  const getBookedSlotForApplication = useCallback((applicationId: string): InterviewSlot | undefined => {
    return bookedSlots.find(slot => 
      slot.application_id === applicationId && 
      slot.status === 'scheduled'
    );
  }, [bookedSlots]);

  // Vérifier si une date est complètement occupée
  const isDateFullyBooked = useCallback((date: Date): boolean => {
    const availableSlots = getAvailableSlots(date);
    return availableSlots.every(slot => !slot.isAvailable);
  }, [getAvailableSlots]);

  // Vérifier si une date est partiellement occupée
  const isDatePartiallyBooked = useCallback((date: Date): boolean => {
    const availableSlots = getAvailableSlots(date);
    const hasAvailable = availableSlots.some(slot => slot.isAvailable);
    const hasBooked = availableSlots.some(slot => !slot.isAvailable);
    return hasAvailable && hasBooked;
  }, [getAvailableSlots]);

  // Charger les créneaux au montage du composant
  useEffect(() => {
    loadBookedSlots();
  }, [loadBookedSlots]);

  // Écouter les changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('interview_slots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_slots'
        },
        () => {
          // Recharger les créneaux quand il y a des changements
          loadBookedSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadBookedSlots]);

  return {
    bookedSlots,
    isLoading,
    timeSlots,
    isSlotBooked,
    getAvailableSlots,
    bookSlot,
    cancelSlot,
    getBookedSlotForApplication,
    isDateFullyBooked,
    isDatePartiallyBooked,
    loadBookedSlots
  };
};
