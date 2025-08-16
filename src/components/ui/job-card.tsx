import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Briefcase } from "lucide-react";

interface JobCardProps {
  title: string;
  location: string;
  contractType: string;
  description?: string;
  isPreview?: boolean;
  candidateCount?: number;
  onClick?: () => void;
}

export function JobCard({ 
  title, 
  location, 
  contractType, 
  description, 
  isPreview = false,
  candidateCount,
  onClick 
}: JobCardProps) {
  return (
    <Card className="hover:shadow-medium transition-all duration-300 cursor-pointer group h-full flex flex-col" onClick={onClick}>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex-1 space-y-3 flex flex-col">
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {contractType}
              </div>
            </div>

            {description && (
              <p className="text-muted-foreground line-clamp-3 text-sm flex-1">
                {description}
              </p>
            )}

            {candidateCount !== undefined && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-success-light text-success-foreground">
                  {candidateCount} {candidateCount === 1 ? 'candidat' : 'candidats'}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Publié il y a 2 jours
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            {isPreview ? (
              <Button variant="hero" size="sm">
                Voir l'offre
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="group-hover:border-primary group-hover:text-primary">
                {candidateCount !== undefined ? 'Gérer' : 'Postuler'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}