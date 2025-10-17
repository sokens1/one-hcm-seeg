// Client API pour l'intégration avec l'API Azure Backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://seeg-backend-api.azurewebsites.net';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  matricule?: number;
  phone: string;
  date_of_birth: string;
  sexe: 'M' | 'F';
  adresse?: string;
  politique_confidentialite?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
}

export interface ApiError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

class AzureApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(errorData.detail?.[0]?.msg || `Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Inscription candidat
  async signup(data: SignupData): Promise<UserResponse> {
    // Conversion des données pour correspondre à l'API
    const apiData = {
      email: data.email,
      password: data.password,
      first_name: data.first_name,
      last_name: data.last_name,
      matricule: data.matricule ? parseInt(data.matricule.toString()) : undefined,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      sexe: data.sexe,
      // Les champs supplémentaires peuvent être ajoutés selon les besoins de l'API
    };

    return this.request<UserResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  // Connexion
  async login(data: LoginData): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Vérifier le matricule (si nécessaire)
  async verifyMatricule(matricule: number): Promise<boolean> {
    try {
      await this.request(`/auth/verify-matricule/${matricule}`, {
        method: 'GET',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const azureApiClient = new AzureApiClient();
