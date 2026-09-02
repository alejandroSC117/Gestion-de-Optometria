import { create } from 'zustand';
import type { User, Profile, AuthState } from '@types/index';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      error: null,
    }),
}));
