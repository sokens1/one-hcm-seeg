import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data pour les candidats
const mockCandidates = [
  {
    id: 1,
    name: "Marie Dubois",
    email: "marie.dubois@email.com",
    position: "Développeur Frontend",
    appliedDate: "2024-01-15",
    status: "En cours",
    location: "Libreville"
  },
  {
    id: 2,
    name: "Jean Mvé",
    email: "jean.mve@email.com",
    position: "Chef de Projet",
    appliedDate: "2024-01-14",
    status: "Incubation",
    location: "Port-Gentil"
  },
  {
    id: 3,
    name: "Sarah Bongo",
    email: "sarah.bongo@email.com",
    position: "Analyste Financier",
    appliedDate: "2024-01-13",
    status: "Embauché",
    location: "Libreville"
  },
  {
    id: 4,
    name: "Pierre Ndong",
    email: "pierre.ndong@email.com",
    position: "Développeur Backend",
    appliedDate: "2024-01-12",
    status: "Refusé",
    location: "Franceville"
  },
  // ... autres candidats pour la pagination
];

// Générer plus de candidats pour la démonstration
const generateMockCandidates = () => {
  const names = ["Marie Dubois", "Jean Mvé", "Sarah Bongo", "Pierre Ndong", "Alice Koumba", "David Obame", "Claire Ekome", "Michel Nzé"];
  const positions = ["Développeur Frontend", "Chef de Projet", "Analyste Financier", "Développeur Backend", "Designer UX", "Manager Commercial"];
  const statuses = ["En cours", "Incubation", "Embauché", "Refusé"];
  const locations = ["Libreville", "Port-Gentil", "Franceville", "Oyem"];
  
  const candidates = [];
  for (let i = 1; i <= 50; i++) {
    candidates.push({
      id: i,
      name: names[Math.floor(Math.random() * names.length)],
      email: `candidate${i}@email.com`,
      position: positions[Math.floor(Math.random() * positions.length)],
      appliedDate: `2024-01-${String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      location: locations[Math.floor(Math.random() * locations.length)]
    });
  }
  return candidates;
};

export function CandidatesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 20;

  const allCandidates = generateMockCandidates();

  // Filtrage des candidats
  const filteredCandidates = allCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter;
    const matchesLocation = locationFilter === "all" || candidate.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesPosition && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const endIndex = startIndex + candidatesPerPage;
  const currentCandidates = filteredCandidates.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En cours":
        return "bg-blue-100 text-blue-800";
      case "Incubation":
        return "bg-yellow-100 text-yellow-800";
      case "Embauché":
        return "bg-green-100 text-green-800";
      case "Refusé":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">Liste des Candidats</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres et recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="En cours">En cours</SelectItem>
              <SelectItem value="Incubation">Incubation</SelectItem>
              <SelectItem value="Embauché">Embauché</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Poste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les postes</SelectItem>
              <SelectItem value="Développeur Frontend">Développeur Frontend</SelectItem>
              <SelectItem value="Chef de Projet">Chef de Projet</SelectItem>
              <SelectItem value="Analyste Financier">Analyste Financier</SelectItem>
              <SelectItem value="Développeur Backend">Développeur Backend</SelectItem>
            </SelectContent>
          </Select>

          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lieu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les lieux</SelectItem>
              <SelectItem value="Libreville">Libreville</SelectItem>
              <SelectItem value="Port-Gentil">Port-Gentil</SelectItem>
              <SelectItem value="Franceville">Franceville</SelectItem>
              <SelectItem value="Oyem">Oyem</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrer
          </Button>
        </div>

        {/* Tableau des candidats */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidat</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{candidate.position}</TableCell>
                  <TableCell>{candidate.appliedDate}</TableCell>
                  <TableCell>{candidate.location}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(candidate.status)}>
                      {candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/recruiter/candidates/${candidate.id}/analysis`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Voir détails
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Affichage {startIndex + 1}-{Math.min(endIndex, filteredCandidates.length)} de {filteredCandidates.length} candidats
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}