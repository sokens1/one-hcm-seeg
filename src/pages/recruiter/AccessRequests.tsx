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
          users!inner(date_of_birth, sexe, adresse, statut)
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
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      {/* En-tête */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center gap-2">
                            {request.first_name} {request.last_name}
                            {getStatusBadge(request.status)}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Demande créée le {new Date(request.created_at).toLocaleDateString('fr-FR')} à {new Date(request.created_at).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {/* Informations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.phone || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Matricule: {request.matricule || 'Non renseigné'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {request.users?.date_of_birth 
                              ? new Date(request.users.date_of_birth).toLocaleDateString('fr-FR')
                              : 'Non renseigné'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            Sexe: {request.users?.sexe === 'M' ? 'Homme' : request.users?.sexe === 'F' ? 'Femme' : 'Non renseigné'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{request.users?.adresse || 'Non renseigné'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {request.status === 'pending' && (
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleApprove(request)}
                            disabled={isProcessing}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approuver
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            disabled={isProcessing}
                            variant="destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Refuser
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

