import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook pour synchroniser les offres d'emploi Supabase → Azure
 * 
 * UTILISE LES VRAIES ROUTES AZURE avec header X-Admin-Token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] as string;

  if (!webhookSecret || receivedSecret !== webhookSecret) {
    console.error('❌ [sync-job-offer] Secret webhook invalide');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, table, record, old_record } = req.body;

    console.log('📥 [sync-job-offer] Webhook reçu:', {
      type,
      table,
      recordId: record?.id || old_record?.id,
    });

    const azureApiUrl = process.env.VITE_AZURE_API_URL || 'https://seeg-backend-api.azurewebsites.net/api/v1';
    const azureAdminToken = process.env.AZURE_ADMIN_TOKEN;

    if (!azureAdminToken) {
      console.error('❌ [sync-job-offer] AZURE_ADMIN_TOKEN manquant');
      return res.status(500).json({ error: 'Configuration error' });
    }

    let syncResponse: Response;

    switch (type) {
      case 'INSERT':
        // Offre déjà créée via POST /jobs/
        console.log('ℹ️ [sync-job-offer] INSERT - Offre déjà créée via frontend');
        return res.status(200).json({ 
          success: true, 
          message: 'Job offer already created',
          recordId: record.id,
        });

      case 'UPDATE':
        // PUT /jobs/{id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/jobs/${record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            title: record.title,
            description: record.description,
            location: record.location,
            contract_type: record.contract_type,
            department: record.department,
            salary_min: record.salary_min,
            salary_max: record.salary_max,
            offer_status: record.status_offerts || record.offer_status,
            questions_mtp: {
              questions_metier: record.mtp_questions_metier || [],
              questions_talent: record.mtp_questions_talent || [],
              questions_paradigme: record.mtp_questions_paradigme || [],
            },
          }),
        });
        break;

      case 'DELETE':
        // DELETE /jobs/{id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/jobs/${old_record.id}`, {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': azureAdminToken,
          },
        });
        break;

      default:
        console.warn('⚠️ [sync-job-offer] Type événement inconnu:', type);
        return res.status(400).json({ error: 'Unknown event type' });
    }

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('❌ [sync-job-offer] Échec sync Azure:', errorData);
      return res.status(500).json({ error: 'Azure sync failed', details: errorData });
    }

    const syncResult = await syncResponse.json();
    console.log('✅ [sync-job-offer] Sync Azure réussie:', syncResult);

    return res.status(200).json({ 
      success: true, 
      message: `Job offer ${type} synced to Azure`,
      recordId: record?.id || old_record?.id,
      azureResponse: syncResult,
    });

  } catch (error: any) {
    console.error('❌ [sync-job-offer] Erreur:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

