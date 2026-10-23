import React, { createContext, useContext, useMemo } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/expo';

export type AuthUser = { id: string; name: string; email: string };
type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, signOut } = useClerkAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const user = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.firstName || 'Profesional',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
  } : null;
  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading: !isLoaded || !userLoaded,
    signOut: () => signOut(),
  }), [isLoaded, signOut, user, userLoaded]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}