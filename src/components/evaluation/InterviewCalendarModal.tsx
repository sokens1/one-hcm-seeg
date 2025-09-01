import React, { useState, useEffect } from 'react';
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

  // Charger tous les entretiens
  const loadInterviews = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 [CALENDAR DEBUG] Chargement des entretiens...');
      
      const { data, error } = await supabase
        .from('interview_slots')
        .select(`
          id,
          date,
          time,
          application_id,
          is_available,
          applications!inner(
            id,
            status,
            job_offers!inner(
              title
            ),
            users!inner(
              first_name,
              last_name
            )
          )
        `)
        .eq('is_available', false)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('❌ [CALENDAR DEBUG] Erreur lors du chargement des entretiens:', error);
        return;
      }

      console.log('✅ [CALENDAR DEBUG] Données reçues:', data);

      const formattedInterviews: Interview[] = (data || []).map((slot: any) => ({
        id: slot.id,
        application_id: slot.application_id,
        candidate_name: `${slot.applications.users.first_name} ${slot.applications.users.last_name}`,
        job_title: slot.applications.job_offers.title,
        date: slot.date,
        time: slot.time,
        status: 'scheduled' as const,
        location: 'Libreville',
      }));

      console.log('📅 [CALENDAR DEBUG] Entretiens formatés:', formattedInterviews);
      setInterviews(formattedInterviews);
    } catch (error) {
      console.error('❌ [CALENDAR DEBUG] Erreur lors du chargement des entretiens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInterviews();
    }
  }, [isOpen]);

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
    const dateString = format(date, 'yyyy-MM-dd');
    const interviewsForDate = interviews.filter(interview => interview.date === dateString);
    console.log(`📅 [CALENDAR DEBUG] Entretiens pour ${dateString}:`, interviewsForDate);
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
                        if (isCurrentMonthDate) {
                          console.log(`📅 [CALENDAR DEBUG] Date sélectionnée: ${format(date, 'yyyy-MM-dd')}`);
                          setSelectedDate(date);
                        }
                      }}
                      disabled={!isCurrentMonthDate}
                      className={cn(
                        "relative p-1 sm:p-2 text-xs sm:text-sm rounded-md transition-all duration-200 min-h-[50px] sm:min-h-[60px] flex flex-col items-center justify-start",
                        "hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        {
                          "bg-blue-500 text-white hover:bg-blue-600": isSelected,
                          "bg-orange-50 border border-orange-200": hasInterviewsOnDate && !isSelected,
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
                    Entretiens du {format(selectedDate, 'EEEE dd MMMM yyyy', { locale: fr })}
                  </h4>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Chargement...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
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
                                <span>{interview.time}</span>
                              </div>
                              {interview.location && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{interview.location}</span>
                                </div>
                              )}
                            </CardContent>
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
