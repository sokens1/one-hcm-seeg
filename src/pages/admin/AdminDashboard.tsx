import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Tableau de bord Admin</h1>
        <p className="text-muted-foreground">Accédez à la gestion des utilisateurs et à d'autres paramètres d'administration.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="font-medium">Utilisateurs</div>
              <div className="text-sm text-muted-foreground">Gérer les comptes, rôles et accès</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
