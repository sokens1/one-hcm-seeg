/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, User, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { supabase } from '@/integrations/supabase/client';

interface Interview {
  id: string;
  application_id: string;
  candidate_name: string;
  job_title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface InterviewCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentApplicationId?: string;
}

export const InterviewCalendarModal: React.FC<InterviewCalendarModalProps> = ({
  isOpen,
  onClose,
  currentApplicationId
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null); // yyyy-MM-dd
  const [draftTime, setDraftTime] = useState<string | null>(null); // HH:mm:ss
  const timeSlots = ['08:00:00','09:00:00','10:00:00','11:00:00','13:00:00','14:00:00','15:00:00','16:00:00','17:00:00'];

  // Charger tous les entretiens
  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      //console.log('🔄 [CALENDAR DEBUG] Chargement des entretiens...');
      
      // 1) Récupérer les créneaux sans jointures complexes (évite 400)
      // Déterminer la fenêtre du mois courant pour charger tous les jours visibles
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const monthStartStr = format(monthStart, 'yyyy-MM-dd');
      const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
      
      //console.log('🔄 [CALENDAR DEBUG] Période de chargement:', { monthStartStr, monthEndStr });

      const { data: slots, error: slotsError } = await supabase
        .from('interview_slots')
        .select('id, date, time, application_id, is_available, candidate_name, job_title, status, created_at, updated_at')
        .eq('is_available', false)
        .not('application_id', 'is', null)
        .gte('date', monthStartStr)
        .lte('date', monthEndStr)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (slotsError) {
        console.error('❌ [CALENDAR DEBUG] Erreur lors du chargement des créneaux:', slotsError);
        return;
      }

      //console.log('✅ [CALENDAR DEBUG] Créneaux reçus:', slots?.length, 'créneaux');
      //console.log('✅ [CALENDAR DEBUG] Détail des créneaux:', slots);

      if (!slots || slots.length === 0) {
        setInterviews([]);
        return;
      }

      // 2) Récupérer les applications liées avec les infos utilisateur et offre
      const applicationIds = Array.from(new Set(slots.map((s: any) => s.application_id).filter(Boolean)));

      let applicationsById: Record<string, any> = {};
      if (applicationIds.length > 0) {
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select(`
            id,
            job_offers ( title ),
            users ( first_name, last_name )
          `)
          .in('id', applicationIds);

        if (appsError) {
          console.error('❌ [CALENDAR DEBUG] Erreur chargement applications:', appsError);
        } else {
          applicationsById = (apps || []).reduce((acc: Record<string, any>, app: any) => {
            acc[app.id] = app;
            return acc;
          }, {});
        }
      }

      // 3) Fusionner slots + applications (utiliser les données du slot en priorité)
      const allInterviews: Interview[] = (slots || []).map((slot: any) => {
        const app = slot.application_id ? applicationsById[slot.application_id] : undefined;
        const firstName = app?.users?.first_name ?? '';
        const lastName = app?.users?.last_name ?? '';
        const jobTitle = app?.job_offers?.title ?? '';

        return {
          id: slot.id,
          application_id: slot.application_id,
          candidate_name: slot.candidate_name || `${firstName} ${lastName}`.trim() || 'Candidat inconnu',
          job_title: slot.job_title || jobTitle || 'Poste non spécifié',
          date: slot.date,
          time: slot.time,
          status: (slot.status || 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
          location: 'Libreville',
          created_at: slot.created_at || new Date().toISOString(),
          updated_at: slot.updated_at || new Date().toISOString()
        } as Interview;
      });

      // 4) Filtrer pour ne garder que le dernier entretien par candidat (application_id)
      // Grouper par application_id et garder seulement le plus récent
      const interviewsByApplication = allInterviews.reduce((acc: Record<string, Interview[]>, interview) => {
        if (interview.application_id) {
          if (!acc[interview.application_id]) {
            acc[interview.application_id] = [];
          }
          acc[interview.application_id].push(interview);
        }
        return acc;
      }, {});

      // Pour chaque application, garder seulement le plus récent (par updated_at ou created_at)
      const formattedInterviews: Interview[] = Object.values(interviewsByApplication).map(applicationInterviews => {
        return applicationInterviews.sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          return dateB.getTime() - dateA.getTime(); // Plus récent en premier
        })[0]; // Prendre le premier (le plus récent)
      });

      //console.log('📅 [CALENDAR DEBUG] Entretiens avant filtrage:', allInterviews.length);
      //console.log('📅 [CALENDAR DEBUG] Entretiens après filtrage (dernier par candidat):', formattedInterviews.length);
      setInterviews(formattedInterviews);
    } catch (error) {
      console.error('❌ [CALENDAR DEBUG] Erreur lors du chargement des entretiens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  const startEditingInterview = (interview: Interview) => {
    //console.log('🔄 [CALENDAR DEBUG] Début de startEditingInterview');
    //console.log('🔄 [CALENDAR DEBUG] interview:', interview);
    
    setIsEditing(true);
    setEditingInterview(interview);
    setDraftDate(interview.date);
    
    // Normaliser heure -> HH:mm:ss
    const t = interview.time.match(/^\d{2}:\d{2}(:\d{2})?$/) ? (interview.time.length === 5 ? `${interview.time}:00` : interview.time) : interview.time;
    setDraftTime(t);
    
    //console.log('🔄 [CALENDAR DEBUG] draftDate défini:', interview.date);
    //console.log('🔄 [CALENDAR DEBUG] draftTime défini:', t);
    
    // Pré-sélectionner la date sur le calendrier
    try { setSelectedDate(new Date(`${interview.date}T00:00:00`)); } catch (e) { console.debug('📅 [CALENDAR DEBUG] Erreur de parsing date en édition:', e); }
  };

  const saveEditingInterview = async () => {
    //console.log('🔄 [CALENDAR DEBUG] Début de saveEditingInterview');
    //console.log('🔄 [CALENDAR DEBUG] isEditing:', isEditing);
    //console.log('🔄 [CALENDAR DEBUG] editingInterview:', editingInterview);
    //console.log('🔄 [CALENDAR DEBUG] draftDate:', draftDate);
    //console.log('🔄 [CALENDAR DEBUG] draftTime:', draftTime);
    
    if (!isEditing || !editingInterview || !draftDate || !draftTime) {
      //console.log('❌ [CALENDAR DEBUG] Conditions de validation non remplies');
      return;
    }
    
    // Validation
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(draftDate);
    const isValidTime = /^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(draftTime);
    //console.log('🔄 [CALENDAR DEBUG] isValidDate:', isValidDate);
    //console.log('🔄 [CALENDAR DEBUG] isValidTime:', isValidTime);
    
    if (!isValidDate || !isValidTime) {
      //console.log('❌ [CALENDAR DEBUG] Validation échouée');
      return;
    }
    
    // Vérifier si la date ou l'heure a changé
    const dateChanged = editingInterview.date !== draftDate;
    const timeChanged = editingInterview.time !== draftTime;
    
    if (dateChanged || timeChanged) {
      // ✅ D'ABORD vérifier si le nouveau créneau existe et est occupé
      const { data: existingSlot, error: checkError } = await supabase
        .from('interview_slots')
        .select('id, application_id, is_available')
        .eq('date', draftDate)
        .eq('time', draftTime)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ [CALENDAR DEBUG] Erreur vérification nouveau créneau:', checkError);
        return;
      }
      
      // Si le nouveau créneau est occupé par un AUTRE candidat → ÉCHANGE ATOMIQUE
      if (existingSlot && existingSlot.application_id && existingSlot.application_id !== editingInterview.application_id && !existingSlot.is_available) {
        // Le swap gère TOUT automatiquement (échange + libération)
        const { data: swapResp, error: swapError } = await supabase.rpc('swap_interview_slots', {
          p_app_id_a: editingInterview.application_id,
          p_app_id_b: existingSlot.application_id,
        });
        if (swapError || !(swapResp as any)?.success) {
          console.error('❌ [CALENDAR DEBUG] Échec de l\'échange de créneaux:', swapError || swapResp);
          return;
        }
        // Succès -> notifier et recharger
        window.dispatchEvent(new CustomEvent('forceReloadSlots'));
        return;
      }
      
      // ✅ Le nouveau créneau est LIBRE → libérer l'ancien, puis créer/mettre à jour le nouveau
      // Libérer l'ancien créneau en le marquant comme disponible
      const { error: freeOldSlotError } = await supabase
        .from('interview_slots')
        .update({ 
          is_available: true,
          application_id: null,
          candidate_id: null,
          candidate_name: null,
          job_title: null,
          status: 'cancelled',
          notes: 'Créneau libéré lors de la modification',
          updated_at: new Date().toISOString()
        })
        .eq('date', editingInterview.date)
        .eq('time', editingInterview.time)
        .eq('application_id', editingInterview.application_id);
      
      if (freeOldSlotError) {
        console.error('❌ [CALENDAR DEBUG] Erreur libération ancien créneau:', freeOldSlotError);
        return;
      }
      
      if (existingSlot) {
        // Mettre à jour le créneau existant
        const { error: updateError } = await supabase
          .from('interview_slots')
          .update({
            application_id: editingInterview.application_id,
            candidate_name: editingInterview.candidate_name,
            job_title: editingInterview.job_title,
            status: 'scheduled',
            is_available: false,
            notes: 'Entretien programmé',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSlot.id);
        
        if (updateError) {
          console.error('❌ [CALENDAR DEBUG] Erreur mise à jour créneau existant:', updateError);
          return;
        }
      } else {
        // Créer un nouveau créneau
        const { error: insertError } = await supabase
          .from('interview_slots')
          .insert({
            date: draftDate,
            time: draftTime,
            application_id: editingInterview.application_id,
            candidate_name: editingInterview.candidate_name,
            job_title: editingInterview.job_title,
            status: 'scheduled',
            is_available: false,
            notes: 'Entretien programmé',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error('❌ [CALENDAR DEBUG] Erreur création nouveau créneau:', insertError);
          return;
        }
      }
    } else {
      // Si seule la date/heure n'a pas changé, juste mettre à jour les autres infos
      const { error: updateError } = await supabase
        .from('interview_slots')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', editingInterview.id);
      
      if (updateError) {
        console.error('❌ [CALENDAR DEBUG] Erreur mise à jour entretien:', updateError);
        return;
      }
    }

    // Mettre à jour aussi la table applications si l'entretien a un application_id
    if (editingInterview.application_id) {
      const interviewDateTime = new Date(`${draftDate}T${draftTime}`);
      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({
          interview_date: interviewDateTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingInterview.application_id);
      
      if (appUpdateError) {
        console.error('❌ [CALENDAR DEBUG] Erreur mise à jour application:', appUpdateError);
      } else {
        //console.log('✅ [CALENDAR DEBUG] Application mise à jour avec nouvelle date/heure');
      }

      // Mettre à jour aussi la table protocol1_evaluations si elle existe
      const { error: protocolUpdateError } = await supabase
        .from('protocol1_evaluations')
        .update({
          interview_date: interviewDateTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('application_id', editingInterview.application_id);
      
      if (protocolUpdateError) {
        //console.log('ℹ️ [CALENDAR DEBUG] Pas de protocol1_evaluation à mettre à jour ou erreur:', protocolUpdateError);
      } else {
        //console.log('✅ [CALENDAR DEBUG] Protocol1_evaluation mise à jour avec nouvelle date/heure');
      }
    }
    
    //console.log('✅ [CALENDAR DEBUG] Entretien mis à jour');
    
    // Afficher une notification de succès
    if (dateChanged || timeChanged) {
      //console.log('✅ [CALENDAR DEBUG] Modification effectuée avec succès - ancien créneau libéré');
    }
    
    setIsEditing(false);
    setEditingInterview(null);
    setDraftDate(null);
    setDraftTime(null);
    await loadInterviews();
    
    // Notifier les changements aux autres composants
    window.dispatchEvent(new CustomEvent('interviewSlotsUpdated', {
      detail: { action: 'updated', details: { oldDate: editingInterview.date, oldTime: editingInterview.time, newDate: draftDate, newTime: draftTime }, timestamp: Date.now() }
    }));
    
    //console.log('✅ [CALENDAR DEBUG] Fonction saveEditingInterview terminée avec succès');
  };

  const cancelEditingInterview = () => {
    setIsEditing(false);
    setEditingInterview(null);
    setDraftDate(null);
    setDraftTime(null);
  };

  useEffect(() => {
    if (isOpen) {
      loadInterviews();
    }
  }, [isOpen, loadInterviews]);

  // Écouter les mises à jour des créneaux depuis useInterviewScheduling
  useEffect(() => {
    const handleSlotsUpdate = (event: CustomEvent) => {
      const action = event.detail?.action || 'updated';
      const details = event.detail?.details;
      //console.log('🔄 [CALENDAR DEBUG] Rechargement calendrier suite à programmation entretien', { action, details });
      
      if (isOpen) {
        // Recharger les entretiens du calendrier
        loadInterviews();
        
        // Si c'est une création ou suppression, forcer le rechargement des créneaux
        if (action === 'created' || action === 'deleted') {
          setTimeout(() => {
            //console.log('🔄 [CALENDAR DEBUG] Force rechargement créneaux disponibles');
            window.dispatchEvent(new CustomEvent('forceReloadSlots'));
          }, 100);
        }
      }
    };

    const handleForceReload = () => {
      //console.log('🔄 [CALENDAR DEBUG] Force reload depuis programmation entretien');
      if (isOpen) {
        loadInterviews();
      }
    };

    window.addEventListener('interviewSlotsUpdated', handleSlotsUpdate as EventListener);
    window.addEventListener('forceReloadSlots', handleForceReload);
    return () => {
      window.removeEventListener('interviewSlotsUpdated', handleSlotsUpdate as EventListener);
      window.removeEventListener('forceReloadSlots', handleForceReload);
    };
  }, [isOpen, loadInterviews]);

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const generateCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    const firstDayOfWeek = start.getDay();
    const previousDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      previousDays.push(new Date(start.getTime() - (i + 1) * 24 * 60 * 60 * 1000));
    }

    const lastDayOfWeek = end.getDay();
    const nextDays = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      nextDays.push(new Date(end.getTime() + i * 24 * 60 * 60 * 1000));
    }

    return [...previousDays, ...days, ...nextDays];
  };

  const getInterviewsForDate = (date: Date) => {
    // Utiliser UTC pour éviter les problèmes de fuseau horaire
    const dateString = format(date, 'yyyy-MM-dd');
    const interviewsForDate = interviews.filter(interview => interview.date === dateString);
    // console.log(`📅 [CALENDAR DEBUG] Entretiens pour ${dateString}:`, interviewsForDate);
    return interviewsForDate;
  };

  const getInterviewCountForDate = (date: Date) => {
    return getInterviewsForDate(date).length;
  };

  const hasInterviews = (date: Date) => {
    return getInterviewCountForDate(date) > 0;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && isSameDay(date, selectedDate);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return isSameMonth(date, currentMonth);
  };

  const calendarDays = generateCalendarDays();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="flex-shrink-0 p-4 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Calendrier des Entretiens
            </DialogTitle>
          </div>
          <DialogDescription>
            Planifiez et gérez les entretiens avec les candidats. Sélectionnez une date pour voir les créneaux disponibles.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full gap-4 p-4 pt-2 overflow-hidden">
          {/* Navigation du mois */}
          <div className="flex items-center justify-between flex-shrink-0">
            <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h3>
            <Button variant="outline" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
            {/* Calendrier */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* En-têtes des jours */}
              <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                  <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Grille du calendrier */}
              <div className="grid grid-cols-7 gap-1 flex-1 min-h-0">
                {calendarDays.map((date, index) => {
                  const interviewCount = getInterviewCountForDate(date);
                  const hasInterviewsOnDate = hasInterviews(date);
                  const isSelected = isDateSelected(date);
                  const isTodayDate = isToday(date);
                  const isCurrentMonthDate = isCurrentMonth(date);

                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!isCurrentMonthDate) return;
                        const dayStr = format(date, 'yyyy-MM-dd');
                        // console.log(`📅 [CALENDAR DEBUG] Date sélectionnée: ${dayStr}`);
                        setSelectedDate(date);
                        if (isEditing) {
                          setDraftDate(dayStr);
                        }
                      }}
                      disabled={!isCurrentMonthDate}
                      className={cn(
                        "relative p-1 sm:p-2 text-xs sm:text-sm rounded-md transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col items-center justify-start",
                        "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        {
                          "bg-blue-500 text-white hover:bg-blue-600": isSelected,
                          "bg-green-50 border-2 border-green-500": hasInterviewsOnDate && !isSelected,
                          "text-gray-300 cursor-not-allowed": !isCurrentMonthDate,
                          "border-2 border-blue-500": isTodayDate && !isSelected && !hasInterviewsOnDate,
                          "hover:bg-gray-50": !isSelected && !hasInterviewsOnDate && isCurrentMonthDate,
                        }
                      )}
                    >
                      <span className="font-medium">{format(date, 'd')}</span>
                      {hasInterviewsOnDate && (
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "text-xs mt-1 px-1 py-0.5",
                            isSelected ? "bg-white text-blue-600" : "bg-orange-100 text-orange-800"
                          )}
                        >
                          {interviewCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Détails des entretiens pour la date sélectionnée */}
            <div className="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4 overflow-y-auto max-h-[400px] lg:max-h-[500px]">
              {selectedDate ? (
                <div>
                  <h4 className="font-semibold mb-4 text-base sm:text-lg">
                    Entretiens du {format(selectedDate, 'dd/MM/yyyy')}
                  </h4>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Chargement...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isEditing && editingInterview && (
                        <Card className="p-3 border-blue-200">
                          <CardHeader className="p-0 pb-2">
                            <CardTitle className="text-sm font-semibold">Modifier l'entretien</CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 space-y-2">
                            <div className="text-xs text-muted-foreground">Nouvelle date: {draftDate || '—'}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Heure:</span>
                              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {timeSlots.map(t => (
                                  <Button key={t} size="sm" variant={draftTime === t ? 'default' : 'outline'} onClick={() => setDraftTime(t)}>
                                    {t.slice(0,5)}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                              <Button variant="outline" size="sm" onClick={cancelEditingInterview}>Annuler</Button>
                              <Button size="sm" onClick={saveEditingInterview} disabled={!draftDate || !draftTime}>Enregistrer</Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      {getInterviewsForDate(selectedDate).length > 0 ? (
                        getInterviewsForDate(selectedDate).map((interview) => (
                          <Card key={interview.id} className="p-3">
                            <CardHeader className="p-0 pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-semibold line-clamp-2">
                                  {interview.candidate_name}
                                </CardTitle>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    interview.application_id === currentApplicationId && "bg-blue-100 text-blue-800 border-blue-300"
                                  )}
                                >
                                  {interview.application_id === currentApplicationId ? 'Actuel' : 'Autre'}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0 space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span className="line-clamp-1">{interview.job_title}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{interview.time.slice(0, 5)}</span>
                              </div>
                              {interview.location && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{interview.location}</span>
                                </div>
                              )}
                            </CardContent>
                            <div className="mt-2 flex justify-end">
                              <Button variant="outline" size="sm" onClick={() => startEditingInterview(interview)}>
                                Modifier
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Aucun entretien programmé</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sélectionnez une date pour voir les entretiens</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};