import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook pour synchroniser les candidatures Supabase → Azure
 * 
 * UTILISE LES VRAIES ROUTES AZURE avec header X-Admin-Token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] as string;

  if (!webhookSecret || receivedSecret !== webhookSecret) {
    console.error('❌ [sync-application] Secret webhook invalide');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, table, record, old_record } = req.body;

    console.log('📥 [sync-application] Webhook reçu:', {
      type,
      table,
      recordId: record?.id || old_record?.id,
    });

    const azureApiUrl = process.env.VITE_AZURE_API_URL || 'https://seeg-backend-api.azurewebsites.net/api/v1';
    const azureAdminToken = process.env.AZURE_ADMIN_TOKEN;

    if (!azureAdminToken) {
      console.error('❌ [sync-application] AZURE_ADMIN_TOKEN manquant');
      return res.status(500).json({ error: 'Configuration error' });
    }

    let syncResponse: Response;

    switch (type) {
      case 'INSERT':
        // ===== CRÉER LA CANDIDATURE SUR AZURE =====
        console.log('📝 [sync-application] INSERT - Création candidature sur Azure:', record.id);
        
        // Parser mtp_answers si c'est une string JSON
        let mtpAnswers = record.mtp_answers;
        if (typeof mtpAnswers === 'string') {
          try {
            mtpAnswers = JSON.parse(mtpAnswers);
          } catch (e) {
            mtpAnswers = null;
          }
        }
        
        syncResponse = await fetch(`${azureApiUrl}/applications/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            candidate_id: record.candidate_id,
            job_offer_id: record.job_offer_id,
            reference_full_name: record.reference_full_name,
            reference_email: record.reference_email,
            reference_contact: record.reference_contact,
            reference_company: record.reference_company,
            has_been_manager: record.has_been_manager,
            reponses_metier: mtpAnswers?.metier || [],
            reponses_talent: mtpAnswers?.talent || [],
            reponses_paradigme: mtpAnswers?.paradigme || [],
            documents: [], // Les documents seront synchronisés séparément
          }),
        });
        break;

      case 'UPDATE':
        // PUT /applications/{id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/applications/${record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            status: record.status,
            interview_date: record.interview_date,
            simulation_date: record.simulation_date,
            synthesis_points_forts: record.synthesis_points_forts,
            synthesis_points_amelioration: record.synthesis_points_amelioration,
            synthesis_conclusion: record.synthesis_conclusion,
          }),
        });
        break;

      case 'DELETE':
        // DELETE /applications/{id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/applications/${old_record.id}`, {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': azureAdminToken,
          },
        });
        break;

      default:
        console.warn('⚠️ [sync-application] Type événement inconnu:', type);
        return res.status(400).json({ error: 'Unknown event type' });
    }

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('❌ [sync-application] Échec sync Azure:', errorData);
      return res.status(500).json({ error: 'Azure sync failed', details: errorData });
    }

    const syncResult = await syncResponse.json();
    console.log('✅ [sync-application] Sync Azure réussie:', syncResult);

    return res.status(200).json({ 
      success: true, 
      message: `Application ${type} synced to Azure`,
      recordId: record?.id || old_record?.id,
      azureResponse: syncResult,
    });

  } catch (error: any) {
    console.error('❌ [sync-application] Erreur:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

