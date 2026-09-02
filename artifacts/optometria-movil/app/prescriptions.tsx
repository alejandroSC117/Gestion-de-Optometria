import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { EmptyState, PatientAvatar, Screen, TopBar, UpgradeCard, formatDate } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients, prescriptions } = useClinic();
  const { canAccess } = useSubscription();
  const records = useMemo(() => prescriptions.map((prescription) => ({ prescription, patient: patients.find((patient) => patient.id === prescription.patientId) })).filter((record) => record.patient), [patients, prescriptions]);

  if (!canAccess('prescriptions')) {
    return <Screen><TopBar eyebrow="Historial clínico" title="Recetas" /><UpgradeCard title="Recetas profesionales son Pro" message="Actualiza a Nexus Pro para guardar graduaciones, consultarlas y mantener el historial de tus pacientes." onPress={() => router.push('/plans')} /></Screen>;
  }

  return (
    <Screen>
      <TopBar eyebrow="Historial clínico" title="Recetas" action={{ icon: 'plus', label: 'Nueva receta', onPress: () => router.push('/prescription/new') }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Graduaciones recientes listas para consultar durante la atención.</Text>
      {records.length ? records.map(({ prescription, patient }) => patient ? (
        <Pressable key={prescription.id} onPress={() => router.push({ pathname: '/patient/[id]', params: { id: String(patient.id) } })} style={({ pressed }) => [styles.card, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.78 }]}>
          <View style={styles.cardTop}><PatientAvatar patient={patient} size={42} /><View style={styles.patientCopy}><Text style={[styles.patientName, { color: colors.foreground }]}>{patient.firstName} {patient.lastName}</Text><Text style={[styles.issued, { color: colors.mutedForeground }]}>Emitida el {formatDate(prescription.issuedDate)}</Text></View><Feather name="chevron-right" size={18} color={colors.mutedForeground} /></View>
          <View style={[styles.rxTable, { backgroundColor: colors.secondary }]}><View style={styles.eyeCell}><Text style={[styles.eyeLabel, { color: colors.primary }]}>OD · DERECHO</Text><Text style={[styles.rxValue, { color: colors.foreground }]}>{prescription.odSphere.toFixed(2)} / {prescription.odCylinder.toFixed(2)} × {prescription.odAxis}°</Text></View><View style={styles.eyeCell}><Text style={[styles.eyeLabel, { color: colors.primary }]}>OI · IZQUIERDO</Text><Text style={[styles.rxValue, { color: colors.foreground }]}>{prescription.osSphere.toFixed(2)} / {prescription.osCylinder.toFixed(2)} × {prescription.osAxis}°</Text></View></View>
          <Text style={[styles.lensType, { color: colors.mutedForeground }]}><Feather name="disc" size={13} color={colors.mutedForeground} />  {prescription.lensType}</Text>
        </Pressable>
      ) : null) : <EmptyState icon="file-text" title="Aún no hay recetas" message="Las graduaciones guardadas aparecerán aquí." />}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  card: { borderWidth: 1, borderRadius: 20, padding: 15, marginBottom: 11 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  patientCopy: { flex: 1, marginLeft: 11 },
  patientName: { fontSize: 15, fontWeight: '700' },
  issued: { fontSize: 11, marginTop: 4 },
  rxTable: { flexDirection: 'row', borderRadius: 13, padding: 12, marginTop: 14 },
  eyeCell: { flex: 1 },
  eyeLabel: { fontSize: 9, letterSpacing: 0.6, fontWeight: '700', marginBottom: 6 },
  rxValue: { fontSize: 12, fontWeight: '600' },
  lensType: { fontSize: 11, marginTop: 13 },
});