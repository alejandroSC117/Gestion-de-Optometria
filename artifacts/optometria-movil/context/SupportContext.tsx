import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SupportStatus = 'open' | 'review' | 'in_progress' | 'resolved' | 'closed';
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
  createTicket: (ticket: Pick<SupportTicket, 'userId' | 'category' | 'description' | 'priority'>) => SupportTicket;
};

const STORAGE_KEY = '@nexus/support-tickets';
const SupportContext = createContext<SupportContextValue | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => stored && setTickets(JSON.parse(stored) as SupportTicket[]))
      .catch(() => undefined)
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)).catch(() => undefined);
  }, [isHydrated, tickets]);

  const value = useMemo(() => ({
    tickets,
    isHydrated,
    createTicket: (ticket: Pick<SupportTicket, 'userId' | 'category' | 'description' | 'priority'>) => {
      const created: SupportTicket = {
        ...ticket,
        id: `NXS-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        status: 'open',
        messages: [{ id: `${Date.now()}-message`, author: 'user', text: ticket.description, date: new Date().toISOString() }],
      };
      setTickets((current) => [created, ...current]);
      return created;
    },
  }), [isHydrated, tickets]);

  return <SupportContext.Provider value={value}>{children}</SupportContext.Provider>;
}

export function useSupport() {
  const context = useContext(SupportContext);
  if (!context) throw new Error('useSupport must be used inside SupportProvider');
  return context;
}