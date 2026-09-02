import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import { UpgradeCard, Screen, TopBar } from '@/components/NexusUI';

const sections = ['Datos del paciente', 'Agudeza visual', 'Refracción objetiva', 'Refracción subjetiva', 'Balance binocular', 'Pruebas complementarias', 'Resultado final y receta'];

export default function NewExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const { canAccess } = useSubscription();
  if (!canAccess('visualExam')) return <Screen><TopBar eyebrow="Nuevo examen" title="Examen visual" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Exámenes guiados son Pro" message="Actualiza a Nexus Pro para guardar valoraciones y acompañar la consulta paso a paso." onPress={() => router.push('/plans')} /></Screen>;
  return <Screen><TopBar eyebrow="Flujo clínico" title="Nuevo examen" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>Esta estructura está lista para incorporar tus protocolos clínicos posteriormente.</Text><View style={[styles.notice, { backgroundColor: colors.secondary }]}><Feather name="info" size={17} color={colors.primary} /><Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>Por ahora Nexus no inventa procedimientos ni protocolos: solo prepara el recorrido.</Text></View><View style={styles.timeline}>{sections.map((section, index) => <Pressable key={section} onPress={() => index === 0 ? router.push('/tools/visual-exam') : undefined} disabled={index !== 0} style={[styles.step, { borderColor: colors.border, backgroundColor: colors.card }, index === 0 && { borderColor: colors.primary }]}><View style={[styles.stepNumber, { backgroundColor: index === 0 ? colors.primary : colors.secondary }]}><Text style={[styles.stepNumberText, { color: index === 0 ? colors.primaryForeground : colors.primary }]}>{index + 1}</Text></View><View style={styles.stepCopy}><Text style={[styles.stepTitle, { color: colors.foreground }]}>{section}</Text><Text style={[styles.stepCaption, { color: colors.mutedForeground }]}>{index === 0 ? 'Comenzar con datos del paciente' : 'Preparado para futura implementación'}</Text></View><Feather name={index === 0 ? 'arrow-right' : 'lock'} size={16} color={index === 0 ? colors.primary : colors.mutedForeground} /></Pressable>)}</View></Screen>;
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 15 },
  notice: { flexDirection: 'row', gap: 9, padding: 14, borderRadius: 15, marginBottom: 18 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  timeline: { gap: 9 },
  step: { minHeight: 70, borderWidth: 1, borderRadius: 17, padding: 11, flexDirection: 'row', alignItems: 'center' },
  stepNumber: { width: 35, height: 35, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: '700' },
  stepCopy: { flex: 1, marginLeft: 11 },
  stepTitle: { fontSize: 13, fontWeight: '700' },
  stepCaption: { fontSize: 11, marginTop: 4 },
});