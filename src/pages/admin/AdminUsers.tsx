import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Minimal typing to avoid drift with DB types
type DBUser = Tables<'users'>;
// Local editing type can include fields that might not yet be in generated Supabase types
type AdminUser = Partial<DBUser> & { sexe?: string | null; date_of_birth?: string | null };

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "recruteur", label: "Recruteur" },
  { value: "candidat", label: "Candidat" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<DBUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Create/Edit modal state
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [openDelete, setOpenDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("users")
      .select("id,email,matricule,role,first_name,last_name,phone,date_of_birth,created_at,updated_at,sexe")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      toast.error("Erreur de chargement: " + error.message);
    } else {
      setUsers((data as DBUser[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchesQ =
        u.email.toLowerCase().includes(q) ||
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
        (u.matricule || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      return matchesQ && matchesRole;
    });
  }, [users, search, roleFilter]);

  const resetForm = () => {
    setEditing(null);
  };

  const onCreate = () => {
    setEditing({
      id: "", // placeholder, DB will set via trigger if created through Auth flow; for public.users we allow server to generate UUID if default
      email: "",
      role: "candidat",
      first_name: "",
      last_name: "",
      matricule: "",
      phone: "",
      date_of_birth: "",
      sexe: "",
    });
    setOpenForm(true);
  };

  const onEdit = (u: DBUser) => {
    setEditing(u);
    setOpenForm(true);
  };

  const onDelete = (u: DBUser) => {
    setEditing(u);
    setOpenDelete(true);
  };

  const saveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);

    try {
      const payload: Partial<DBUser> & { sexe?: string | null } = {
        email: editing.email?.trim(),
        role: editing.role,
        first_name: editing.first_name,
        last_name: editing.last_name,
        matricule: editing.matricule || null,
        phone: editing.phone || null,
        date_of_birth: editing.date_of_birth ? editing.date_of_birth : null,
        sexe: editing.sexe || null,
      };

      if (!editing.id) {
        // Create row in public.users (client-side MVP). Assumes admin policies allow insert.
        const { error } = await supabase.from('users').insert(payload as TablesInsert<'users'>);
        if (error) throw error;
        toast.success("Utilisateur créé");
      } else {
        const { error } = await supabase
          .from('users')
          .update(payload as TablesUpdate<'users'>)
          .eq('id', editing.id);
        if (error) throw error;
        toast.success("Utilisateur mis à jour");
      }

      setOpenForm(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!editing?.id) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("users").delete().eq("id", editing.id);
      if (error) throw error;
      toast.success("Utilisateur supprimé");
      setOpenDelete(false);
      resetForm();
      await fetchUsers();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Créer, modifier, supprimer et rechercher des utilisateurs</p>
        </div>
        <Button onClick={onCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher (nom, email, matricule, téléphone)" className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {roleOptions.map(r => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement...
            </div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">Utilisateur</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Rôle</th>
                    <th className="text-left p-3 font-medium">Matricule</th>
                    <th className="text-left p-3 font-medium">Téléphone</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id || u.email} className="border-b hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{u.first_name} {u.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{u.email}</td>
                      <td className="p-3">
                        <Badge variant="secondary">{u.role}</Badge>
                      </td>
                      <td className="p-3 text-sm">{u.matricule || '-'}</td>
                      <td className="p-3 text-sm">{u.phone || '-'}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(u)}>
                            <Pencil className="w-4 h-4" /> Editer
                          </Button>
                          <Button variant="destructive" size="sm" className="gap-1" onClick={() => onDelete(u)}>
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">Aucun utilisateur</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={openForm} onOpenChange={(o) => { setOpenForm(o); if (!o) resetForm(); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={saveUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" required value={editing?.email || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select value={editing?.role || "candidat"} onValueChange={val => setEditing(v => ({ ...(v as AdminUser), role: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => (<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input required value={editing?.first_name || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), first_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input required value={editing?.last_name || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), last_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Matricule</Label>
                <Input value={editing?.matricule || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), matricule: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={editing?.phone || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Date de naissance</Label>
                <Input type="date" value={editing?.date_of_birth || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), date_of_birth: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Sexe</Label>
                <Input placeholder="M/F/autre" value={editing?.sexe || ""} onChange={e => setEditing(v => ({ ...(v as AdminUser), sexe: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpenForm(false)}>Annuler</Button>
              <Button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
