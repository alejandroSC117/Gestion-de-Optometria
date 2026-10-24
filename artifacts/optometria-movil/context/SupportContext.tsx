import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export type SupportStatus = 'draft';
export type SupportPriority = 'low' | 'normal' | 'high';

export type SupportTicket = {
  id: string;
  userId: string;
  date: string;
  category: string;
  description: string;
  priority: SupportPriority;
  status: SupportStatus;
  messages: { id: string; author: 'user' | 'support'; text: string; date: string }[];
  supportResponse?: string;
};

type SupportContextValue = {
  tickets: SupportTicket[];
  isHydrated: boolean;
  createTicket: (ticket: Pick<SupportTicket, 'category' | 'description' | 'priority'>) => SupportTicket;
};

const SupportContext = createContext<SupportContextValue | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [previousUserId, setPreviousUserId] = useState<string | undefined>(user?.id);

  useEffect(() => {
    if (previousUserId !== user?.id) {
      setTickets([]);
      setPreviousUserId(user?.id);
    }
  }, [previousUserId, user?.id]);

  const value = useMemo(() => ({
    tickets,
    isHydrated: true,
    createTicket: (ticket: Pick<SupportTicket, 'category' | 'description' | 'priority'>) => {
      if (!user?.id) throw new Error('Inicia sesión para guardar un borrador.');
      const createdAt = new Date().toISOString();
      const created: SupportTicket = {
        ...ticket,
        userId: user.id,
        id: `BORRADOR-${Date.now().toString().slice(-6)}`,
        date: createdAt,
        status: 'draft',
        messages: [{ id: `${Date.now()}-message`, author: 'user', text: ticket.description, date: createdAt }],
      };
      setTickets((current) => [created, ...current]);
      return created;
    },
  }), [tickets, user?.id]);

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (!context) throw new Error('useSupport must be used inside SupportProvider');
  return context;
}