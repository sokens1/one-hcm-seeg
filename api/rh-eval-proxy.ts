import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, url, headers, body } = req;
    
    // URL de base de l'API Azure Container Apps
    const baseUrl = 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io';
    
    // Construire l'URL complète
    const apiUrl = `${baseUrl}${url}`;
    
    console.log(`🔄 [Proxy] ${method} ${apiUrl}`);
    
    // Préparer les en-têtes pour la requête vers l'API
    const apiHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter la clé API si elle existe
    const apiKey = process.env.VITE_AZURE_CONTAINER_APPS_API_KEY;
    if (apiKey) {
      apiHeaders['x-api-key'] = apiKey;
    }
    
    // Ajouter les en-têtes d'autorisation si présents
    if (headers.authorization) {
      apiHeaders['Authorization'] = headers.authorization as string;
    }
    
    // Préparer les options de la requête
    const fetchOptions: RequestInit = {
      method,
      headers: apiHeaders,
    };
    
    // Ajouter le corps de la requête pour les méthodes POST/PUT
    if (method === 'POST' || method === 'PUT') {
      fetchOptions.body = JSON.stringify(body);
    }
    
    // Faire la requête vers l'API Azure Container Apps
    const response = await fetch(apiUrl, fetchOptions);
    
    // Obtenir le contenu de la réponse
    const responseText = await response.text();
    
    console.log(`✅ [Proxy] Réponse ${response.status} pour ${method} ${url}`);
    
    // Renvoyer la réponse avec le bon statut et contenu
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(responseText);
    
  } catch (error) {
    console.error('❌ [Proxy] Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur du proxy API',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
