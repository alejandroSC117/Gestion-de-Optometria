import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function OpticalCalculationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const [mode, setMode] = useState<'vertex' | 'near'>('vertex');
  const [power, setPower] = useState('-8.00');
  const [distance, setDistance] = useState('12');
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const p = Number(power);
    const d = Number(distance);
    if (Number.isNaN(p) || Number.isNaN(d)) return setResult(null);
    setResult(mode === 'vertex' ? `${(p / (1 - (d / 1000) * p)).toFixed(2)} D` : `${(p - d / 100).toFixed(2)} mm`);
  }

  return (
    <Screen>
      <TopBar eyebrow="Herramienta clínica" title="Cálculos ópticos" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={[styles.segment, { backgroundColor: colors.secondary }]}>
        <Pressable onPress={() => { setMode('vertex'); setResult(null); }} style={[styles.segmentItem, mode === 'vertex' && { backgroundColor: colors.card }]}><Text style={[styles.segmentText, { color: mode === 'vertex' ? colors.primary : colors.mutedForeground }]}>Distancia vértice</Text></Pressable>
        <Pressable onPress={() => { setMode('near'); setResult(null); }} style={[styles.segmentItem, mode === 'near' && { backgroundColor: colors.card }]}><Text style={[styles.segmentText, { color: mode === 'near' ? colors.primary : colors.mutedForeground }]}>Distancia pupilar</Text></Pressable>
      </View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>{mode === 'vertex' ? 'Compensa una graduación de alta potencia al cambiar la distancia al ojo.' : 'Calcula la distancia de lectura aproximada a partir de la distancia pupilar.'}</Text>
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.formHeader}><View style={[styles.toolIcon, { backgroundColor: '#E7F1FF' }]}><Feather name="sliders" size={19} color={colors.primary} /></View><Text style={[styles.formTitle, { color: colors.foreground }]}>{mode === 'vertex' ? 'Conversión de vértice' : 'Conversión a cerca'}</Text></View>
        <Field label={mode === 'vertex' ? 'Potencia de la lente (D)' : 'Distancia pupilar (mm)'} value={power} onChangeText={setPower} placeholder="-8.00" keyboardType="numeric" />
        <Field label={mode === 'vertex' ? 'Distancia original (mm)' : 'Distancia de trabajo (cm)'} value={distance} onChangeText={setDistance} placeholder="12" keyboardType="numeric" />
        <PrimaryButton label="Calcular" icon="bar-chart-2" onPress={calculate} />
      </View>
      {result ? <View style={[styles.result, { backgroundColor: colors.primary }]}><Text style={styles.resultLabel}>RESULTADO</Text><Text style={styles.resultValue}>{result}</Text><Text style={styles.resultHint}>Resultado orientativo para apoyar tu valoración clínica.</Text></View> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20 },
  segmentItem: { flex: 1, minHeight: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontSize: 12, fontWeight: '700' },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  formCard: { borderWidth: 1, borderRadius: 20, padding: 17 },
  formHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 22, gap: 12 },
  toolIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  formTitle: { fontSize: 16, fontWeight: '700' },
  result: { borderRadius: 22, padding: 20, marginTop: 14 },
  resultLabel: { color: '#A8D6FF', fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  resultValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '700', marginTop: 8 },
  resultHint: { color: '#DDEEFF', fontSize: 11, lineHeight: 16, marginTop: 12 },
});