export type PlanId = 'free' | 'pro' | 'clinic';
export type UsageFeature = 'transposition' | 'calculator' | 'assistant';
export type AppFeature = UsageFeature | 'visualExam' | 'patientHistory' | 'prescriptions';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  description: string;
  priceLabel: string;
  features: string[];
  limits: Partial<Record<UsageFeature, number>>;
};

export const USAGE_LIMITS: Record<UsageFeature, number> = {
  transposition: 20,
  calculator: 40,
  assistant: 10,
};

export const PLAN_DEFINITIONS: Record<PlanId, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'NEXUS FREE',
    description: 'Para conocer Nexus y resolver lo esencial.',
    priceLabel: 'Precio por configurar',
    features: ['Calculadoras básicas', 'Historial de uso mensual', 'Asistente Nexus limitado'],
    limits: USAGE_LIMITS,
  },
  pro: {
    id: 'pro',
    name: 'NEXUS PRO',
    description: 'Herramientas profesionales para tu consulta.',
    priceLabel: 'Precio por configurar',
    features: ['Calculadoras completas', 'Exámenes visuales guiados', 'Pacientes y recetas', 'Asistente Nexus'],
    limits: { transposition: 9999, calculator: 9999, assistant: 9999 },
  },
  clinic: {
    id: 'clinic',
    name: 'NEXUS CLINIC',
    description: 'Para equipos, ópticas y consultorios.',
    priceLabel: 'Precio por configurar',
    features: ['Todo lo de Pro', 'Múltiples usuarios', 'Gestión de consultorio', 'Funciones administrativas'],
    limits: { transposition: 9999, calculator: 9999, assistant: 9999 },
  },
};

export const PLAN_ORDER: PlanId[] = ['free', 'pro', 'clinic'];

export function planAllows(plan: PlanId, feature: AppFeature) {
  if (plan === 'clinic' || plan === 'pro') return true;
  return feature === 'transposition' || feature === 'calculator' || feature === 'assistant';
}

export function planLabel(plan: PlanId) {
  return PLAN_DEFINITIONS[plan].name;
}