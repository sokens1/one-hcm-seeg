import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Filter, Mail, Eye, Phone, MapPin, Calendar, User } from "lucide-react";
import { Link } from "react-router-dom";

// Types
interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  appliedDate: string;
  status: 'new' | 'preselected' | 'interview' | 'offer' | 'rejected';
  jobTitle: string;
  experience: string;
}

// Mock data - tous les candidats
const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Obame",
    email: "marie.obame@email.com",
    phone: "+241 XX XX XX XX",
    location: "Libreville",
    appliedDate: "2024-01-15",
    status: "new",
    jobTitle: "Directeur des Ressources Humaines",
    experience: "8 ans"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Ndong",
    email: "jean.ndong@email.com",
    phone: "+241 XX XX XX XX",
    location: "Port-Gentil",
    appliedDate: "2024-01-14",
    status: "new",
    jobTitle: "Directeur des Ressources Humaines",
    experience: "10 ans"
  },
  {
    id: 3,
    firstName: "Sarah",
    lastName: "Mba",
    email: "sarah.mba@email.com",
    phone: "+241 XX XX XX XX",
    location: "Libreville",
    appliedDate: "2024-01-13",
    status: "preselected",
    jobTitle: "Directeur Commercial",
    experience: "12 ans"
  },
  {
    id: 4,
    firstName: "Paul",
    lastName: "Nze",
    email: "paul.nze@email.com",
    phone: "+241 XX XX XX XX",
    location: "Franceville",
    appliedDate: "2024-01-12",
    status: "interview",
    jobTitle: "Directeur Technique",
    experience: "15 ans"
  },
  {
    id: 5,
    firstName: "Lucie",
    lastName: "Ondo",
    email: "lucie.ondo@email.com",
    phone: "+241 XX XX XX XX",
    location: "Libreville",
    appliedDate: "2024-01-10",
    status: "offer",
    jobTitle: "Directeur Financier",
    experience: "9 ans"
  },
  {
    id: 6,
    firstName: "Antoine",
    lastName: "Mvé",
    email: "antoine.mve@email.com",
    phone: "+241 XX XX XX XX",
    location: "Oyem",
    appliedDate: "2024-01-09",
    status: "rejected",
    jobTitle: "Directeur des Systèmes d'Information",
    experience: "7 ans"
  }
];

const statusConfig = {
  new: { label: "Nouveaux", color: "bg-blue-100 text-blue-800 border-blue-200" },
  preselected: { label: "Présélectionnés", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  interview: { label: "Entretien", color: "bg-purple-100 text-purple-800 border-purple-200" },
  offer: { label: "Sélection retenus", color: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Refusés", color: "bg-red-100 text-red-800 border-red-200" }
};

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Tous les Candidats
            </h1>
            <p className="text-muted-foreground">
              Gérez et suivez tous les candidats qui ont postulé aux offres SEEG
            </p>
          </div>
          <Link to="/recruiter">
            <Button variant="outline">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou poste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Tous
            </Button>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {config.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{mockCandidates.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = mockCandidates.filter(c => c.status === status).length;
            return (
              <Card key={status}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">{count}</div>
                  <div className="text-sm text-muted-foreground">{config.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Candidates Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-4 font-medium text-foreground">Candidat</th>
                    <th className="text-left p-4 font-medium text-foreground">Contact</th>
                    <th className="text-left p-4 font-medium text-foreground">Poste</th>
                    <th className="text-left p-4 font-medium text-foreground">Statut</th>
                    <th className="text-left p-4 font-medium text-foreground">Date</th>
                    <th className="text-left p-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-dark/10 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-primary-dark" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {candidate.firstName} {candidate.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{candidate.experience} d'expérience</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{candidate.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{candidate.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-foreground">{candidate.jobTitle}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className={statusConfig[candidate.status].color}>
                          {statusConfig[candidate.status].label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Eye className="w-4 h-4" />
                            CV
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Contact
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Aucun candidat trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Aucun candidat ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}