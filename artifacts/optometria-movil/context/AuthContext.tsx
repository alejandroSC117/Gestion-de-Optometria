import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type AuthUser = { id: string; name: string; email: string };
type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string) => void;
  signUp: (name: string, email: string) => void;
  signOut: () => void;
};

const STORAGE_KEY = '@nexus/auth-user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setUser(JSON.parse(stored) as AuthUser))
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    if (nextUser) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser)).catch(() => undefined);
    else AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    signIn: (email) => {
      const cleanEmail = email.trim().toLowerCase();
      persist({ id: cleanEmail || 'demo-user', name: cleanEmail.split('@')[0] || 'Profesional', email: cleanEmail || 'demo@nexus.app' });
    },
    signUp: (name, email) => {
      const cleanEmail = email.trim().toLowerCase();
      persist({ id: cleanEmail || 'demo-user', name: name.trim() || 'Profesional', email: cleanEmail || 'demo@nexus.app' });
    },
    signOut: () => persist(null),
  }), [isLoading, persist, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}