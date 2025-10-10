import { useState, useEffect } from "react";
import { RecruiterLayout } from "@/components/layout/RecruiterLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Loader2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  matricule: string;
  request_type: string;
  status: string;
  created_at: string;
  users: {
    date_of_birth: string;
    sexe: string;
    adresse: string;
    statut: string;
  };
}

export default function AccessRequests() {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select(`
          *,
          users!access_requests_user_id_fkey(date_of_birth, sexe, adresse, statut)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
      toast.error("Erreur lors du chargement des demandes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Marquer toutes les demandes comme vues quand on arrive sur la page
    // (Seulement si la migration est appliquée)
    const markAsViewed = async () => {
      try {
        const { error } = await supabase.rpc('mark_all_access_requests_as_viewed');
        if (error) {
          console.log('Fonction mark_all_access_requests_as_viewed pas encore disponible (migration non appliquée)');
        }
      } catch (error) {
        console.log('Migration 20250110000003 pas encore appliquée - le système de "vu/non vu" sera activé après la migration');
      }
    };

    markAsViewed();

    // S'abonner aux changements en temps réel
    const channel = supabase
      .channel('access_requests_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'access_requests',
      }, () => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRequests(requests);
    } else {
      const filtered = requests.filter(req =>
        `${req.first_name} ${req.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.matricule?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRequests(filtered);
    }
  }, [searchTerm, requests]);

  const handleApprove = async (request: AccessRequest) => {
    setIsProcessing(true);
    try {
      // Approuver la demande
      const { error } = await supabase.rpc('approve_access_request', {
        request_id: request.id
      });

      if (error) throw error;

      // Envoyer l'email de validation
      await fetch('/api/send-access-approved-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: request.email,
          firstName: request.first_name,
          lastName: request.last_name,
          sexe: request.users.sexe,
        }),
      });

      toast.success("Demande approuvée ! Email envoyé au candidat.");
      fetchRequests();
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      toast.error(error.message || "Erreur lors de l'approbation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || rejectReason.trim().length < 20) {
      toast.error("Le motif de refus doit contenir au moins 20 caractères");
      return;
    }

    setIsProcessing(true);
    try {
      // Rejeter la demande avec le motif
      const { error } = await supabase.rpc('reject_access_request', {
        request_id: selectedRequest.id,
        p_rejection_reason: rejectReason
      });

      if (error) throw error;

      // Envoyer l'email de refus
      await fetch('/api/send-access-rejected-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedRequest.email,
          firstName: selectedRequest.first_name,
          lastName: selectedRequest.last_name,
          sexe: selectedRequest.users.sexe,
          reason: rejectReason,
        }),
      });

      toast.success("Demande rejetée. Email envoyé au candidat.");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      toast.error(error.message || "Erreur lors du rejet");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Approuvée</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Rejetée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <RecruiterLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCheck className="w-8 h-8" />
            Demandes d'Accès
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez les demandes d'accès des candidats internes sans email professionnel SEEG
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approuvées</p>
                  <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejetées</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recherche */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Rechercher une demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Rechercher par nom, email ou matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Liste des demandes */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "Aucune demande trouvée" : "Aucune demande d'accès pour le moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Informations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {request.first_name} {request.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.users?.sexe === 'M' ? 'Homme' : request.users?.sexe === 'F' ? 'Femme' : '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {request.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {request.phone || 'Non renseigné'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.matricule || <span className="text-gray-400">Non renseigné</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {request.users?.date_of_birth 
                                ? new Date(request.users.date_of_birth).toLocaleDateString('fr-FR')
                                : 'Non renseigné'}
                            </div>
                            <div className="flex items-center text-gray-500">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {request.users?.adresse || 'Non renseigné'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{new Date(request.created_at).toLocaleDateString('fr-FR')}</div>
                          <div className="text-xs">{new Date(request.created_at).toLocaleTimeString('fr-FR')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {request.status === 'pending' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                onClick={() => handleApprove(request)}
                                disabled={isProcessing}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {isProcessing ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approuver
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectModal(true);
                                }}
                                disabled={isProcessing}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Refuser
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal de Refus */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Refuser la Demande d'Accès</DialogTitle>
              <DialogDescription>
                Veuillez indiquer le motif du refus. Le candidat recevra un email avec cette information.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motif du refus (minimum 20 caractères)</Label>
                <Textarea
                  id="reason"
                  placeholder="Expliquez pourquoi cette demande est refusée..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className={rejectReason.length > 0 && rejectReason.length < 20 ? "border-red-500" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  {rejectReason.length} / 20 caractères minimum
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequest(null);
                }}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || rejectReason.trim().length < 20}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirmer le Refus
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RecruiterLayout>
  );
}

