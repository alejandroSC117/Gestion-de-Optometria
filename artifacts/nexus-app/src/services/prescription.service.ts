import type { Prescription } from '@types/index';
import { supabase } from '@config/supabase';

export class PrescriptionService {
  static async getPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patientId', patientId)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return [];
    }
  }

  static async getPrescriptionById(prescriptionId: string): Promise<Prescription | null> {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      return null;
    }
  }

  static async createPrescription(
    examId: string,
    patientId: string,
    userId: string,
    prescriptionData: Omit<Prescription, 'id' | 'examId' | 'patientId' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Prescription | null> {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([
          {
            examId,
            patientId,
            userId,
            ...prescriptionData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error creating prescription:', error);
      return null;
    }
  }

  static async updatePrescription(
    prescriptionId: string,
    prescriptionData: Partial<Prescription>
  ): Promise<Prescription | null> {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .update({
          ...prescriptionData,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', prescriptionId)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error updating prescription:', error);
      return null;
    }
  }
}
