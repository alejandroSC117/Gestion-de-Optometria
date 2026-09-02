import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { Field, PatientAvatar, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function VisualExamScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients, addExam } = useClinic();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? 0);
  const [right, setRight] = useState('20/20');
  const [left, setLeft] = useState('20/20');
  const [pressureRight, setPressureRight] = useState('15');
  const [pressureLeft, setPressureLeft] = useState('15');
  const [observations, setObservations] = useState('');

  function saveExam() {
    if (!patientId) return;
    addExam({ patientId, examDate: '2026-09-02', visualAcuityRight: right, visualAcuityLeft: left, intraocularPressureRight: pressureRight, intraocularPressureLeft: pressureLeft, observations });
    router.back();
  }

  return (
    <Screen>
      <TopBar eyebrow="Registro clínico" title="Examen visual" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Registra la valoración y consérvala en el historial del paciente.</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>Paciente</Text>
      <View style={styles.patientStrip}>
        {patients.slice(0, 4).map((patient) => (
          <Pressable key={patient.id} onPress={() => setPatientId(patient.id)} style={[styles.patientChoice, { backgroundColor: patientId === patient.id ? colors.secondary : colors.card, borderColor: patientId === patient.id ? colors.primary : colors.border }]}>
            <PatientAvatar patient={patient} size={34} />
            <Text numberOfLines={1} style={[styles.patientChoiceText, { color: patientId === patient.id ? colors.primary : colors.foreground }]}>{patient.firstName}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.examCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.examTitleRow}><View style={[styles.examIcon, { backgroundColor: colors.accent }]}><Feather name="eye" size={18} color={colors.primary} /></View><Text style={[styles.cardTitle, { color: colors.foreground }]}>Agudeza visual</Text></View>
        <View style={styles.twoColumns}><View style={styles.column}><Field label="OD · Derecho" value={right} onChangeText={setRight} placeholder="20/20" /></View><View style={styles.column}><Field label="OI · Izquierdo" value={left} onChangeText={setLeft} placeholder="20/20" /></View></View>
        <Text style={[styles.subLabel, { color: colors.foreground }]}>Presión intraocular · mmHg</Text>
        <View style={styles.twoColumns}><View style={styles.column}><Field label="OD · Derecho" value={pressureRight} onChangeText={setPressureRight} placeholder="15" keyboardType="numeric" /></View><View style={styles.column}><Field label="OI · Izquierdo" value={pressureLeft} onChangeText={setPressureLeft} placeholder="15" keyboardType="numeric" /></View></View>
        <Field label="Observaciones" value={observations} onChangeText={setObservations} placeholder="Anota hallazgos relevantes..." multiline />
        <PrimaryButton label="Guardar examen" icon="check" onPress={saveExam} disabled={!patientId} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 9 },
  patientStrip: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  patientChoice: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 7, alignItems: 'center' },
  patientChoiceText: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  examCard: { borderWidth: 1, borderRadius: 20, padding: 17 },
  examTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  examIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  subLabel: { fontSize: 13, fontWeight: '700', marginTop: 2, marginBottom: 15 },
});