import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createPatient as createPatientRequest,
  createPatientConsultation as createConsultationRequest,
  createPatientPrescription as createPrescriptionRequest,
  listPatients,
  updatePatient as updatePatientRequest,
} from '@workspace/api-client-react';
import type { Patient as ApiPatient, PatientInput } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';

export type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  sex?: string;
  phone: string;
  email: string;
  birthDate: string;
  address?: string;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
};

export type Appointment = {
  id: number;
  patientId: string;
  date: string;
  time: string;
  type: 'exam' | 'follow_up' | 'fitting' | 'pickup';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  consultationId?: string;
  issuedDate: string;
  odSphere: number;
  odCylinder: number;
  odAxis: number;
  osSphere: number;
  osCylinder: number;
  osAxis: number;
  addPower: number;
  odAdd?: number;
  odPrism?: string;
  osAdd?: number;
  osPrism?: string;
  dp?: string;
  height?: string;
  observations?: string;
  lensType: string;
  provider?: {
    displayName: string;
    professionalName: string;
    licenseNumber: string;
    officeName: string;
    address: string;
    phone: string;
    email: string;
    logoUri?: string;
    signatureUri?: string;
  };
};

export type Exam = {
  id: number;
  patientId: string;
  examDate: string;
  visualAcuityRight: string;
  visualAcuityLeft: string;
  intraocularPressureRight: string;
  intraocularPressureLeft: string;
  observations: string;
};

export type ClinicalEyeAcuity = {
  distanceUncorrected: string;
  distanceCorrected: string;
  nearUncorrected: string;
  nearCorrected: string;
};

export type ClinicalRefractionEye = {
  sphere: string;
  cylinder: string;
  axis: string;
  add: string;
  prism: string;
};

export type ClinicalConsultation = {
  id: string;
  date: string;
  time: string;
  reason: string;
  professional: string;
  observations: string;
  antecedents: {
    ocular: string;
    personal: string;
    family: string;
    surgeries: string;
    glasses: string;
    contactLenses: string;
    medications: string;
    allergies: string;
  };
  acuity: {
    scale: string;
    od: ClinicalEyeAcuity;
    oi: ClinicalEyeAcuity;
    ao: ClinicalEyeAcuity;
  };
  refraction: {
    od: ClinicalRefractionEye;
    oi: ClinicalRefractionEye;
    vertexDistance: string;
    dp: string;
    observations: string;
  };
  tests: {
    pupils: string;
    ocularMotility: string;
    coverTest: string;
    binocularVision: string;
    vergences: string;
    accommodation: string;
    stereopsis: string;
    colorVision: string;
    visualField: string;
    keratometry: string;
    tonometry: string;
    intraocularPressureRight: string;
    intraocularPressureLeft: string;
    slitLamp: string;
    other: string;
  };
  results: {
    findings: string;
    observations: string;
    professionalAssessment: string;
    recommendations: string;
    followUp: string;
  };
  prescriptionId?: string;
};

export type ClinicalHistory = {
  id: string;
  patientId: string;
  consultations: ClinicalConsultation[];
  createdAt: string;
  updatedAt: string;
};

type ClinicState = {
  patients: Patient[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  exams: Exam[];
  clinicalHistories: ClinicalHistory[];
};

export type NewPatient = Pick<Patient, 'firstName' | 'lastName' | 'phone' | 'email' | 'birthDate' | 'notes'> & Pick<Patient, 'sex' | 'address'>;
type NewAppointment = Pick<Appointment, 'patientId' | 'date' | 'time' | 'type' | 'notes'>;
type NewPrescription = Omit<Prescription, 'id'>;
type NewExam = Omit<Exam, 'id'>;
export type NewClinicalConsultation = Omit<ClinicalConsultation, 'id'>;

type ClinicContextValue = ClinicState & {
  isHydrated: boolean;
  loadError: string | null;
  addPatient: (patient: NewPatient) => Promise<Patient>;
  updatePatient: (id: string, patient: Partial<NewPatient>) => Promise<void>;
  addAppointment: (appointment: NewAppointment) => Appointment;
  addPrescription: (prescription: NewPrescription) => Promise<Prescription>;
  addExam: (exam: NewExam) => Exam;
  addConsultation: (patientId: string, consultation: NewClinicalConsultation) => Promise<ClinicalConsultation>;
  updateAppointmentStatus: (id: number, status: Appointment['status']) => void;
  getPatient: (id: string) => Patient | undefined;
  getPatientAppointments: (id: string) => Appointment[];
  getPatientPrescription: (id: string) => Prescription | undefined;
  getPatientExams: (id: string) => Exam[];
  getPatientHistory: (id: string) => ClinicalHistory | undefined;
  getPatientConsultations: (id: string) => ClinicalConsultation[];
};

const initialState: ClinicState = {
  patients: [],
  appointments: [],
  prescriptions: [],
  exams: [],
  clinicalHistories: [],
};

function mapApiPatient(patient: ApiPatient): Patient {
  return {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    birthDate: patient.birthDate ?? '',
    sex: patient.sex,
    phone: patient.phone ?? '',
    email: patient.email ?? '',
    address: patient.address,
    notes: patient.notes ?? '',
    status: patient.status,
    createdAt: patient.createdAt,
  };
}

function cleanPatientInput(patient: NewPatient): PatientInput {
  return {
    firstName: patient.firstName.trim(),
    lastName: patient.lastName.trim(),
    ...(patient.birthDate?.trim() ? { birthDate: patient.birthDate.trim() } : {}),
    ...(patient.sex?.trim() ? { sex: patient.sex.trim() } : {}),
    ...(patient.phone.trim() ? { phone: patient.phone.trim() } : {}),
    ...(patient.email.trim() ? { email: patient.email.trim() } : {}),
    ...(patient.address?.trim() ? { address: patient.address.trim() } : {}),
    ...(patient.notes.trim() ? { notes: patient.notes.trim() } : {}),
  };
}

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ClinicState>(initialState);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const patientQuery = useQuery({
    queryKey: ['clinic', 'patients', user?.id],
    queryFn: () => listPatients(),
    enabled: Boolean(user?.id),
    retry: false,
  });
  const isHydrated = !user?.id || patientQuery.isSuccess;

  useEffect(() => {
    if (patientQuery.data) {
      setState((current) => ({ ...current, patients: patientQuery.data.map(mapApiPatient) }));
    }
  }, [patientQuery.data]);

  const value = useMemo<ClinicContextValue>(() => ({
    ...state,
    isHydrated,
    loadError: patientQuery.error instanceof Error ? patientQuery.error.message : null,
    addPatient: async (patient) => {
      const created = mapApiPatient(await createPatientRequest(cleanPatientInput(patient)));
      setState((current) => ({ ...current, patients: [created, ...current.patients] }));
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'patients', user?.id] });
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'usage', user?.id] });
      return created;
    },
    updatePatient: async (id, patient) => {
      const currentPatient = state.patients.find((item) => item.id === id);
      if (!currentPatient) throw new Error('Paciente no disponible para actualizar.');
      const saved = mapApiPatient(await updatePatientRequest(id, cleanPatientInput({
        ...currentPatient,
        ...patient,
      })));
      setState((current) => ({
        ...current,
        patients: current.patients.map((item) => item.id === id ? saved : item),
      }));
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'patients', user?.id] });
    },
    addAppointment: (appointment) => {
      const created: Appointment = {
        ...appointment,
        id: Date.now(),
        status: 'confirmed',
      };
      setState((current) => ({ ...current, appointments: [...current.appointments, created] }));
      return created;
    },
    addPrescription: async (prescription) => {
      const { patientId, consultationId, provider, ...data } = prescription;
      const response = await createPrescriptionRequest(patientId, {
        ...(consultationId ? { consultationId } : {}),
        issuedAt: prescription.issuedDate,
        prescriptionData: data as Record<string, unknown>,
        professionalSnapshot: (provider ?? {}) as Record<string, unknown>,
      });
      const created: Prescription = {
        ...prescription,
        id: response.id,
        patientId: response.patientId,
        consultationId: response.consultationId,
      };
      setState((current) => ({ ...current, prescriptions: [created, ...current.prescriptions] }));
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'prescriptions', patientId] });
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'usage', user?.id] });
      return created;
    },
    addExam: (exam) => {
      const created: Exam = { ...exam, id: Date.now() };
      setState((current) => ({ ...current, exams: [created, ...current.exams] }));
      return created;
    },
    addConsultation: async (patientId, consultation) => {
      const response = await createConsultationRequest(patientId, {
        consultationDate: consultation.date,
        consultationTime: consultation.time,
        reason: consultation.reason,
        observations: consultation.observations,
        clinicalData: {
          professional: consultation.professional,
          antecedents: consultation.antecedents,
          acuity: consultation.acuity,
          refraction: consultation.refraction,
          tests: consultation.tests,
          results: consultation.results,
          ...(consultation.prescriptionId ? { prescriptionId: consultation.prescriptionId } : {}),
        },
      });
      const created: ClinicalConsultation = { ...consultation, id: response.id };
      setState((current) => {
        const existing = current.clinicalHistories.find((history) => history.patientId === patientId);
        const history = existing
          ? { ...existing, consultations: [...existing.consultations, created], updatedAt: new Date().toISOString() }
          : { id: `history-${patientId}`, patientId, consultations: [created], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        return {
          ...current,
          clinicalHistories: existing
            ? current.clinicalHistories.map((item) => item.patientId === patientId ? history : item)
            : [history, ...current.clinicalHistories],
        };
      });
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'consultations', patientId] });
      await queryClient.invalidateQueries({ queryKey: ['clinic', 'usage', user?.id] });
      return created;
    },
    updateAppointmentStatus: (id, status) => {
      setState((current) => ({
        ...current,
        appointments: current.appointments.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment,
        ),
      }));
    },
    getPatient: (id) => state.patients.find((patient) => patient.id === id),
    getPatientAppointments: (id) =>
      state.appointments
        .filter((appointment) => appointment.patientId === id)
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    getPatientPrescription: (id) =>
      state.prescriptions
        .filter((prescription) => prescription.patientId === id)
        .sort((a, b) => b.issuedDate.localeCompare(a.issuedDate))[0],
    getPatientExams: (id) =>
      state.exams
        .filter((exam) => exam.patientId === id)
        .sort((a, b) => b.examDate.localeCompare(a.examDate)),
    getPatientHistory: (id) => state.clinicalHistories.find((history) => history.patientId === id),
    getPatientConsultations: (id) =>
      state.clinicalHistories.find((history) => history.patientId === id)?.consultations
        .slice()
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)) ?? [],
  }), [isHydrated, patientQuery.error, queryClient, state, user?.id]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used inside ClinicProvider');
  }
  return context;
}
