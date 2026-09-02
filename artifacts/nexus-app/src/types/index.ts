// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  profession: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile extends User {
  subscriptionPlan: 'free' | 'pro' | 'clinic';
  subscriptionStartDate: Date;
  subscriptionEndDate?: Date;
}

// Patient Types
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone: string;
  email: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clinical History Types
export interface ClinicalExam {
  id: string;
  patientId: string;
  userId: string;
  examDate: Date;
  chiefComplaint: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VisionAcuity {
  id: string;
  examId: string;
  od: string; // Right eye
  oi: string; // Left eye
  ao: string; // Both eyes
  farDistance: string;
  nearDistance: string;
  withCorrection: string;
  withoutCorrection: string;
}

export interface Refraction {
  id: string;
  examId: string;
  sphereOd: number;
  cylinderOd: number;
  axisOd: number;
  sphereOi: number;
  cylinderOi: number;
  axisOi: number;
  addition: number;
  vertexDistance?: number;
}

// Prescription Types
export interface Prescription {
  id: string;
  examId: string;
  patientId: string;
  userId: string;
  sphereOd: number;
  cylinderOd: number;
  axisOd: number;
  sphereOi: number;
  cylinderOi: number;
  axisOi: number;
  addition: number;
  pd: number; // Pupillary distance
  height?: number;
  prism?: string;
  observations: string;
  lensType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Usage/Limits Types
export interface UserLimits {
  userId: string;
  plan: 'free' | 'pro' | 'clinic';
  monthlyCalculations: number;
  maxCalculations: number;
  aiConsultations: number;
  maxAiConsultations: number;
  patients: number;
  maxPatients: number;
  resetDate: Date;
}

// Support Types
export interface SupportTicket {
  id: string;
  userId: string;
  category: string;
  subject: string;
  description: string;
  status: 'abierto' | 'en_revision' | 'en_proceso' | 'resuelto' | 'cerrado';
  priority: 'baja' | 'media' | 'alta';
  createdAt: Date;
  updatedAt: Date;
  responses: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isStaffResponse: boolean;
  createdAt: Date;
}

// Authentication Types
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Navigation Types
export type RootStackParamList = {
  '(auth)': undefined;
  '(app)': undefined;
  NotFound: undefined;
};

export type AuthStackParamList = {
  welcome: undefined;
  register: undefined;
  login: undefined;
  'forgot-password': undefined;
};

export type AppStackParamList = {
  '(tabs)': undefined;
  'patient-detail': { patientId: string };
  'exam-flow': { patientId: string };
  'create-exam': { patientId: string };
};
