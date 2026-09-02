import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { ActionTile, PatientAvatar, Screen, SectionHeading, StatCard, TopBar, formatDate } from '@/components/NexusUI';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients, appointments, prescriptions } = useClinic();
  const today = '2026-09-02';
  const todayAppointments = appointments
    .filter((appointment) => appointment.date === today && appointment.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));
  const nextAppointment = todayAppointments[0];
  const nextPatient = nextAppointment ? patients.find((patient) => patient.id === nextAppointment.patientId) : undefined;

  return (
    <Screen>
      <TopBar eyebrow="Nexus" title="Hola, Laura" action={{ icon: 'bell', label: 'Avisos', onPress: () => undefined }} />
      <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeEyebrow}>MIÉRCOLES, 2 DE SEPTIEMBRE</Text>
          <Text style={styles.welcomeTitle}>Tu práctica, en foco.</Text>
          <Text style={styles.welcomeBody}>Todo lo que necesitas para revisar y atender mejor.</Text>
        </View>
        <View style={styles.welcomeMark}><Feather name="crosshair" size={28} color={colors.primary} /></View>
      </View>

      <SectionHeading title="Resumen de hoy" action="Ver agenda" />
      <View style={styles.statsRow}>
        <StatCard value={String(todayAppointments.length)} label="Citas hoy" icon="calendar" />
        <StatCard value={String(patients.length)} label="Pacientes" icon="users" />
        <StatCard value={String(prescriptions.length)} label="Recetas" icon="file-text" />
      </View>

      <SectionHeading title="Herramientas clínicas" />
      <View style={styles.actionGrid}>
        <ActionTile icon="refresh-cw" label="Transponer cilindro" caption="Cambia la forma de la receta" onPress={() => router.push('/tools/transposition')} />
        <ActionTile icon="sliders" label="Cálculos ópticos" caption="Vértice y distancia pupilar" onPress={() => router.push('/tools/optical-calculations')} />
        <ActionTile icon="eye" label="Examen visual" caption="Registra una nueva valoración" onPress={() => router.push('/tools/visual-exam')} />
        <ActionTile icon="file-text" label="Recetas" caption="Consulta graduaciones guardadas" onPress={() => router.push('/prescriptions')} />
      </View>
      <ActionTile wide icon="users" label="Historial de pacientes" caption="Busca expedientes y evolución clínica" onPress={() => router.push('/patients')} />

      <SectionHeading title="Siguiente cita" action="Agenda" />
      {nextAppointment && nextPatient ? (
        <Pressable
          onPress={() => router.push({ pathname: '/patient/[id]', params: { id: String(nextPatient.id) } })}
          style={({ pressed }) => [styles.nextCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.78 }]}
        >
          <PatientAvatar patient={nextPatient} size={48} />
          <View style={styles.nextCopy}>
            <Text style={[styles.nextTime, { color: colors.primary }]}>{nextAppointment.time} · {formatDate(nextAppointment.date)}</Text>
            <Text style={[styles.nextName, { color: colors.foreground }]}>{nextPatient.firstName} {nextPatient.lastName}</Text>
            <Text style={[styles.nextMeta, { color: colors.mutedForeground }]}>Examen visual · Consultorio 1</Text>
          </View>
          <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
        </Pressable>
      ) : (
        <Text style={[styles.noNext, { color: colors.mutedForeground }]}>No hay citas pendientes para hoy.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  welcomeCard: { borderRadius: 24, padding: 20, minHeight: 156, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
  welcomeCopy: { flex: 1 },
  welcomeEyebrow: { color: '#B7E5DC', fontSize: 10, fontWeight: '700', letterSpacing: 1.2, marginBottom: 10 },
  welcomeTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '700', letterSpacing: -0.6 },
  welcomeBody: { color: '#DDF4EF', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 225 },
  welcomeMark: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D4F1E7', alignItems: 'center', justifyContent: 'center', opacity: 0.95 },
  statsRow: { flexDirection: 'row', marginRight: -9 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  nextCard: { minHeight: 84, borderRadius: 18, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center' },
  nextCopy: { flex: 1, marginLeft: 12 },
  nextTime: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  nextName: { fontSize: 15, fontWeight: '700' },
  nextMeta: { fontSize: 12, marginTop: 3 },
  noNext: { fontSize: 13, paddingVertical: 12 },
});
