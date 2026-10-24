import { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { listPatientConsultations, listPatientPrescriptions } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { EmptyState, Screen, TopBar, formatDate } from '@/components/NexusUI';
import { useAuth } from '@/context/AuthContext';
import type { ClinicalConsultation } from '@/context/ClinicContext';

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default function ClinicalHistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { getPatient, isHydrated } = useClinic();
  const { user } = useAuth();
  const patient = getPatient(patientId ?? '');
  const historyQuery = useQuery({
    queryKey: ['clinic', 'consultations', patientId],
    queryFn: () => listPatientConsultations(patientId),
    enabled: Boolean(patientId && user?.id),
    retry: false,
  });
  const prescriptionsQuery = useQuery({
    queryKey: ['clinic', 'prescriptions', patientId],
    queryFn: () => listPatientPrescriptions(patientId),
    enabled: Boolean(patientId && user?.id),
    retry: false,
  });
  const consultations = useMemo(() => (historyQuery.data ?? [])
    .map((item): ClinicalConsultation => {
      const data = record(item.clinicalData);
      return {
        id: item.id,
        date: item.consultationDate,
        time: item.consultationTime ?? '',
        reason: item.reason ?? '',
        professional: typeof data.professional === 'string' ? data.professional : '',
        observations: item.observations ?? '',
        antecedents: record(data.antecedents) as ClinicalConsultation['antecedents'],
        acuity: record(data.acuity) as ClinicalConsultation['acuity'],
        refraction: { dp: '', ...record(data.refraction) } as ClinicalConsultation['refraction'],
        tests: record(data.tests) as ClinicalConsultation['tests'],
        results: {
          findings: '',
          observations: '',
          professionalAssessment: '',
          recommendations: '',
          followUp: '',
          ...record(data.results),
        } as ClinicalConsultation['results'],
        ...(
          typeof data.prescriptionId === 'string'
            ? { prescriptionId: data.prescriptionId }
            : prescriptionsQuery.data?.some((prescription) => prescription.consultationId === item.id)
              ? { prescriptionId: prescriptionsQuery.data.find((prescription) => prescription.consultationId === item.id)?.id }
              : {}
        ),
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)), [historyQuery.data, prescriptionsQuery.data]);

  if (!patient && !isHydrated) return <Screen><TopBar title="Historia clínica" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>Cargando el expediente…</Text></Screen>;
  if (!patient) return <Screen><TopBar title="Historia clínica" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><EmptyState icon="user-x" title="Paciente no encontrado" message="No se pudo cargar esta historia clínica." /></Screen>;

  return (
    <Screen>
      <TopBar eyebrow="Expediente" title="Historia clínica" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={[styles.patientCard, { backgroundColor: colors.secondary }]}>
        <View style={[styles.patientIcon, { backgroundColor: colors.card }]}><Feather name="user" size={20} color={colors.primary} /></View>
        <View><Text style={[styles.patientName, { color: colors.foreground }]}>{patient.firstName} {patient.lastName}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>{consultations.length} consulta{consultations.length === 1 ? '' : 's'} registrada{consultations.length === 1 ? '' : 's'}</Text></View>
      </View>
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Cada consulta conserva sus propios antecedentes, resultados, observaciones y receta relacionada.</Text>
      {historyQuery.isLoading ? <Text style={[styles.intro, { color: colors.mutedForeground }]}>Cargando consultas…</Text> : historyQuery.isError ? <EmptyState icon="alert-circle" title="No se pudo cargar la historia" message="Verifica tu conexión e inténtalo de nuevo." /> : consultations.length ? consultations.map((consultation, index) => <View key={consultation.id} style={styles.consultation}><View style={[styles.timelineDot, { backgroundColor: colors.primary }]} /><View style={[styles.consultationCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.consultationTop}><Text style={[styles.consultationDate, { color: colors.primary }]}>Consulta {consultations.length - index} · {formatDate(consultation.date)}</Text><Text style={[styles.consultationTime, { color: colors.mutedForeground }]}>{consultation.time}</Text></View><Text style={[styles.reason, { color: colors.foreground }]}>{consultation.reason || 'Consulta optométrica'}</Text><Text style={[styles.detail, { color: colors.mutedForeground }]}>{consultation.professional || 'Profesional'}</Text>{consultation.results.findings ? <Text style={[styles.detail, { color: colors.mutedForeground }]}>Hallazgos: {consultation.results.findings}</Text> : null}{consultation.refraction.dp ? <Text style={[styles.detail, { color: colors.mutedForeground }]}>DP: {consultation.refraction.dp}</Text> : null}{consultation.prescriptionId ? <View style={[styles.related, { backgroundColor: colors.secondary }]}><Feather name="file-text" size={14} color={colors.primary} /><Text style={[styles.relatedText, { color: colors.primary }]}>Receta relacionada</Text></View> : null}</View></View>) : <EmptyState icon="clipboard" title="Historia clínica vacía" message="Usa Nuevo examen para registrar la primera consulta de este paciente." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  patientCard: { borderRadius: 19, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  patientIcon: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  patientName: { fontSize: 16, fontWeight: '700' },
  patientMeta: { fontSize: 12, marginTop: 4 },
  intro: { fontSize: 13, lineHeight: 19, marginBottom: 21 },
  consultation: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 11 },
  timelineDot: { width: 9, height: 9, borderRadius: 5, marginTop: 18, marginRight: 9 },
  consultationCard: { flex: 1, borderWidth: 1, borderRadius: 17, padding: 14 },
  consultationTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  consultationDate: { fontSize: 11, fontWeight: '700' },
  consultationTime: { fontSize: 11 },
  reason: { fontSize: 14, fontWeight: '700', marginTop: 10 },
  detail: { fontSize: 11, lineHeight: 17, marginTop: 5 },
  related: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 7, flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 11 },
  relatedText: { fontSize: 11, fontWeight: '700' },
});