import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useClinic } from '@/context/ClinicContext';
import { ActionTile, PatientAvatar, PlanBadge, Screen, SectionHeading, StatCard, TopBar, UsageProgress, formatDate } from '@/components/NexusUI';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();
  const { plan, usage, limitFor } = useSubscription();
  const { patients, appointments, prescriptions } = useClinic();
  const today = '2026-09-02';
  const todayAppointments = appointments.filter((appointment) => appointment.date === today && appointment.status !== 'cancelled').sort((a, b) => a.time.localeCompare(b.time));
  const nextAppointment = todayAppointments[0];
  const nextPatient = nextAppointment ? patients.find((patient) => patient.id === nextAppointment.patientId) : undefined;

  return (
    <Screen>
      <TopBar eyebrow="Nexus" title={`Hola, ${user?.name?.split(' ')[0] || 'profesional'}`} action={{ icon: 'settings', label: 'Ajustes', onPress: () => router.push('/settings') }} />
      <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
        <View style={styles.welcomeCopy}><Text style={[styles.welcomeEyebrow, { color: colors.accent }]}>ASISTENTE INTELIGENTE PARA OPTOMETRÍA</Text><Text style={styles.welcomeTitle}>Tu práctica, en foco.</Text><Text style={[styles.welcomeBody, { color: colors.card }]}>Herramientas profesionales para acompañar tu consulta.</Text><View style={styles.planLine}><PlanBadge plan={plan} /><Text style={[styles.usageText, { color: colors.card }]}>Uso mensual disponible</Text></View></View>
        <View style={[styles.welcomeMark, { backgroundColor: colors.accent }]}><Feather name="eye" size={27} color={colors.primary} /></View>
      </View>
      <SectionHeading title="Resumen de hoy" action="Ver agenda" />
      <View style={styles.statsRow}><StatCard value={String(todayAppointments.length)} label="Citas hoy" icon="calendar" /><StatCard value={String(patients.length)} label="Pacientes" icon="users" /><StatCard value={String(prescriptions.length)} label="Recetas" icon="file-text" /></View>
      {plan === 'free' ? <View style={[styles.usageCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.usageHeading}><Text style={[styles.usageTitle, { color: colors.foreground }]}>Tu uso mensual</Text><Text style={[styles.usageHint, { color: colors.mutedForeground }]}>{usage.calculator} de {limitFor('calculator')} calculadoras</Text></View><UsageProgress feature="calculator" used={usage.calculator} limit={limitFor('calculator')} /></View> : null}
      <SectionHeading title="Accesos rápidos" />
      <View style={styles.actionGrid}><ActionTile wide icon="eye" label="Nuevo examen" caption="Inicia una valoración paso a paso" onPress={() => router.push('/exam/new')} /><ActionTile icon="sliders" label="Calculadoras" caption="Resuelve cálculos ópticos" onPress={() => router.push('/calculators')} /><ActionTile icon="file-text" label="Recetas" caption="Consulta graduaciones" onPress={() => router.push('/prescriptions')} /><ActionTile icon="message-circle" label="Nexus AI" caption="Apoyo profesional" onPress={() => router.push('/nexus-ai')} /><ActionTile icon="users" label="Pacientes" caption="Busca expedientes" onPress={() => router.push('/patients')} /></View>
      <SectionHeading title="Siguiente cita" action="Agenda" />
      {nextAppointment && nextPatient ? <Pressable onPress={() => router.push({ pathname: '/patient/[id]', params: { id: String(nextPatient.id) } })} style={({ pressed }) => [styles.nextCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.78 }]}><PatientAvatar patient={nextPatient} size={48} /><View style={styles.nextCopy}><Text style={[styles.nextTime, { color: colors.primary }]}>{nextAppointment.time} · {formatDate(nextAppointment.date)}</Text><Text style={[styles.nextName, { color: colors.foreground }]}>{nextPatient.firstName} {nextPatient.lastName}</Text><Text style={[styles.nextMeta, { color: colors.mutedForeground }]}>Examen visual · Consultorio 1</Text></View><Feather name="chevron-right" size={19} color={colors.mutedForeground} /></Pressable> : <Text style={[styles.noNext, { color: colors.mutedForeground }]}>No hay citas pendientes para hoy.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeCard: { borderRadius: 24, padding: 20, minHeight: 177, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  welcomeCopy: { flex: 1 },
  welcomeEyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10 },
  welcomeTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '700', letterSpacing: -0.6 },
  welcomeBody: { fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 230 },
  welcomeMark: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  planLine: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 14 },
  usageText: { fontSize: 10, opacity: 0.85 },
  statsRow: { flexDirection: 'row', marginRight: -9 },
  usageCard: { borderWidth: 1, borderRadius: 17, padding: 13, marginTop: 14 },
  usageHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  usageTitle: { fontSize: 13, fontWeight: '700' },
  usageHint: { fontSize: 10 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nextCard: { minHeight: 84, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center' },
  nextCopy: { flex: 1, marginLeft: 12 },
  nextTime: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  nextName: { fontSize: 15, fontWeight: '700' },
  nextMeta: { fontSize: 12, marginTop: 3 },
  noNext: { fontSize: 13, paddingVertical: 12 },
});