import { create } from 'zustand';
import type { Patient } from '@types/index';

interface PatientsStore {
  patients: Patient[];
  selectedPatient: Patient | null;
  isLoading: boolean;
  error: string | null;

  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  addPatient: (patient: Patient) => void;
  updatePatient: (patient: Patient) => void;
  removePatient: (patientId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePatientsStore = create<PatientsStore>((set) => ({
  patients: [],
  selectedPatient: null,
  isLoading: false,
  error: null,

  setPatients: (patients) => set({ patients }),
  setSelectedPatient: (selectedPatient) => set({ selectedPatient }),
  addPatient: (patient) =>
    set((state) => ({ patients: [...state.patients, patient] })),
  updatePatient: (patient) =>
    set((state) => ({
      patients: state.patients.map((p) => (p.id === patient.id ? patient : p)),
    })),
  removePatient: (patientId) =>
    set((state) => ({
      patients: state.patients.filter((p) => p.id !== patientId),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
