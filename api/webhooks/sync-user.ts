import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Webhook pour synchroniser les utilisateurs Supabase → Azure
 * 
 * UTILISE LES VRAIES ROUTES AZURE avec header X-Admin-Token
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // ===== UTILISER LES VRAIES ROUTES AZURE =====
    let syncResponse: Response;

    switch (type) {
      case 'INSERT':
        // ===== CRÉER L'UTILISATEUR SUR AZURE =====
        console.log('📝 [sync-user] INSERT - Création utilisateur sur Azure:', record.id);
        
        // Utiliser POST /auth/signup avec X-Admin-Token pour créer l'user
        syncResponse = await fetch(`${azureApiUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            email: record.email,
            password: 'TempPassword123!@#', // Mot de passe temporaire (l'user devra le reset)
            first_name: record.first_name,
            last_name: record.last_name,
            phone: record.phone || '+241 00 00 00 00',
            date_of_birth: record.date_of_birth || '1990-01-01',
            sexe: record.sexe || 'M',
            candidate_status: record.candidate_status || 'externe',
            matricule: record.matricule ? parseInt(record.matricule) : undefined,
            adresse: record.adresse,
            poste_actuel: record.poste_actuel,
            annees_experience: record.annees_experience,
            no_seeg_email: record.no_seeg_email || false,
          }),
        });
        break;

      case 'UPDATE':
        // PUT /users/{user_id} avec X-Admin-Token
        syncResponse = await fetch(`${azureApiUrl}/users/${record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            first_name: record.first_name,
            last_name: record.last_name,
            phone: record.phone,
            date_of_birth: record.date_of_birth,
            sexe: record.sexe,
            adresse: record.adresse,
            poste_actuel: record.poste_actuel,
            annees_experience: record.annees_experience,
          }),
        });
        break;

      case 'DELETE':
        // Soft delete via PUT avec statut = 'supprime'
        syncResponse = await fetch(`${azureApiUrl}/users/${old_record.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Token': azureAdminToken,
          },
          body: JSON.stringify({
            statut: 'supprime',
          }),
        });
        break;

      default:
        console.warn('⚠️ [sync-user] Type événement inconnu:', type);
        return res.status(400).json({ error: 'Unknown event type' });
    }

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

