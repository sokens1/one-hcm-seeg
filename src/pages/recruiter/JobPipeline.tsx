import { useState } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Filter } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { JobPipelineBoard } from "@/components/recruiter/JobPipelineBoard";

// Mock data pour le job
const mockJob = {
  id: 1,
  title: "Directeur des Ressources Humaines",
  company: "SEEG",
  location: "Libreville",
  description: "Poste de direction stratégique pour la gestion des ressources humaines"
};

export default function JobPipeline() {
  const { id } = useParams();
  const [dateFilter, setDateFilter] = useState<string>("");

  return (
    <RecruiterLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/recruiter/jobs">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Pipeline pour : {mockJob.title}
              </h1>
              <p className="text-muted-foreground">
                Gérez les candidatures pour ce poste chez {mockJob.company}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        <JobPipelineBoard jobId={id || "1"} />
      </div>
    </RecruiterLayout>
  );
}