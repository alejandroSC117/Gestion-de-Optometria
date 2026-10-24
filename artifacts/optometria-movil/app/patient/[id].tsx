import { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { listPatientConsultations, listPatientPrescriptions } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useClinic, type Exam, type Prescription } from '@/context/ClinicContext';
import { EmptyState, PatientAvatar, PrimaryButton, Screen, SectionHeading, StatusPill, TopBar, UpgradeCard, formatDate } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function textValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : '—';
}

function numberValue(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function PatientDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPatient, getPatientAppointments, getPatientPrescription, getPatientExams, isHydrated } = useClinic();
  const { canAccess } = useSubscription();
  const { user } = useAuth();
  const patient = getPatient(id ?? '');
  const appointments = useMemo(() => patient ? getPatientAppointments(patient.id) : [], [getPatientAppointments, patient]);
  const examsInMemory = useMemo(() => patient ? getPatientExams(patient.id) : [], [getPatientExams, patient]);
  const prescriptionInMemory = patient ? getPatientPrescription(patient.id) : undefined;
  const prescriptionsQuery = useQuery({
    queryKey: ['clinic', 'prescriptions', id],
    queryFn: () => listPatientPrescriptions(id ?? ''),
    enabled: Boolean(id && user?.id),
    retry: false,
  });
  const consultationsQuery = useQuery({
    queryKey: ['clinic', 'consultations', id],
    queryFn: () => listPatientConsultations(id ?? ''),
    enabled: Boolean(id && user?.id),
    retry: false,
  });
  const remotePrescription = useMemo<Prescription | undefined>(() => {
    const row = prescriptionsQuery.data?.[0];
    if (!row) return undefined;
    const data = record(row.prescriptionData);
    return {
      id: row.id,
      patientId: row.patientId,
      consultationId: row.consultationId,
      issuedDate: row.issuedAt,
      odSphere: numberValue(data.odSphere),
      odCylinder: numberValue(data.odCylinder),
      odAxis: numberValue(data.odAxis),
      osSphere: numberValue(data.osSphere),
      osCylinder: numberValue(data.osCylinder),
      osAxis: numberValue(data.osAxis),
      addPower: numberValue(data.addPower),
      odAdd: numberValue(data.odAdd),
      odPrism: typeof data.odPrism === 'string' ? data.odPrism : undefined,
      osAdd: numberValue(data.osAdd),
      osPrism: typeof data.osPrism === 'string' ? data.osPrism : undefined,
      dp: typeof data.dp === 'string' ? data.dp : undefined,
      height: typeof data.height === 'string' ? data.height : undefined,
      observations: typeof data.observations === 'string' ? data.observations : undefined,
      lensType: textValue(data.lensType),
      provider: record(row.professionalSnapshot) as unknown as Prescription['provider'],
    };
  }, [prescriptionsQuery.data]);
  const prescription = prescriptionInMemory ?? remotePrescription;
  const remoteExams = useMemo<Exam[]>(() => (consultationsQuery.data ?? []).map((row, index) => {
    const clinicalData = record(row.clinicalData);
    const acuity = record(clinicalData.acuity);
    const od = record(acuity.od);
    const oi = record(acuity.oi);
    const tests = record(clinicalData.tests);
    return {
      id: index,
      patientId: row.patientId,
      examDate: row.consultationDate,
      visualAcuityRight: textValue(od.distanceCorrected),
      visualAcuityLeft: textValue(oi.distanceCorrected),
      intraocularPressureRight: textValue(tests.intraocularPressureRight),
      intraocularPressureLeft: textValue(tests.intraocularPressureLeft),
      observations: row.observations ?? '',
    };
  }), [consultationsQuery.data]);
  const exams = examsInMemory.length ? examsInMemory : remoteExams;

  if (!canAccess('patientHistory')) {
    return <Screen><TopBar eyebrow="Expediente" title="Detalle" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Historial avanzado es Pro" message="Actualiza a Nexus Pro para consultar perfiles, exámenes y recetas de tus pacientes." onPress={() => router.push('/plans')} /></Screen>;
  }

  if (!patient && !isHydrated) {
    return <Screen><TopBar title="Paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.muted, { color: colors.mutedForeground }]}>Cargando expediente…</Text></Screen>;
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
          <Pressable onPress={() => router.push({ pathname: '/patient/edit', params: { id: patient.id } })} style={styles.profileAction}><Feather name="edit-2" size={15} color={colors.primary} /><Text style={[styles.profileActionText, { color: colors.primary }]}>Editar</Text></Pressable>
          {patient.phone ? <Pressable onPress={() => Linking.openURL(`tel:${patient.phone}`)} style={styles.profileAction}><Feather name="phone" size={15} color={colors.primary} /><Text style={[styles.profileActionText, { color: colors.primary }]}>Llamar</Text></Pressable> : null}
          <Pressable onPress={() => router.push({ pathname: '/appointment/new', params: { patientId: String(patient.id) } })} style={styles.profileAction}><Feather name="calendar" size={15} color={colors.primary} /><Text style={[styles.profileActionText, { color: colors.primary }]}>Agendar</Text></Pressable>
        </View>
      </View>
      <View style={styles.quickInfo}>
        <View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>TELÉFONO</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{patient.phone || '—'}</Text></View>
        <View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>NACIMIENTO</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{patient.birthDate || '—'}</Text></View>
        <View><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>ÚLTIMA CONSULTA</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{consultationsQuery.data?.[0] ? formatDate(consultationsQuery.data[0].consultationDate) : '—'}</Text></View>
      </View>
      <SectionHeading title="Última graduación" action="Recetas" />
      {prescription ? <View style={[styles.rxCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rxHeader}><Feather name="file-text" size={17} color={colors.primary} /><Text style={[styles.rxDate, { color: colors.mutedForeground }]}> {formatDate(prescription.issuedDate)}</Text></View><View style={styles.rxRow}><Text style={[styles.rxEye, { color: colors.mutedForeground }]}>OD</Text><Text style={[styles.rxText, { color: colors.foreground }]}>{prescription.odSphere.toFixed(2)} · {prescription.odCylinder.toFixed(2)} · {prescription.odAxis}°</Text></View><View style={styles.rxRow}><Text style={[styles.rxEye, { color: colors.mutedForeground }]}>OI</Text><Text style={[styles.rxText, { color: colors.foreground }]}>{prescription.osSphere.toFixed(2)} · {prescription.osCylinder.toFixed(2)} · {prescription.osAxis}°</Text></View></View> : prescriptionsQuery.isLoading ? <Text style={[styles.muted, { color: colors.mutedForeground }]}>Cargando recetas…</Text> : <EmptyState icon="file-text" title="Sin graduación" message="Registra una receta para verla aquí." />}
       <SectionHeading title="Historia clínica" action="Ver historial" />
       <Pressable onPress={() => router.push({ pathname: '/clinical-history', params: { patientId: String(patient.id) } })} style={[styles.historyLink, { backgroundColor: colors.secondary, borderColor: colors.border }]}><Feather name="clipboard" size={17} color={colors.primary} /><Text style={[styles.historyLinkText, { color: colors.primary }]}>Ver consultas cronológicas</Text><Feather name="chevron-right" size={17} color={colors.primary} /></Pressable>
       <SectionHeading title="Exámenes" />
       {exams.length ? exams.slice(0, 2).map((exam) => <View key={exam.id} style={[styles.examRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.examBadge, { backgroundColor: colors.secondary }]}><Feather name="eye" size={16} color={colors.primary} /></View><View style={styles.examCopy}><Text style={[styles.examDate, { color: colors.foreground }]}>{formatDate(exam.examDate)} · Agudeza {exam.visualAcuityRight} / {exam.visualAcuityLeft}</Text><Text style={[styles.examNote, { color: colors.mutedForeground }]}>{exam.observations || 'Sin observaciones registradas'}</Text></View></View>) : consultationsQuery.isLoading ? <Text style={[styles.muted, { color: colors.mutedForeground }]}>Cargando exámenes…</Text> : <Text style={[styles.muted, { color: colors.mutedForeground }]}>No hay exámenes registrados.</Text>}
      <SectionHeading title="Próximas citas" />
      {appointments.filter((appointment) => appointment.status !== 'completed' && appointment.status !== 'cancelled').slice(0, 2).map((appointment) => <View key={appointment.id} style={[styles.appointmentRow, { backgroundColor: colors.card, borderColor: colors.border }]}><View><Text style={[styles.appointmentDate, { color: colors.primary }]}>{formatDate(appointment.date)} · {appointment.time}</Text><Text style={[styles.appointmentNote, { color: colors.foreground }]}>{appointment.notes || 'Consulta programada'}</Text></View><StatusPill status={appointment.status} /></View>)}
       <PrimaryButton label="Iniciar examen guiado" icon="eye" onPress={() => router.push({ pathname: '/exam/new', params: { patientId: patient.id } })} />
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
  historyLink: { borderWidth: 1, borderRadius: 16, minHeight: 52, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  historyLinkText: { flex: 1, fontSize: 13, fontWeight: '700' },
});