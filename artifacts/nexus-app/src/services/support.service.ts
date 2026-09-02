import type { SupportTicket, SupportMessage } from '@types/index';
import { supabase } from '@config/supabase';

export class SupportService {
  static async getTickets(userId: string): Promise<SupportTicket[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      return [];
    }
  }

  static async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching ticket:', error);
      return null;
    }
  }

  static async createTicket(
    userId: string,
    ticketData: Omit<SupportTicket, 'id' | 'userId' | 'responses' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicket | null> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([
          {
            userId,
            ...ticketData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error creating ticket:', error);
      return null;
    }
  }

  static async updateTicketStatus(
    ticketId: string,
    status: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      return false;
    }
  }

  static async addMessage(
    ticketId: string,
    userId: string,
    message: string,
    isStaffResponse: boolean = false
  ): Promise<SupportMessage | null> {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .insert([
          {
            ticketId,
            userId,
            message,
            isStaffResponse,
            createdAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error adding message:', error);
      return null;
    }
  }
}
