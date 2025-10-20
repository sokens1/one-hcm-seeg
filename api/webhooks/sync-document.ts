import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook pour synchroniser les documents Supabase → Azure
 * 
 * UTILISE LES VRAIES ROUTES AZURE avec header X-Admin-Token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  const receivedSecret = req.headers['x-webhook-secret'] as string;

  if (!webhookSecret || receivedSecret !== webhookSecret) {
    console.error('❌ [sync-document] Secret webhook invalide');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, table, record, old_record } = req.body;

    console.log('📥 [sync-document] Webhook reçu:', {
      type,
      table,
      recordId: record?.id || old_record?.id,
    });

    const azureApiUrl = process.env.VITE_AZURE_API_URL || 'https://seeg-backend-api.azurewebsites.net/api/v1';
    const azureAdminToken = process.env.AZURE_ADMIN_TOKEN;

    if (!azureAdminToken) {
      console.error('❌ [sync-document] AZURE_ADMIN_TOKEN manquant');
      return res.status(500).json({ error: 'Configuration error' });
    }

    let syncResponse: Response;

    switch (type) {
      case 'INSERT':
        // ===== UPLOADER LE DOCUMENT SUR AZURE =====
        console.log('📝 [sync-document] INSERT - Upload document sur Azure:', record.id);
        
        // Note : Les documents Supabase ont des URLs de fichiers
        // Il faudrait télécharger le fichier depuis Supabase Storage puis l'uploader sur Azure
        // Pour l'instant, on log juste et on retourne success
        
        console.warn('⚠️ [sync-document] Migration de fichiers non implémentée - Métadonnées seulement');
        
        return res.status(200).json({ 
          success: true, 
          message: 'Document metadata logged (file migration not implemented)',
          recordId: record.id,
          note: 'Les fichiers doivent être migrés manuellement de Supabase Storage vers Azure Blob',
        });

      case 'DELETE':
        // DELETE /applications/{app_id}/documents/{doc_id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/applications/${old_record.application_id}/documents/${old_record.id}`, {
          method: 'DELETE',
          headers: {
            'X-Admin-Token': azureAdminToken,
          },
        });
        break;

      default:
        console.warn('⚠️ [sync-document] Type événement non géré:', type);
        return res.status(400).json({ error: 'Unknown event type' });
    }

    if (!syncResponse.ok) {
      const errorData = await syncResponse.json().catch(() => ({ message: 'Erreur inconnue' }));
      console.error('❌ [sync-document] Échec sync Azure:', errorData);
      return res.status(500).json({ error: 'Azure sync failed', details: errorData });
    }

    const syncResult = await syncResponse.json();
    console.log('✅ [sync-document] Sync Azure réussie:', syncResult);

    return res.status(200).json({ 
      success: true, 
      message: `Document ${type} synced to Azure`,
      recordId: record?.id || old_record?.id,
      azureResponse: syncResult,
    });

  } catch (error: any) {
    console.error('❌ [sync-document] Erreur:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

