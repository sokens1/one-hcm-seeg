import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, X, Calendar, User, Briefcase } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { supabase } from "@/integrations/supabase/client";

interface Activity {
  id: string;
  description: string;
  job_title: string;
  candidate_name?: string;
  created_at: string;
  activity_type: string;
}

interface ActivityHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  const loadActivities = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_recruiter_activities', {
          p_limit: ITEMS_PER_PAGE,
          p_offset: (pageNum - 1) * ITEMS_PER_PAGE
        });

      if (fetchError) throw fetchError;

      const newActivities = data || [];
      
      if (reset || pageNum === 1) {
        setActivities(newActivities);
      } else {
        setActivities(prev => [...prev, ...newActivities]);
      }

      setHasMore(newActivities.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Erreur lors du chargement de l\'historique');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      loadActivities(page + 1, false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadActivities(1, true);
    }
  }, [isOpen, loadActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'application':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'status_change':
        return <Briefcase className="w-4 h-4 text-green-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'application':
        return 'default';
      case 'status_change':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Historique complet des activités
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Toutes les activités de recrutement récentes
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-red-500 mb-4">
                <Calendar className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Erreur de chargement</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" onClick={() => loadActivities(1, true)}>
                Réessayer
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                {activities.length === 0 && !isLoading ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune activité trouvée</p>
                  </div>
                ) : (
                  <>
                    {activities.map((activity, index) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-medium text-foreground">
                              {activity.description}
                            </p>
                            <Badge 
                              variant={getActivityBadgeVariant(activity.activity_type)}
                              className="text-xs flex-shrink-0"
                            >
                              {formatDistanceToNow(new Date(activity.created_at), { 
                                addSuffix: true, 
                                locale: fr 
                              })}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
                            <span className="font-medium">
                              📋 {activity.job_title}
                            </span>
                            {activity.candidate_name && (
                              <>
                                <span className="hidden sm:inline">•</span>
                                <span>👤 {activity.candidate_name}</span>
                              </>
                            )}
                            <span className="hidden sm:inline">•</span>
                            <span>
                              📅 {format(new Date(activity.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="flex justify-center pt-4">
                        <Button
                          variant="outline"
                          onClick={loadMore}
                          disabled={isLoading}
                          className="gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Chargement...
                            </>
                          ) : (
                            'Charger plus d\'activités'
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Loading indicator for initial load */}
                    {isLoading && activities.length === 0 && (
                      <div className="flex justify-center items-center py-12">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">
                            Chargement de l'historique...
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="flex-shrink-0 border-t pt-4">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              {activities.length} activité{activities.length !== 1 ? 's' : ''} chargée{activities.length !== 1 ? 's' : ''}
            </span>
            <span>
              Mis à jour automatiquement
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
