import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic, type Appointment } from '@/context/ClinicContext';
import { EmptyState, PatientAvatar, Screen, StatusPill, TopBar, formatDate } from '@/components/NexusUI';

const typeLabels: Record<Appointment['type'], string> = { exam: 'Examen visual', follow_up: 'Seguimiento', fitting: 'Adaptación', pickup: 'Entrega de lentes' };

export default function AppointmentsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients, appointments, updateAppointmentStatus } = useClinic();
  const today = '2026-09-02';
  const days = ['2026-09-02', '2026-09-03', '2026-09-04'];
  const [selectedDay] = [today];
  const dayAppointments = useMemo(() => appointments.filter((appointment) => appointment.date === selectedDay).sort((a, b) => a.time.localeCompare(b.time)), [appointments, selectedDay]);

  return (
    <Screen>
      <TopBar eyebrow="Consulta" title="Agenda" action={{ icon: 'plus', label: 'Nueva cita', onPress: () => router.push('/appointment/new') }} />
      <View style={styles.dayPicker}>
        {days.map((day, index) => {
          const active = day === selectedDay;
          return (
            <View key={day} style={styles.daySlot}>
              <Text style={[styles.dayName, { color: active ? colors.primary : colors.mutedForeground }]}>{index === 0 ? 'HOY' : index === 1 ? 'JUE' : 'VIE'}</Text>
              <View style={[styles.dayNumber, active && { backgroundColor: colors.primary }]}>
                <Text style={[styles.dayNumberText, { color: active ? colors.primaryForeground : colors.foreground }]}>{day.slice(-2)}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.dateHeading}>
        <Text style={[styles.dateTitle, { color: colors.foreground }]}>Miércoles, 2 sep</Text>
        <Text style={[styles.dateCount, { color: colors.mutedForeground }]}>{dayAppointments.length} citas</Text>
      </View>
      {dayAppointments.length ? dayAppointments.map((appointment) => {
        const patient = patients.find((item) => item.id === appointment.patientId);
        if (!patient) return null;
        const isCompleted = appointment.status === 'completed';
        return (
          <View key={appointment.id} style={[styles.appointmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.timeColumn}>
              <Text style={[styles.time, { color: colors.foreground }]}>{appointment.time}</Text>
              <View style={[styles.timeLine, { backgroundColor: isCompleted ? colors.secondary : colors.accent }]} />
            </View>
            <Pressable
              onPress={() => router.push({ pathname: '/patient/[id]', params: { id: String(patient.id) } })}
              style={({ pressed }) => [styles.appointmentBody, pressed && { opacity: 0.75 }]}
            >
              <View style={styles.appointmentTop}>
                <PatientAvatar patient={patient} size={38} />
                <View style={styles.appointmentCopy}>
                  <Text style={[styles.appointmentName, { color: colors.foreground }]}>{patient.firstName} {patient.lastName}</Text>
                  <Text style={[styles.appointmentType, { color: colors.mutedForeground }]}>{typeLabels[appointment.type]}</Text>
                </View>
                <StatusPill status={appointment.status} />
              </View>
              <View style={styles.appointmentBottom}>
                <Text style={[styles.appointmentNote, { color: colors.mutedForeground }]}>{appointment.notes || 'Sin notas para esta cita'}</Text>
                {!isCompleted && appointment.status !== 'cancelled' ? (
                  <Pressable
                    accessibilityLabel="Marcar como atendida"
                    testID={`complete-appointment-${appointment.id}`}
                    onPress={() => updateAppointmentStatus(appointment.id, 'completed')}
                    style={({ pressed }) => [styles.completeButton, { borderColor: colors.border }, pressed && { opacity: 0.6 }]}
                  >
                    <Feather name="check" size={14} color={colors.primary} />
                    <Text style={[styles.completeText, { color: colors.primary }]}>Atender</Text>
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          </View>
        );
      }) : <EmptyState icon="calendar" title="Agenda despejada" message="No hay citas registradas para este día." />}
      <Text style={[styles.helper, { color: colors.mutedForeground }]}>Última sincronización local · {formatDate(today)}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayPicker: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 15, borderRadius: 20, backgroundColor: '#EAF3FF' },
  daySlot: { alignItems: 'center', width: 54 },
  dayName: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  dayNumber: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dayNumberText: { fontSize: 14, fontWeight: '700' },
  dateHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25, marginBottom: 12 },
  dateTitle: { fontSize: 17, fontWeight: '700' },
  dateCount: { fontSize: 12 },
  appointmentCard: { borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: 'row', marginBottom: 10 },
  timeColumn: { width: 49, alignItems: 'center' },
  time: { fontSize: 12, fontWeight: '700' },
  timeLine: { width: 2, flex: 1, borderRadius: 2, marginTop: 10, minHeight: 42 },
  appointmentBody: { flex: 1, marginLeft: 8 },
  appointmentTop: { flexDirection: 'row', alignItems: 'center' },
  appointmentCopy: { flex: 1, marginLeft: 10 },
  appointmentName: { fontSize: 14, fontWeight: '700' },
  appointmentType: { fontSize: 11, marginTop: 3 },
  appointmentBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 14, minHeight: 24 },
  appointmentNote: { flex: 1, fontSize: 11 },
  completeButton: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  completeText: { fontSize: 10, fontWeight: '700' },
  helper: { textAlign: 'center', fontSize: 11, marginTop: 20 },
});