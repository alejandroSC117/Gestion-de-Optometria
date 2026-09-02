// NEXUS Application Constants

export const NEXUS_VERSION = '1.0.0';
export const NEXUS_NAME = 'NEXUS';
export const NEXUS_TAGLINE = 'Asistente inteligente para optometría';

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'NEXUS FREE',
    description: 'Acceso básico a calculadoras',
    limits: {
      monthlyCalculations: 50,
      aiConsultations: 10,
      patients: 5,
    },
  },
  PRO: {
    id: 'pro',
    name: 'NEXUS PRO',
    description: 'Acceso profesional completo',
    limits: {
      monthlyCalculations: 1000,
      aiConsultations: 100,
      patients: 100,
    },
  },
  CLINIC: {
    id: 'clinic',
    name: 'NEXUS CLINIC',
    description: 'Solución empresarial para consultorios',
    limits: {
      monthlyCalculations: -1, // Unlimited
      aiConsultations: -1, // Unlimited
      patients: -1, // Unlimited
    },
  },
};

// Professional Categories
export const PROFESSIONAL_CATEGORIES = [
  'Optometrista',
  'Estudiante de optometría',
  'Otro profesional',
];

// Support Categories
export const SUPPORT_CATEGORIES = [
  'Problema técnico',
  'Duda de uso',
  'Sugerencia',
  'Reporte de bug',
  'Otro',
];

// Support Ticket Statuses
export const TICKET_STATUSES = {
  OPEN: 'abierto',
  IN_REVIEW: 'en_revision',
  IN_PROGRESS: 'en_proceso',
  RESOLVED: 'resuelto',
  CLOSED: 'cerrado',
};

// Colors
export const COLORS = {
  primary: '#1e40af', // Blue
  secondary: '#7c3aed', // Violet
  success: '#059669', // Green
  warning: '#f59e0b', // Amber
  error: '#dc2626', // Red
  neutral: '#6b7280', // Gray
};
