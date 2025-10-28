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
    const { method, headers, body } = req;
    
    // URL de base de l'API Azure Container Apps
    const baseUrl = 'https://rh-rval-api--1uyr6r3.gentlestone-a545d2f8.canadacentral.azurecontainerapps.io';
    
    // Extraire le path depuis le paramètre path de Vercel
    // Ex: req.query.path = ['evaluate'] pour /api/rh-eval-proxy/evaluate
    const pathSegments = req.query.path as string[];
    const path = pathSegments ? `/${pathSegments.join('/')}` : '/';
    
    // Récupérer les query params (sans le path)
    const queryParams = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) {
        queryParams.append(key, Array.isArray(value) ? value[0] : value);
      }
    });
    const queryString = queryParams.toString();
    
    // Construire l'URL complète
    const apiUrl = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
    
    console.log(`🔄 [Proxy CORS] ${method} ${path} -> ${apiUrl}`);
    console.log(`📤 [Proxy CORS] Headers reçus:`, headers);
    console.log(`📦 [Proxy CORS] Body:`, body);
    
    // Préparer les en-têtes pour la requête vers l'API
    const apiHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter la clé API si elle existe
    const apiKey = process.env.VITE_SEEG_AI_API_KEY;
    if (apiKey) {
      apiHeaders['x-api-key'] = apiKey;
      console.log(`🔑 [Proxy CORS] Clé API ajoutée`);
    } else {
      console.log(`⚠️ [Proxy CORS] Aucune clé API trouvée`);
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
    
    console.log(`🚀 [Proxy CORS] Envoi de la requête vers l'API Azure Container Apps...`);
    
    // Faire la requête vers l'API Azure Container Apps
    const response = await fetch(apiUrl, fetchOptions);
    
    // Obtenir le contenu de la réponse
    const responseText = await response.text();
    
    console.log(`✅ [Proxy CORS] Réponse ${response.status} pour ${method} ${path}`);
    console.log(`📥 [Proxy CORS] Contenu de la réponse:`, responseText.substring(0, 200) + '...');
    
    // Renvoyer la réponse avec le bon statut et contenu
    res.status(response.status);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
    res.send(responseText);
    
  } catch (error) {
    console.error('❌ [Proxy CORS] Erreur:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erreur du proxy API',
      message: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}

