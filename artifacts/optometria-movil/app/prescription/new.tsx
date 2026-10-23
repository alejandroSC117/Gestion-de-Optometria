import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { Field, PatientAvatar, PrimaryButton, Screen, TopBar, UpgradeCard } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';
import { useProfessionalProfile } from '@/context/ProfessionalProfileContext';

export default function NewPrescriptionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients, addPrescription } = useClinic();
  const { canAccess } = useSubscription();
  const { profile } = useProfessionalProfile();
  const [patientId, setPatientId] = useState(patients[0]?.id ?? 0);
  const [odSphere, setOdSphere] = useState('0.00');
  const [odCylinder, setOdCylinder] = useState('0.00');
  const [odAxis, setOdAxis] = useState('0');
  const [osSphere, setOsSphere] = useState('0.00');
  const [osCylinder, setOsCylinder] = useState('0.00');
  const [osAxis, setOsAxis] = useState('0');
  const [addPower, setAddPower] = useState('0.00');
  const [odAdd, setOdAdd] = useState('0.00');
  const [odPrism, setOdPrism] = useState('');
  const [osAdd, setOsAdd] = useState('0.00');
  const [osPrism, setOsPrism] = useState('');
  const [dp, setDp] = useState('');
  const [height, setHeight] = useState('');
  const [observations, setObservations] = useState('');
  const [lensType, setLensType] = useState('Monofocal antirreflejante');

  function save() {
    if (!patientId) return;
    addPrescription({
      patientId,
      issuedDate: new Date().toISOString().slice(0, 10),
      odSphere: Number(odSphere) || 0,
      odCylinder: Number(odCylinder) || 0,
      odAxis: Number(odAxis) || 0,
      osSphere: Number(osSphere) || 0,
      osCylinder: Number(osCylinder) || 0,
      osAxis: Number(osAxis) || 0,
      addPower: Number(addPower) || 0,
      odAdd: Number(odAdd) || 0,
      odPrism,
      osAdd: Number(osAdd) || 0,
      osPrism,
      dp,
      height,
      observations,
      lensType,
      provider: {
        displayName: profile.prescriptionName || `${profile.firstName} ${profile.lastName}`.trim(),
        professionalName: profile.prescriptionProfessionalName || profile.profession,
        licenseNumber: profile.prescriptionLicense || profile.licenseNumber,
        officeName: profile.officeName,
        address: profile.prescriptionAddress || profile.officeAddress,
        phone: profile.prescriptionPhone || profile.officePhone,
        email: profile.prescriptionEmail || profile.officeEmail || profile.email,
        logoUri: profile.logoUri,
        signatureUri: profile.signatureUri,
      },
    });
    router.back();
  }

  if (!canAccess('prescriptions')) {
    return <Screen><TopBar eyebrow="Historia clínica" title="Nueva receta" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Recetas profesionales son Pro" message="Actualiza a Nexus Pro para registrar y consultar graduaciones desde Nexus." onPress={() => router.push('/plans')} /></Screen>;
  }

  return (
    <Screen>
      <TopBar eyebrow="Historia clínica" title="Nueva receta" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Guarda la graduación para consultarla en cualquier momento.</Text>
      <Text style={[styles.label, { color: colors.foreground }]}>Paciente</Text>
      <View style={styles.patientStrip}>{patients.slice(0, 4).map((patient) => <Pressable key={patient.id} onPress={() => setPatientId(patient.id)} style={[styles.patientChoice, { backgroundColor: patientId === patient.id ? colors.secondary : colors.card, borderColor: patientId === patient.id ? colors.primary : colors.border }]}><PatientAvatar patient={patient} size={34} /><Text numberOfLines={1} style={[styles.patientText, { color: patientId === patient.id ? colors.primary : colors.foreground }]}>{patient.firstName}</Text></Pressable>)}</View>
      <View style={[styles.rxCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.rowTitle}><Text style={[styles.rxTitle, { color: colors.foreground }]}>OD · Derecho</Text><Text style={[styles.unit, { color: colors.mutedForeground }]}>dioptrías</Text></View>
        <View style={styles.threeColumns}><View style={styles.column}><Field label="Esfera" value={odSphere} onChangeText={setOdSphere} keyboardType="numeric" /></View><View style={styles.column}><Field label="Cilindro" value={odCylinder} onChangeText={setOdCylinder} keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="Eje" value={odAxis} onChangeText={setOdAxis} keyboardType="numeric" /></View></View>
        <View style={styles.rowTitle}><Text style={[styles.rxTitle, { color: colors.foreground }]}>OI · Izquierdo</Text><Text style={[styles.unit, { color: colors.mutedForeground }]}>dioptrías</Text></View>
        <View style={styles.threeColumns}><View style={styles.column}><Field label="Esfera" value={osSphere} onChangeText={setOsSphere} keyboardType="numeric" /></View><View style={styles.column}><Field label="Cilindro" value={osCylinder} onChangeText={setOsCylinder} keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="Eje" value={osAxis} onChangeText={setOsAxis} keyboardType="numeric" /></View></View>
      </View>
       <Field label="Adición general" value={addPower} onChangeText={setAddPower} keyboardType="numeric" placeholder="0.00" />
       <View style={styles.threeColumns}><View style={styles.column}><Field label="Adición OD" value={odAdd} onChangeText={setOdAdd} keyboardType="numeric" placeholder="0.00" /></View><View style={styles.column}><Field label="Prisma OD" value={odPrism} onChangeText={setOdPrism} placeholder="Opcional" /></View></View>
       <View style={styles.threeColumns}><View style={styles.column}><Field label="Adición OI" value={osAdd} onChangeText={setOsAdd} keyboardType="numeric" placeholder="0.00" /></View><View style={styles.column}><Field label="Prisma OI" value={osPrism} onChangeText={setOsPrism} placeholder="Opcional" /></View></View>
       <View style={styles.threeColumns}><View style={styles.column}><Field label="DP" value={dp} onChangeText={setDp} placeholder="Opcional" /></View><View style={styles.column}><Field label="Altura" value={height} onChangeText={setHeight} placeholder="Opcional" /></View></View>
      <Field label="Tipo de lente" value={lensType} onChangeText={setLensType} placeholder="Monofocal antirreflejante" />
       <Field label="Observaciones" value={observations} onChangeText={setObservations} placeholder="Indicaciones para la receta..." multiline />
       <Text style={[styles.profileHint, { color: colors.mutedForeground }]}>Los datos del profesional se tomarán automáticamente de Mi perfil profesional. El PDF y la firma digital quedan preparados para una siguiente fase.</Text>
      <PrimaryButton label="Guardar receta" icon="check" onPress={save} disabled={!patientId} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 9 },
  patientStrip: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  patientChoice: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 7, alignItems: 'center' },
  patientText: { fontSize: 10, fontWeight: '700', marginTop: 5 },
  rxCard: { borderWidth: 1, borderRadius: 20, padding: 15, marginBottom: 16 },
  rowTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 3 },
  rxTitle: { fontSize: 14, fontWeight: '700' },
  unit: { fontSize: 10 },
  threeColumns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
  axisColumn: { width: 73 },
  profileHint: { fontSize: 11, lineHeight: 17, marginTop: 2, marginBottom: 16 },
});