import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic, type Appointment } from '@/context/ClinicContext';
import { Field, PatientAvatar, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

const appointmentTypes: { value: Appointment['type']; label: string }[] = [
  { value: 'exam', label: 'Examen' },
  { value: 'follow_up', label: 'Seguimiento' },
  { value: 'fitting', label: 'Adaptación' },
  { value: 'pickup', label: 'Entrega' },
];

export default function NewAppointmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ patientId?: string }>();
  const colors = useColors();
  const { patients, addAppointment } = useClinic();
  const [patientId, setPatientId] = useState(Number(params.patientId) || patients[0]?.id || 0);
  const [date, setDate] = useState('2026-09-03');
  const [time, setTime] = useState('10:00');
  const [type, setType] = useState<Appointment['type']>('exam');
  const [notes, setNotes] = useState('');
  const patient = patients.find((item) => item.id === patientId);

  function save() {
    if (!patientId || !date || !time) return;
    addAppointment({ patientId, date, time, type, notes });
    router.back();
  }

  return (
    <Screen>
      <TopBar eyebrow="Agenda" title="Nueva cita" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Programa una consulta y mantén la agenda de Nexus al día.</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>Paciente</Text>
      <View style={styles.patientStrip}>
        {patients.slice(0, 4).map((item) => (
          <Pressable key={item.id} onPress={() => setPatientId(item.id)} style={[styles.patientChoice, { backgroundColor: patientId === item.id ? colors.secondary : colors.card, borderColor: patientId === item.id ? colors.primary : colors.border }]}>
            <PatientAvatar patient={item} size={34} />
            <Text numberOfLines={1} style={[styles.patientText, { color: patientId === item.id ? colors.primary : colors.foreground }]}>{item.firstName}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.twoColumns}><View style={styles.column}><Field label="Fecha" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" /></View><View style={styles.column}><Field label="Hora" value={time} onChangeText={setTime} placeholder="10:00" /></View></View>
      <Text style={[styles.label, { color: colors.foreground }]}>Tipo de cita</Text>
      <View style={styles.typeGrid}>{appointmentTypes.map((item) => <Pressable key={item.value} onPress={() => setType(item.value)} style={[styles.typeChoice, { backgroundColor: type === item.value ? colors.primary : colors.card, borderColor: type === item.value ? colors.primary : colors.border }]}><Text style={[styles.typeText, { color: type === item.value ? colors.primaryForeground : colors.foreground }]}>{item.label}</Text></Pressable>)}</View>
      <Field label="Nota" value={notes} onChangeText={setNotes} placeholder="Motivo o detalle de la cita..." multiline />
      <PrimaryButton label={`Agendar${patient ? ` para ${patient.firstName}` : ''}`} icon="calendar" onPress={save} disabled={!patientId} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 9 },
  patientStrip: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  patientChoice: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 7, alignItems: 'center' },
  patientText: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 19 },
  typeChoice: { borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center' },
  typeText: { fontSize: 12, fontWeight: '700' },
});