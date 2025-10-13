import { api } from "./client";
import { endpoints } from "./endpoints";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(endpoints.authLogin, { email, password });
    const resp = data as LoginResponse;
    if (resp?.token) {
      try { localStorage.setItem('auth_token', resp.token); } catch {}
    }
    return resp;
  },
  async signup(payload: { email: string; password: string; role?: string; first_name?: string; last_name?: string }): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(endpoints.authSignup, payload);
    const resp = data as LoginResponse;
    if (resp?.token) {
      try { localStorage.setItem('auth_token', resp.token); } catch {}
    }
    return resp;
  },
  async me(): Promise<AuthUser | null> {
    try {
      const { data } = await api.get<AuthUser>(endpoints.authMe);
      return (data as AuthUser) ?? null;
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
        return null;
      }
      throw e;
    }
  },
  async logout(): Promise<void> {
    try { await api.post(endpoints.authLogout, {}); } catch { /* ignore */ }
    try { localStorage.removeItem('auth_token'); } catch {}
  },
};


