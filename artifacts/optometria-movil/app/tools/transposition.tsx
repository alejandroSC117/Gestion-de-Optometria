import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';

export default function TranspositionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { consume } = useSubscription();
  const [sphere, setSphere] = useState('-1.25');
  const [cylinder, setCylinder] = useState('-0.50');
  const [axis, setAxis] = useState('90');
  const [result, setResult] = useState<{ sphere: string; cylinder: string; axis: number } | null>(null);
  const [limitMessage, setLimitMessage] = useState('');

  function calculate() {
    const s = Number(sphere);
    const c = Number(cylinder);
    const a = Number(axis);
    if ([s, c, a].some((value) => Number.isNaN(value)) || a < 0 || a > 180) {
      setResult(null);
      return;
    }
    if (!consume('transposition')) {
      setLimitMessage('Has alcanzado el límite de tu plan gratuito. Actualiza a Nexus Pro para continuar.');
      setResult(null);
      return;
    }
    setLimitMessage('');
    setResult({ sphere: (s + c).toFixed(2), cylinder: (-c).toFixed(2), axis: a === 0 ? 90 : a > 90 ? a - 90 : a + 90 });
  }

  return (
    <Screen>
      <TopBar eyebrow="Herramienta clínica" title="Transponer cilindro" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Convierte una receta de cilindro positivo a negativo en segundos.</Text>
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.formHeader}>
          <View style={[styles.toolIcon, { backgroundColor: colors.accent }]}><Feather name="refresh-cw" size={19} color={colors.primary} /></View>
          <View><Text style={[styles.formTitle, { color: colors.foreground }]}>Receta original</Text><Text style={[styles.formSubtitle, { color: colors.mutedForeground }]}>Introduce los valores del ojo</Text></View>
        </View>
        <Field label="Esfera (D)" value={sphere} onChangeText={setSphere} placeholder="-1.25" keyboardType="numeric" />
        <Field label="Cilindro (D)" value={cylinder} onChangeText={setCylinder} placeholder="-0.50" keyboardType="numeric" />
        <Field label="Eje (°)" value={axis} onChangeText={setAxis} placeholder="90" keyboardType="numeric" />
        <PrimaryButton label="Calcular transposición" icon="arrow-right" onPress={calculate} />
        {limitMessage ? <Text style={[styles.limitMessage, { color: colors.destructive }]}>{limitMessage}</Text> : null}
      </View>
      {result ? (
        <View style={[styles.resultCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.resultLabel}>RESULTADO</Text>
          <Text style={styles.resultTitle}>Cilindro negativo</Text>
          <View style={styles.resultValues}>
            <View><Text style={styles.valueLabel}>ESF</Text><Text style={styles.value}>{result.sphere}</Text></View>
            <View><Text style={styles.valueLabel}>CIL</Text><Text style={styles.value}>{result.cylinder}</Text></View>
            <View><Text style={styles.valueLabel}>EJE</Text><Text style={styles.value}>{result.axis}°</Text></View>
          </View>
          <Text style={styles.resultNote}>La potencia esférica se ajustó sumando el cilindro.</Text>
        </View>
      ) : (
        <View style={[styles.tipCard, { backgroundColor: colors.secondary }]}>
          <Feather name="info" size={17} color={colors.primary} />
          <Text style={[styles.tipText, { color: colors.secondaryForeground }]}>El eje debe estar entre 0° y 180°. Usa punto para los decimales.</Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 20, maxWidth: 320 },
  formCard: { borderWidth: 1, borderRadius: 20, padding: 17 },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  toolIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  formTitle: { fontSize: 16, fontWeight: '700' },
  formSubtitle: { fontSize: 12, marginTop: 3 },
  resultCard: { borderRadius: 22, padding: 20, marginTop: 14 },
  resultLabel: { color: '#A8D6FF', fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  resultTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700', marginTop: 7 },
  resultValues: { flexDirection: 'row', marginTop: 22, gap: 38 },
  valueLabel: { color: '#A8D6FF', fontSize: 10, fontWeight: '700', marginBottom: 5 },
  value: { color: '#FFFFFF', fontSize: 24, fontWeight: '700' },
  resultNote: { color: '#DDEEFF', fontSize: 11, marginTop: 18, lineHeight: 16 },
  tipCard: { borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 14 },
  tipText: { flex: 1, fontSize: 12, lineHeight: 18 },
  limitMessage: { fontSize: 12, lineHeight: 18, marginTop: 12 },
});