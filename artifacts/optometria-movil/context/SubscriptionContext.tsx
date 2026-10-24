import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsageSummary } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { AppFeature, PLAN_DEFINITIONS, PlanId, UsageFeature, planAllows } from '@/config/subscription';

type UsageState = { month: string; transposition: number; calculator: number; assistant: number; patients: number; exams: number; prescriptions: number };
type SubscriptionContextValue = {
  plan: PlanId;
  usage: UsageState;
  isLoading: boolean;
  selectPlan: (plan: PlanId) => void;
  canAccess: (feature: AppFeature) => boolean;
  consume: (feature: UsageFeature) => boolean;
  limitFor: (feature: UsageFeature) => number;
};

function currentMonth() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date());
  return `${parts.find((part) => part.type === 'year')?.value}-${parts.find((part) => part.type === 'month')?.value}`;
}

const blankSessionUsage = () => ({ transposition: 0, calculator: 0, assistant: 0 });
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sessionUsage, setSessionUsage] = useState(blankSessionUsage);
  const usageQuery = useQuery({
    queryKey: ['clinic', 'usage', user?.id],
    queryFn: () => getUsageSummary(),
    enabled: Boolean(user?.id),
    retry: false,
  });

  useEffect(() => {
    setSessionUsage(blankSessionUsage());
  }, [user?.id]);

  const plan: PlanId = usageQuery.data?.plan ?? 'free';
  const usage = useMemo<UsageState>(() => ({
    month: usageQuery.data?.month ?? currentMonth(),
    patients: usageQuery.data?.usage.patients ?? 0,
    exams: usageQuery.data?.usage.exams ?? 0,
    prescriptions: usageQuery.data?.usage.prescriptions ?? 0,
    ...sessionUsage,
  }), [sessionUsage, usageQuery.data]);
  const limitFor = useCallback((feature: UsageFeature) => {
    if (feature === 'patients' && usageQuery.data) return usageQuery.data.limits.patients;
    if (feature === 'exams' && usageQuery.data) return usageQuery.data.limits.exams;
    if (feature === 'prescriptions' && usageQuery.data) return usageQuery.data.limits.prescriptions;
    return PLAN_DEFINITIONS[plan].limits[feature] ?? 0;
  }, [plan, usageQuery.data]);
  const canAccess = useCallback((feature: AppFeature) => planAllows(plan, feature), [plan]);
  const consume = useCallback((feature: UsageFeature) => {
    // Patient and exam usage is counted and enforced by the API server.
    if (feature === 'patients' || feature === 'exams' || feature === 'prescriptions') return false;
    const limit = limitFor(feature);
    if (sessionUsage[feature] >= limit) return false;
    setSessionUsage((current) => ({ ...current, [feature]: current[feature] + 1 }));
    return true;
  }, [limitFor, sessionUsage]);
  const selectPlan = useCallback((nextPlan: PlanId) => {
    // A client-side choice must never grant a paid subscription.
    if (nextPlan !== 'free') return;
  }, []);

  const value = useMemo(() => ({
    plan,
    usage,
    isLoading: usageQuery.isLoading,
    selectPlan,
    canAccess,
    consume,
    limitFor,
  }), [canAccess, consume, limitFor, plan, selectPlan, usage, usageQuery.isLoading]);

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return context;
}
