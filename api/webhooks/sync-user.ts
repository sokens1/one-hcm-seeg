import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook pour synchroniser les utilisateurs Supabase → Azure
 * 
 * SIMPLIFIÉ : On utilise un endpoint admin générique pour la sync
 * Azure doit exposer : POST /api/v1/admin/sync
 * 
 * Ce endpoint reçoit :
 * - table: "users" | "applications" | "job_offers" | "documents"
 * - operation: "INSERT" | "UPDATE" | "DELETE"
 * - data: { ... }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Sécurité : Vérifier le secret webhook
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] as string;

  if (!webhookSecret || receivedSecret !== webhookSecret) {
    console.error('❌ [sync-user] Secret webhook invalide');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, table, record, old_record } = req.body;

    console.log('📥 [sync-user] Webhook reçu:', {
      type,
      table,
      recordId: record?.id || old_record?.id,
    });

    const azureApiUrl = process.env.VITE_AZURE_API_URL || 'https://seeg-backend-api.azurewebsites.net/api/v1';
    const azureAdminToken = process.env.AZURE_ADMIN_TOKEN;

    if (!azureAdminToken) {
      console.error('❌ [sync-user] AZURE_ADMIN_TOKEN manquant');
      return res.status(500).json({ error: 'Configuration error' });
    }

    // ===== ENDPOINT ADMIN GÉNÉRIQUE POUR SYNC =====
    const syncResponse = await fetch(`${azureApiUrl}/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${azureAdminToken}`,
      },
      body: JSON.stringify({
        table: 'users',
        operation: type, // INSERT | UPDATE | DELETE
        data: record || old_record,
        old_data: old_record,
      }),
    });

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('❌ [sync-user] Échec sync Azure:', errorData);
      return res.status(500).json({ error: 'Azure sync failed', details: errorData });
    }

    const syncResult = await syncResponse.json();
    console.log('✅ [sync-user] Sync Azure réussie:', syncResult);

    return res.status(200).json({ 
      success: true, 
      message: `User ${type} synced to Azure`,
      recordId: record?.id || old_record?.id,
      azureResponse: syncResult,
    });

  } catch (error: any) {
    console.error('❌ [sync-user] Erreur:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

