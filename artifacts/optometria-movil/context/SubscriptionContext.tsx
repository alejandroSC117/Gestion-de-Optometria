import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppFeature, PLAN_DEFINITIONS, PlanId, UsageFeature, planAllows } from '@/config/subscription';

type UsageState = { month: string; transposition: number; calculator: number; assistant: number };
type SubscriptionContextValue = {
  plan: PlanId;
  usage: UsageState;
  isLoading: boolean;
  selectPlan: (plan: PlanId) => void;
  canAccess: (feature: AppFeature) => boolean;
  consume: (feature: UsageFeature) => boolean;
  limitFor: (feature: UsageFeature) => number;
};

const STORAGE_KEY = '@nexus/subscription';
const currentMonth = new Date().toISOString().slice(0, 7);
const blankUsage = (): UsageState => ({ month: currentMonth, transposition: 0, calculator: 0, assistant: 0 });
const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanId>('free');
  const [usage, setUsage] = useState<UsageState>(blankUsage);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as { plan?: PlanId; usage?: UsageState };
        if (parsed.plan && PLAN_DEFINITIONS[parsed.plan]) setPlan(parsed.plan);
        if (parsed.usage?.month === currentMonth) setUsage(parsed.usage);
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!isLoading) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ plan, usage })).catch(() => undefined);
  }, [isLoading, plan, usage]);

  const selectPlan = useCallback((nextPlan: PlanId) => setPlan(nextPlan), []);
  const limitFor = useCallback((feature: UsageFeature) => PLAN_DEFINITIONS[plan].limits[feature] ?? 0, [plan]);
  const canAccess = useCallback((feature: AppFeature) => planAllows(plan, feature), [plan]);
  const consume = useCallback((feature: UsageFeature) => {
    const limit = limitFor(feature);
    if (usage[feature] >= limit) return false;
    setUsage((current) => ({ ...current, [feature]: current[feature] + 1 }));
    return true;
  }, [limitFor, usage]);

  const value = useMemo(() => ({ plan, usage, isLoading, selectPlan, canAccess, consume, limitFor }), [canAccess, consume, isLoading, limitFor, plan, selectPlan, usage]);
  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return context;
}