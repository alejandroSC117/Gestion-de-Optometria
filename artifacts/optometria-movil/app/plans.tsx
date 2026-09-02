import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { PLAN_DEFINITIONS, PLAN_ORDER, type PlanId } from '@/config/subscription';
import { PlanBadge, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function PlansScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { plan: currentPlan, selectPlan } = useSubscription();
  const [selected, setSelected] = useState<PlanId>(currentPlan);
  const choose = () => { selectPlan(selected); router.replace('/(tabs)'); };

  return (
    <Screen>
      <TopBar eyebrow="Nexus" title="Elige tu plan" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.replace(user ? '/(tabs)' : '/welcome') }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Empieza con lo esencial y crece cuando tu práctica lo necesite.</Text>
      {PLAN_ORDER.map((planId) => {
        const plan = PLAN_DEFINITIONS[planId];
        const active = selected === planId;
        return (
          <Pressable key={planId} onPress={() => setSelected(planId)} style={[styles.planCard, { backgroundColor: colors.card, borderColor: active ? colors.primary : colors.border }, active && styles.selectedCard]}>
            <View style={styles.planHeader}><PlanBadge plan={planId} />{planId === 'pro' ? <View style={[styles.recommended, { backgroundColor: colors.primary }]}><Text style={styles.recommendedText}>RECOMENDADO</Text></View> : null}<View style={styles.radio}>{active ? <View style={[styles.radioDot, { backgroundColor: colors.primary }]} /> : null}</View></View>
            <Text style={[styles.planName, { color: colors.foreground }]}>{plan.name}</Text>
            <Text style={[styles.planDescription, { color: colors.mutedForeground }]}>{plan.description}</Text>
            <Text style={[styles.price, { color: colors.foreground }]}>{plan.priceLabel}</Text>
            <View style={styles.featureList}>{plan.features.map((feature) => <View key={feature} style={styles.featureRow}><Feather name="check" size={14} color={colors.primary} /><Text style={[styles.featureText, { color: colors.mutedForeground }]}>{feature}</Text></View>)}</View>
          </Pressable>
        );
      })}
      <PrimaryButton label={selected === 'free' ? 'Continuar con Free' : selected === 'pro' ? 'Elegir Pro' : 'Elegir Clinic'} icon="arrow-right" onPress={choose} />
      <Text style={[styles.note, { color: colors.mutedForeground }]}>Los precios son configurables. Los pagos de App Store y Google Play se integrarán posteriormente.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 19 },
  planCard: { borderWidth: 1, borderRadius: 20, padding: 16, marginBottom: 11 },
  selectedCard: { borderWidth: 2, padding: 15 },
  planHeader: { flexDirection: 'row', alignItems: 'center' },
  recommended: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, marginLeft: 7 },
  recommendedText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#C8D9E7', marginLeft: 'auto', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planName: { fontSize: 17, fontWeight: '700', marginTop: 14 },
  planDescription: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  price: { fontSize: 13, fontWeight: '700', marginTop: 12 },
  featureList: { marginTop: 12, gap: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 12 },
  note: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginTop: 15, marginBottom: 12 },
});