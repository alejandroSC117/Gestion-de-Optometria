import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Patient = {
  id: number;
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
  patientId: number;
  date: string;
  time: string;
  type: 'exam' | 'follow_up' | 'fitting' | 'pickup';
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes: string;
};

export type Prescription = {
  id: number;
  patientId: number;
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
  patientId: number;
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
  id: number;
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
  prescriptionId?: number;
};

export type ClinicalHistory = {
  id: number;
  patientId: number;
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
  addPatient: (patient: NewPatient) => Patient;
  updatePatient: (id: number, patient: Partial<NewPatient>) => void;
  addAppointment: (appointment: NewAppointment) => Appointment;
  addPrescription: (prescription: NewPrescription) => Prescription;
  addExam: (exam: NewExam) => Exam;
  addConsultation: (patientId: number, consultation: NewClinicalConsultation) => ClinicalConsultation;
  updateAppointmentStatus: (id: number, status: Appointment['status']) => void;
  getPatient: (id: number) => Patient | undefined;
  getPatientAppointments: (id: number) => Appointment[];
  getPatientPrescription: (id: number) => Prescription | undefined;
  getPatientExams: (id: number) => Exam[];
  getPatientHistory: (id: number) => ClinicalHistory | undefined;
  getPatientConsultations: (id: number) => ClinicalConsultation[];
};

const STORAGE_KEY = '@nexus/clinic-state';

const initialState: ClinicState = {
  patients: [
    {
      id: 101,
      firstName: 'Valentina',
      lastName: 'Ríos',
      phone: '+52 55 2345 6789',
      email: 'valentina.rios@email.com',
      birthDate: '1992-08-14',
      notes: 'Sensibilidad a lentes de contacto.',
      status: 'active',
      createdAt: '2026-08-12T09:30:00.000Z',
    },
    {
      id: 102,
      firstName: 'Mateo',
      lastName: 'Gómez',
      phone: '+52 55 8765 4321',
      email: 'mateo.gomez@email.com',
      birthDate: '1986-03-29',
      notes: 'Prefiere armazones ligeros.',
      status: 'active',
      createdAt: '2026-07-24T14:10:00.000Z',
    },
    {
      id: 103,
      firstName: 'Sofía',
      lastName: 'Navarro',
      phone: '+52 55 1122 3344',
      email: 'sofia.navarro@email.com',
      birthDate: '2001-11-06',
      notes: '',
      status: 'active',
      createdAt: '2026-06-18T11:45:00.000Z',
    },
    {
      id: 104,
      firstName: 'Alejandro',
      lastName: 'Luna',
      phone: '+52 55 4455 6677',
      email: 'alejandro.luna@email.com',
      birthDate: '1978-01-20',
      notes: 'Revisión anual.',
      status: 'active',
      createdAt: '2026-05-02T16:20:00.000Z',
    },
  ],
  appointments: [
    { id: 201, patientId: 101, date: '2026-09-02', time: '09:30', type: 'exam', status: 'confirmed', notes: 'Revisión anual' },
    { id: 202, patientId: 102, date: '2026-09-02', time: '11:00', type: 'follow_up', status: 'pending', notes: 'Ajuste de progresivos' },
    { id: 203, patientId: 103, date: '2026-09-02', time: '13:30', type: 'fitting', status: 'confirmed', notes: 'Prueba de armazones' },
    { id: 204, patientId: 104, date: '2026-09-03', time: '10:15', type: 'exam', status: 'confirmed', notes: '' },
  ],
  prescriptions: [
    { id: 301, patientId: 101, issuedDate: '2026-08-12', odSphere: -1.25, odCylinder: -0.5, odAxis: 90, osSphere: -1.0, osCylinder: -0.25, osAxis: 80, addPower: 0, lensType: 'Monofocal antirreflejante' },
    { id: 302, patientId: 102, issuedDate: '2026-07-24', odSphere: 1.5, odCylinder: -0.75, odAxis: 170, osSphere: 1.25, osCylinder: -0.5, osAxis: 10, addPower: 1.75, lensType: 'Progresivo premium' },
  ],
  exams: [
    { id: 401, patientId: 101, examDate: '2026-08-12', visualAcuityRight: '20/25', visualAcuityLeft: '20/20', intraocularPressureRight: '15', intraocularPressureLeft: '14', observations: 'Buena respuesta binocular. Continuar con corrección actual.' },
    { id: 402, patientId: 102, examDate: '2026-07-24', visualAcuityRight: '20/30', visualAcuityLeft: '20/25', intraocularPressureRight: '16', intraocularPressureLeft: '16', observations: 'Se recomienda adaptación a progresivos.' },
  ],
  clinicalHistories: [],
};

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ClinicState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<ClinicState>;
          setState({ ...initialState, ...parsed, clinicalHistories: parsed.clinicalHistories ?? [] });
        }
      })
      .catch(() => undefined)
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (isHydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    }
  }, [isHydrated, state]);

  const value = useMemo<ClinicContextValue>(() => ({
    ...state,
    isHydrated,
    addPatient: (patient) => {
      const created: Patient = {
        ...patient,
        id: Date.now(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setState((current) => ({ ...current, patients: [created, ...current.patients] }));
      return created;
    },
    updatePatient: (id, patient) => {
      setState((current) => ({
        ...current,
        patients: current.patients.map((item) => item.id === id ? { ...item, ...patient } : item),
      }));
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
    addPrescription: (prescription) => {
      const created: Prescription = { ...prescription, id: Date.now() };
      setState((current) => ({ ...current, prescriptions: [created, ...current.prescriptions] }));
      return created;
    },
    addExam: (exam) => {
      const created: Exam = { ...exam, id: Date.now() };
      setState((current) => ({ ...current, exams: [created, ...current.exams] }));
      return created;
    },
    addConsultation: (patientId, consultation) => {
      const created: ClinicalConsultation = { ...consultation, id: Date.now() };
      setState((current) => {
        const existing = current.clinicalHistories.find((history) => history.patientId === patientId);
        const history = existing
          ? { ...existing, consultations: [...existing.consultations, created], updatedAt: new Date().toISOString() }
          : { id: Date.now() + 1, patientId, consultations: [created], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        return {
          ...current,
          clinicalHistories: existing
            ? current.clinicalHistories.map((item) => item.patientId === patientId ? history : item)
            : [history, ...current.clinicalHistories],
        };
      });
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
  }), [isHydrated, state]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used inside ClinicProvider');
  }
  return context;
}
