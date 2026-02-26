import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
  setAuth: (token: string, userId: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  isLoading: true,
  setAuth: (token, userId) => set({ token, userId, isLoading: false }),
  clearAuth: () => set({ token: null, userId: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
