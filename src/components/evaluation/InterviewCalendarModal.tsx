/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const timeSlots = ['09:00:00','10:00:00','11:00:00','14:00:00','15:00:00','16:00:00'];

  // Charger tous les entretiens
  const loadInterviews = useCallback(async () => {
    setIsLoading(true);
    try {
      // console.log('🔄 [CALENDAR DEBUG] Chargement des entretiens...');
      
      // 1) Récupérer les créneaux sans jointures complexes (évite 400)
      // Déterminer la fenêtre du mois courant pour charger tous les jours visibles
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const monthStartStr = format(monthStart, 'yyyy-MM-dd');
      const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

      const { data: slots, error: slotsError } = await supabase
        .from('interview_slots')
        .select('id, date, time, application_id, is_available')
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

      // console.log('✅ [CALENDAR DEBUG] Créneaux reçus:', slots);

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

      // 3) Fusionner slots + applications
      const formattedInterviews: Interview[] = (slots || []).map((slot: any) => {
        const app = slot.application_id ? applicationsById[slot.application_id] : undefined;
        const firstName = app?.users?.first_name ?? '';
        const lastName = app?.users?.last_name ?? '';
        const jobTitle = app?.job_offers?.title ?? '';

        return {
          id: slot.id,
          application_id: slot.application_id,
          candidate_name: `${firstName} ${lastName}`.trim(),
          job_title: jobTitle,
          date: slot.date,
          time: slot.time,
          status: 'scheduled',
          location: 'Libreville',
        } as Interview;
      });

      // console.log('📅 [CALENDAR DEBUG] Entretiens formatés:', formattedInterviews);
      setInterviews(formattedInterviews);
    } catch (error) {
      console.error('❌ [CALENDAR DEBUG] Erreur lors du chargement des entretiens:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentMonth]);

  const startEditingInterview = (interview: Interview) => {
    setIsEditing(true);
    setEditingInterview(interview);
    setDraftDate(interview.date);
    // Normaliser heure -> HH:mm:ss
    const t = interview.time.match(/^\d{2}:\d{2}(:\d{2})?$/) ? (interview.time.length === 5 ? `${interview.time}:00` : interview.time) : interview.time;
    setDraftTime(t);
    // Pré-sélectionner la date sur le calendrier
    try { setSelectedDate(new Date(`${interview.date}T00:00:00`)); } catch (e) { console.debug('📅 [CALENDAR DEBUG] Erreur de parsing date en édition:', e); }
  };

  const saveEditingInterview = async () => {
    if (!isEditing || !editingInterview || !draftDate || !draftTime) return;
    // Validation
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(draftDate);
    const isValidTime = /^([01]?\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(draftTime);
    if (!isValidDate || !isValidTime) {
      return;
    }
    
    // Mettre à jour le slot d'entretien
    const { error: updateError } = await supabase
      .from('interview_slots')
      .update({ date: draftDate, time: draftTime })
      .eq('id', editingInterview.id);
    if (updateError) {
      console.error('❌ [CALENDAR DEBUG] Erreur mise à jour entretien:', updateError);
      return;
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
        console.log('✅ [CALENDAR DEBUG] Application mise à jour avec nouvelle date/heure');
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
        console.log('ℹ️ [CALENDAR DEBUG] Pas de protocol1_evaluation à mettre à jour ou erreur:', protocolUpdateError);
      } else {
        console.log('✅ [CALENDAR DEBUG] Protocol1_evaluation mise à jour avec nouvelle date/heure');
      }
    }
    
    console.log('✅ [CALENDAR DEBUG] Entretien mis à jour');
    setIsEditing(false);
    setEditingInterview(null);
    await loadInterviews();
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
            <div className="w-full lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-4 overflow-y-auto">
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
                              <div className="flex flex-wrap gap-2">
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