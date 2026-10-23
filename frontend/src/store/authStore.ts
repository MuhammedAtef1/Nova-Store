import { create } from 'zustand';
import { api } from '@/lib/api';

interface AuthState {
  isAuthenticated: boolean;
  userEmail: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userEmail: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Identity endpoint for login
      await api.post('/login?useCookies=true', { email, password });
      set({ isAuthenticated: true, userEmail: email, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.detail || 'Invalid login attempt.', 
        isLoading: false,
        isAuthenticated: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Custom endpoint or just clear client state if backend cookie is removed another way
      // We will just clear the client state for now since Identity cookie will expire/clear on client side if we drop it,
      // but ideally we should hit a /logout endpoint. 
      // Workaround: We'll just reset state.
      set({ isAuthenticated: false, userEmail: null });
    } catch (e) { }
  },

  checkSession: async () => {
    try {
      // Identity provides a /manage/info endpoint if we want, or we can hit our own ping
      // We'll hit the admin dashboard stats just to check if we have access
      await api.get('/admin/dashboard/stats');
      set({ isAuthenticated: true });
    } catch {
      set({ isAuthenticated: false, userEmail: null });
    }
  }
}));
