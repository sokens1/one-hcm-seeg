import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Eye, Mail, Phone } from "lucide-react";

interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  appliedDate: string;
  status: "candidature" | "incubation" | "embauche" | "refuse";
  location: string;
}

const mockCandidates: Candidate[] = [
  {
    id: 1,
    firstName: "Marie",
    lastName: "Dubois",
    email: "marie.dubois@email.com",
    phone: "+241 01 02 03 04",
    position: "Développeur React.js",
    appliedDate: "2024-01-15",
    status: "candidature",
    location: "Libreville"
  },
  {
    id: 2,
    firstName: "Jean",
    lastName: "Martin",
    email: "jean.martin@email.com",
    phone: "+241 05 06 07 08",
    position: "Chef de Projet Digital",
    appliedDate: "2024-01-14",
    status: "incubation",
    location: "Port-Gentil"
  },
  {
    id: 3,
    firstName: "Sophie",
    lastName: "Bernard",
    email: "sophie.bernard@email.com",
    phone: "+241 09 10 11 12",
    position: "Analyste Financier",
    appliedDate: "2024-01-13",
    status: "embauche",
    location: "Libreville"
  },
  // Ajout de candidats supplémentaires pour tester la pagination
  ...Array.from({ length: 25 }, (_, i) => ({
    id: i + 4,
    firstName: `Candidat${i + 4}`,
    lastName: `Nom${i + 4}`,
    email: `candidat${i + 4}@email.com`,
    phone: `+241 ${String(i + 4).padStart(2, '0')} XX XX XX`,
    position: ["Développeur React.js", "Chef de Projet Digital", "Analyste Financier"][i % 3],
    appliedDate: new Date(2024, 0, 15 - i).toISOString().split('T')[0],
    status: ["candidature", "incubation", "embauche", "refuse"][i % 4] as Candidate["status"],
    location: ["Libreville", "Port-Gentil", "Franceville"][i % 3]
  }))
];

const statusConfig = {
  candidature: { label: "Candidature", color: "bg-blue-100 text-blue-800" },
  incubation: { label: "Incubation", color: "bg-orange-100 text-orange-800" },
  embauche: { label: "Embauché", color: "bg-green-100 text-green-800" },
  refuse: { label: "Refusé", color: "bg-red-100 text-red-800" }
};

interface CandidatesListProps {
  onViewDetails: (candidateId: number) => void;
}

export function CandidatesList({ onViewDetails }: CandidatesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 20;

  // Filtrage des candidats
  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch = 
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    const matchesPosition = positionFilter === "all" || candidate.position === positionFilter;
    const matchesLocation = locationFilter === "all" || candidate.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesPosition && matchesLocation;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIndex = (currentPage - 1) * candidatesPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + candidatesPerPage);

  // Options uniques pour les filtres
  const uniquePositions = [...new Set(mockCandidates.map(c => c.position))];
  const uniqueLocations = [...new Set(mockCandidates.map(c => c.location))];

  return (
    <div className="space-y-6">
      {/* Section Liste des Candidats */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-xl">Liste des Candidats</CardTitle>
          
          {/* Barre de recherche et filtres */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Poste" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous postes</SelectItem>
                  {uniquePositions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Lieu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous lieux</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tableau des candidats */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidat</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {candidate.firstName} {candidate.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {candidate.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{candidate.position}</div>
                    </TableCell>
                    <TableCell>
                      {new Date(candidate.appliedDate).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[candidate.status].color}>
                        {statusConfig[candidate.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewDetails(candidate.id)}
                          className="gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Voir détails
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          Contact
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(startIndex + candidatesPerPage, filteredCandidates.length)} sur {filteredCandidates.length} candidats
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}