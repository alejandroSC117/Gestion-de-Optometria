import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { EmptyState, PatientAvatar, PrimaryButton, Screen, SectionHeading, StatusPill, TopBar, UpgradeCard, formatDate } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';

export default function PatientDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPatient, getPatientAppointments, getPatientPrescription, getPatientExams } = useClinic();
  const { canAccess } = useSubscription();
  const patient = getPatient(Number(id));
  const appointments = useMemo(() => patient ? getPatientAppointments(patient.id) : [], [getPatientAppointments, patient]);
  const exams = useMemo(() => patient ? getPatientExams(patient.id) : [], [getPatientExams, patient]);
  const prescription = patient ? getPatientPrescription(patient.id) : undefined;

  if (!canAccess('patientHistory')) {
    return <Screen><TopBar eyebrow="Expediente" title="Detalle" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Historial avanzado es Pro" message="Actualiza a Nexus Pro para consultar perfiles, exámenes y recetas de tus pacientes." onPress={() => router.push('/plans')} /></Screen>;
  }

  if (!patient) {
    return <Screen><TopBar title="Paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><EmptyState icon="user-x" title="Expediente no encontrado" message="Este paciente ya no está disponible." /></Screen>;
  }

  return (
    <Screen>
      <TopBar eyebrow="Expediente activo" title="Detalle" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <PatientAvatar patient={patient} size={62} />
        <Text style={styles.profileName}>{patient.firstName} {patient.lastName}</Text>
        <Text style={styles.profileMeta}>{patient.email || 'Sin correo registrado'}</Text>
        <View style={styles.profileActions}>
          {patient.phone ? <Pressable onPress={() => Linking.openURL(`tel:${patient.phone}`)} style={styles.profileAction}><Feather name="phone" size={15} color={colors.primary} /><Text style={[styles.profileActionText, { color: colors.primary }]}>Llamar</Text></Pressable> : null}
          <Pressable onPress={() => router.push({ pathname: '/appointment/new', params: { patientId: String(patient.id) } })} style={styles.profileAction}><Feather name="calendar" size={15} color={colors.primary} /><Text style={[styles.profileActionText, { color: colors.primary }]}>Agendar</Text></Pressable>
        </View>
      </View>
      <View style={styles.quickInfo}>
        <View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>TELÉFONO</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{patient.phone || '—'}</Text></View>
        <View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>NACIMIENTO</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{patient.birthDate || '—'}</Text></View>
      </View>
      <SectionHeading title="Última graduación" action="Recetas" />
      {prescription ? <View style={[styles.rxCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rxHeader}><Feather name="file-text" size={17} color={colors.primary} /><Text style={[styles.rxDate, { color: colors.mutedForeground }]}> {formatDate(prescription.issuedDate)}</Text></View><View style={styles.rxRow}><Text style={[styles.rxEye, { color: colors.mutedForeground }]}>OD</Text><Text style={[styles.rxText, { color: colors.foreground }]}>{prescription.odSphere.toFixed(2)} · {prescription.odCylinder.toFixed(2)} · {prescription.odAxis}°</Text></View><View style={styles.rxRow}><Text style={[styles.rxEye, { color: colors.mutedForeground }]}>OI</Text><Text style={[styles.rxText, { color: colors.foreground }]}>{prescription.osSphere.toFixed(2)} · {prescription.osCylinder.toFixed(2)} · {prescription.osAxis}°</Text></View></View> : <EmptyState icon="file-text" title="Sin graduación" message="Registra una receta para verla aquí." />}
      <SectionHeading title="Exámenes" />
      {exams.length ? exams.slice(0, 2).map((exam) => <View key={exam.id} style={[styles.examRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.examBadge, { backgroundColor: colors.secondary }]}><Feather name="eye" size={16} color={colors.primary} /></View><View style={styles.examCopy}><Text style={[styles.examDate, { color: colors.foreground }]}>{formatDate(exam.examDate)} · Agudeza {exam.visualAcuityRight} / {exam.visualAcuityLeft}</Text><Text style={[styles.examNote, { color: colors.mutedForeground }]}>{exam.observations || 'Sin observaciones'}</Text></View></View>) : <Text style={[styles.muted, { color: colors.mutedForeground }]}>No hay exámenes registrados.</Text>}
      <SectionHeading title="Próximas citas" />
      {appointments.filter((appointment) => appointment.status !== 'completed' && appointment.status !== 'cancelled').slice(0, 2).map((appointment) => <View key={appointment.id} style={[styles.appointmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View><Text style={[styles.appointmentDate, { color: colors.primary }]}>{formatDate(appointment.date)} · {appointment.time}</Text><Text style={[styles.appointmentNote, { color: colors.foreground }]}>{appointment.notes || 'Consulta programada'}</Text></View><StatusPill status={appointment.status} /></View>)}
      <PrimaryButton label="Registrar examen visual" icon="eye" onPress={() => router.push('/tools/visual-exam')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { alignItems: 'center', borderRadius: 24, padding: 22 },
  profileName: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginTop: 11 },
  profileMeta: { color: '#DDEEFF', fontSize: 12, marginTop: 4 },
  profileActions: { flexDirection: 'row', gap: 9, marginTop: 18 },
  profileAction: { backgroundColor: '#FFFFFF', minHeight: 34, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileActionText: { fontSize: 11, fontWeight: '700' },
  quickInfo: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 3, marginTop: 20 },
  infoLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.7, marginBottom: 5 },
  infoValue: { fontSize: 12, fontWeight: '600' },
  rxCard: { borderWidth: 1, borderRadius: 17, padding: 15 },
  rxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  rxDate: { fontSize: 12 },
  rxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 7 },
  rxEye: { fontSize: 12, fontWeight: '700', width: 32 },
  rxText: { fontSize: 13, fontWeight: '600' },
  examRow: { borderWidth: 1, borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  examBadge: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  examCopy: { flex: 1, marginLeft: 10 },
  examDate: { fontSize: 12, fontWeight: '700' },
  examNote: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  muted: { fontSize: 13 },
  appointmentRow: { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  appointmentDate: { fontSize: 11, fontWeight: '700' },
  appointmentNote: { fontSize: 13, fontWeight: '600', marginTop: 4, maxWidth: 190 },
});