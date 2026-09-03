import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { useProfessionalProfile } from '@/context/ProfessionalProfileContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Field, PrimaryButton, Screen, SecondaryButton, UpgradeCard, TopBar } from '@/components/NexusUI';

const steps = ['Paciente y consulta', 'Antecedentes', 'Agudeza visual', 'Refracción', 'Pruebas optométricas', 'Resultados', 'Receta relacionada'];

const emptyAcuity = () => ({ distanceUncorrected: '', distanceCorrected: '', nearUncorrected: '', nearCorrected: '' });
const emptyRefraction = () => ({ sphere: '', cylinder: '', axis: '', add: '', prism: '' });

export default function NewExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ patientId?: string }>();
  const { user } = useAuth();
  const { patients, clinicalHistories, addConsultation, addPrescription } = useClinic();
  const { profile } = useProfessionalProfile();
  const { canAccess, limitFor } = useSubscription();
  const [step, setStep] = useState(0);
  const [patientId, setPatientId] = useState(Number(params.patientId) || patients[0]?.id || 0);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [generalObservations, setGeneralObservations] = useState('');
  const [antecedents, setAntecedents] = useState({ ocular: '', personal: '', family: '', surgeries: '', glasses: '', contactLenses: '', medications: '', allergies: '' });
  const [scale, setScale] = useState('Snellen');
  const [odAcuity, setOdAcuity] = useState(emptyAcuity);
  const [oiAcuity, setOiAcuity] = useState(emptyAcuity);
  const [aoAcuity, setAoAcuity] = useState(emptyAcuity);
  const [odRefraction, setOdRefraction] = useState(emptyRefraction);
  const [oiRefraction, setOiRefraction] = useState(emptyRefraction);
  const [vertexDistance, setVertexDistance] = useState('');
  const [dp, setDp] = useState('');
  const [refractionObservations, setRefractionObservations] = useState('');
  const [tests, setTests] = useState({ pupils: '', ocularMotility: '', coverTest: '', binocularVision: '', vergences: '', accommodation: '', stereopsis: '', colorVision: '', visualField: '', keratometry: '', tonometry: '', slitLamp: '', other: '' });
  const [results, setResults] = useState({ findings: '', observations: '', professionalAssessment: '', recommendations: '', followUp: '' });
  const [rxOdSphere, setRxOdSphere] = useState('');
  const [rxOdCylinder, setRxOdCylinder] = useState('');
  const [rxOdAxis, setRxOdAxis] = useState('');
  const [rxOiSphere, setRxOiSphere] = useState('');
  const [rxOiCylinder, setRxOiCylinder] = useState('');
  const [rxOiAxis, setRxOiAxis] = useState('');
  const [rxLensType, setRxLensType] = useState('');
  const [error, setError] = useState('');

  const updateAntecedent = (key: keyof typeof antecedents) => (value: string) => setAntecedents((current) => ({ ...current, [key]: value }));
  const updateTest = (key: keyof typeof tests) => (value: string) => setTests((current) => ({ ...current, [key]: value }));
  const updateResult = (key: keyof typeof results) => (value: string) => setResults((current) => ({ ...current, [key]: value }));
  const updateEyeAcuity = (setter: typeof setOdAcuity, key: keyof ReturnType<typeof emptyAcuity>) => (value: string) => setter((current) => ({ ...current, [key]: value }));
  const updateRefraction = (setter: typeof setOdRefraction, key: keyof ReturnType<typeof emptyRefraction>) => (value: string) => setter((current) => ({ ...current, [key]: value }));

  function save() {
    if (!patientId) {
      setError('Selecciona un paciente para guardar la consulta.');
      setStep(0);
      return;
    }
    const totalConsultations = clinicalHistories.reduce((total, history) => total + history.consultations.length, 0);
    if (totalConsultations >= limitFor('exams')) {
      setError('Has alcanzado el límite de historia clínica de tu plan.');
      return;
    }
    let prescriptionId: number | undefined;
    const hasPrescription = [rxOdSphere, rxOdCylinder, rxOdAxis, rxOiSphere, rxOiCylinder, rxOiAxis, rxLensType].some((value) => value.trim());
    if (hasPrescription) {
      const createdPrescription = addPrescription({
        patientId,
        issuedDate: date,
        odSphere: Number(rxOdSphere) || 0,
        odCylinder: Number(rxOdCylinder) || 0,
        odAxis: Number(rxOdAxis) || 0,
        osSphere: Number(rxOiSphere) || 0,
        osCylinder: Number(rxOiCylinder) || 0,
        osAxis: Number(rxOiAxis) || 0,
        addPower: 0,
        lensType: rxLensType || 'Pendiente de especificar',
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
      prescriptionId = createdPrescription.id;
    }
    addConsultation(patientId, {
      date,
      time,
      reason,
      professional: profile.prescriptionProfessionalName || `${profile.firstName} ${profile.lastName}`.trim() || user?.name || 'Profesional Nexus',
      observations: generalObservations,
      antecedents,
      acuity: { scale, od: odAcuity, oi: oiAcuity, ao: aoAcuity },
      refraction: { od: odRefraction, oi: oiRefraction, vertexDistance, dp, observations: refractionObservations },
      tests,
      results,
      prescriptionId,
    });
    router.replace({ pathname: '/patient/[id]', params: { id: String(patientId) } });
  }

  function renderAcuityFields(label: string, value: ReturnType<typeof emptyAcuity>, setter: typeof setOdAcuity) {
    return <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>{label}</Text><View style={styles.twoColumns}><View style={styles.column}><Field label="Lejos sin corrección" value={value.distanceUncorrected} onChangeText={updateEyeAcuity(setter, 'distanceUncorrected')} placeholder="Ej. 20/40" /></View><View style={styles.column}><Field label="Lejos con corrección" value={value.distanceCorrected} onChangeText={updateEyeAcuity(setter, 'distanceCorrected')} placeholder="Ej. 20/20" /></View></View><View style={styles.twoColumns}><View style={styles.column}><Field label="Cerca sin corrección" value={value.nearUncorrected} onChangeText={updateEyeAcuity(setter, 'nearUncorrected')} placeholder="Escala elegida" /></View><View style={styles.column}><Field label="Cerca con corrección" value={value.nearCorrected} onChangeText={updateEyeAcuity(setter, 'nearCorrected')} placeholder="Escala elegida" /></View></View></View>;
  }

  function renderRefractionFields(label: string, value: ReturnType<typeof emptyRefraction>, setter: typeof setOdRefraction) {
    return <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>{label}</Text><View style={styles.threeColumns}><View style={styles.column}><Field label="Esfera" value={value.sphere} onChangeText={updateRefraction(setter, 'sphere')} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="Cilindro" value={value.cylinder} onChangeText={updateRefraction(setter, 'cylinder')} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="Eje" value={value.axis} onChangeText={updateRefraction(setter, 'axis')} placeholder="0°" keyboardType="numeric" /></View></View><View style={styles.twoColumns}><View style={styles.column}><Field label="Adición" value={value.add} onChangeText={updateRefraction(setter, 'add')} placeholder="Opcional" /></View><View style={styles.column}><Field label="Prisma" value={value.prism} onChangeText={updateRefraction(setter, 'prism')} placeholder="Opcional" /></View></View></View>;
  }

  function renderStep() {
    if (step === 0) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Selecciona el paciente y registra los datos de esta consulta. La información se conserva mientras avanzas.</Text><Text style={[styles.label, { color: colors.foreground }]}>Paciente</Text><View style={styles.patientGrid}>{patients.map((patient) => <Pressable key={patient.id} onPress={() => setPatientId(patient.id)} style={[styles.patientChoice, { backgroundColor: patientId === patient.id ? colors.secondary : colors.card, borderColor: patientId === patient.id ? colors.primary : colors.border }]}><Text style={[styles.patientName, { color: patientId === patient.id ? colors.primary : colors.foreground }]}>{patient.firstName} {patient.lastName}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>{patient.email || 'Sin correo'}</Text></Pressable>)}</View><Field label="Motivo de consulta" value={reason} onChangeText={setReason} placeholder="¿Por qué consulta hoy?" multiline /><View style={styles.twoColumns}><View style={styles.column}><Field label="Fecha" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" /></View><View style={styles.column}><Field label="Hora" value={time} onChangeText={setTime} placeholder="HH:MM" /></View></View><Field label="Observaciones generales" value={generalObservations} onChangeText={setGeneralObservations} placeholder="Notas de la consulta..." multiline /></>;
    if (step === 1) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Registra antecedentes sin establecer criterios diagnósticos.</Text><Field label="Antecedentes oculares" value={antecedents.ocular} onChangeText={updateAntecedent('ocular')} multiline /><Field label="Antecedentes personales relevantes" value={antecedents.personal} onChangeText={updateAntecedent('personal')} multiline /><Field label="Antecedentes familiares relevantes" value={antecedents.family} onChangeText={updateAntecedent('family')} multiline /><Field label="Cirugías oculares" value={antecedents.surgeries} onChangeText={updateAntecedent('surgeries')} multiline /><Field label="Uso de lentes" value={antecedents.glasses} onChangeText={updateAntecedent('glasses')} /><Field label="Uso de lentes de contacto" value={antecedents.contactLenses} onChangeText={updateAntecedent('contactLenses')} /><Field label="Medicamentos relevantes" value={antecedents.medications} onChangeText={updateAntecedent('medications')} multiline /><Field label="Alergias relevantes" value={antecedents.allergies} onChangeText={updateAntecedent('allergies')} multiline /></>;
    if (step === 2) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>La escala queda guardada junto con cada consulta para permitir futuras conversiones.</Text><Field label="Escala de agudeza visual" value={scale} onChangeText={setScale} placeholder="Snellen, decimal u otra escala" />{renderAcuityFields('OD · Derecho', odAcuity, setOdAcuity)}{renderAcuityFields('OI · Izquierdo', oiAcuity, setOiAcuity)}{renderAcuityFields('AO · Ambos ojos', aoAcuity, setAoAcuity)}</>;
    if (step === 3) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Captura los valores de refracción de acuerdo con tu protocolo profesional.</Text>{renderRefractionFields('OD · Derecho', odRefraction, setOdRefraction)}{renderRefractionFields('OI · Izquierdo', oiRefraction, setOiRefraction)}<View style={styles.twoColumns}><View style={styles.column}><Field label="Distancia de vértice" value={vertexDistance} onChangeText={setVertexDistance} placeholder="Opcional" /></View><View style={styles.column}><Field label="DP" value={dp} onChangeText={setDp} placeholder="Opcional" /></View></View><Field label="Observaciones de refracción" value={refractionObservations} onChangeText={setRefractionObservations} placeholder="Notas de esta sección..." multiline /></>;
    if (step === 4) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Secciones preparadas para incorporar tus pruebas y protocolos definitivos posteriormente. No se incluyen valores normales ni criterios automáticos.</Text><Field label="Pupilas" value={tests.pupils} onChangeText={updateTest('pupils')} multiline /><Field label="Motilidad ocular" value={tests.ocularMotility} onChangeText={updateTest('ocularMotility')} multiline /><Field label="Cover test" value={tests.coverTest} onChangeText={updateTest('coverTest')} multiline /><Field label="Binocularidad" value={tests.binocularVision} onChangeText={updateTest('binocularVision')} multiline /><Field label="Vergencias" value={tests.vergences} onChangeText={updateTest('vergences')} multiline /><Field label="Acomodación" value={tests.accommodation} onChangeText={updateTest('accommodation')} multiline /><Field label="Estereopsis" value={tests.stereopsis} onChangeText={updateTest('stereopsis')} multiline /><Field label="Visión de color" value={tests.colorVision} onChangeText={updateTest('colorVision')} multiline /><Field label="Campo visual" value={tests.visualField} onChangeText={updateTest('visualField')} multiline /><Field label="Queratometría" value={tests.keratometry} onChangeText={updateTest('keratometry')} multiline /><Field label="Tonometría" value={tests.tonometry} onChangeText={updateTest('tonometry')} multiline /><Field label="Lámpara de hendidura" value={tests.slitLamp} onChangeText={updateTest('slitLamp')} multiline /><Field label="Otras pruebas" value={tests.other} onChangeText={updateTest('other')} multiline /></>;
    if (step === 5) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Guarda los resultados y el seguimiento como parte de esta consulta independiente.</Text><Field label="Hallazgos" value={results.findings} onChangeText={updateResult('findings')} multiline /><Field label="Observaciones" value={results.observations} onChangeText={updateResult('observations')} multiline /><Field label="Valoración profesional" value={results.professionalAssessment} onChangeText={updateResult('professionalAssessment')} multiline /><Field label="Recomendaciones" value={results.recommendations} onChangeText={updateResult('recommendations')} multiline /><Field label="Seguimiento" value={results.followUp} onChangeText={updateResult('followUp')} multiline /></>;
    return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Opcionalmente crea una receta relacionada. Los datos profesionales se toman automáticamente de Mi perfil profesional.</Text><View style={[styles.notice, { backgroundColor: colors.secondary }]}><Feather name="file-text" size={16} color={colors.primary} /><Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>Si dejas esta sección vacía, la consulta se guardará sin receta vinculada.</Text></View><View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>Graduación</Text><View style={styles.threeColumns}><View style={styles.column}><Field label="OD esfera" value={rxOdSphere} onChangeText={setRxOdSphere} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="OD cilindro" value={rxOdCylinder} onChangeText={setRxOdCylinder} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="OD eje" value={rxOdAxis} onChangeText={setRxOdAxis} placeholder="0°" keyboardType="numeric" /></View></View><View style={styles.threeColumns}><View style={styles.column}><Field label="OI esfera" value={rxOiSphere} onChangeText={setRxOiSphere} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="OI cilindro" value={rxOiCylinder} onChangeText={setRxOiCylinder} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="OI eje" value={rxOiAxis} onChangeText={setRxOiAxis} placeholder="0°" keyboardType="numeric" /></View></View><Field label="Tipo de lente" value={rxLensType} onChangeText={setRxLensType} placeholder="Monofocal, progresivo..." /></View></>;
  }

  if (!canAccess('visualExam')) return <Screen><TopBar eyebrow="Nuevo examen" title="Examen visual" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Exámenes guiados son Pro" message="Actualiza a Nexus Pro para guardar valoraciones y acompañar la consulta paso a paso." onPress={() => router.push('/plans')} /></Screen>;

  return (
    <Screen>
      <TopBar eyebrow="Historia clínica" title="Nuevo examen" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={styles.progressHeader}><Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Paso {step + 1} de {steps.length}</Text><Text style={[styles.progressTitle, { color: colors.foreground }]}>{steps[step]}</Text><View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}><View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%`, backgroundColor: colors.primary }]} /></View></View>
      {renderStep()}
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      <View style={styles.actions}>{step > 0 ? <View style={styles.actionHalf}><SecondaryButton label="Atrás" icon="arrow-left" onPress={() => { setError(''); setStep((current) => current - 1); }} /></View> : <View style={styles.actionHalf} /> }<View style={styles.actionHalf}><PrimaryButton label={step === steps.length - 1 ? 'Guardar historia clínica' : 'Continuar'} icon={step === steps.length - 1 ? 'check' : 'arrow-right'} onPress={() => { setError(''); if (step < steps.length - 1) setStep((current) => current + 1); else save(); }} /></View></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressHeader: { marginBottom: 20 },
  progressLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  progressTitle: { fontSize: 22, fontWeight: '700', marginTop: 5, marginBottom: 11 },
  progressTrack: { height: 7, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 7, borderRadius: 4 },
  stepIntro: { fontSize: 13, lineHeight: 19, marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 9 },
  patientGrid: { gap: 8, marginBottom: 17 },
  patientChoice: { borderWidth: 1, borderRadius: 15, padding: 12 },
  patientName: { fontSize: 13, fontWeight: '700' },
  patientMeta: { fontSize: 11, marginTop: 4 },
  subCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 12 },
  subTitle: { fontSize: 14, fontWeight: '700', marginBottom: 13 },
  twoColumns: { flexDirection: 'row', gap: 9 },
  threeColumns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
  axisColumn: { width: 72 },
  notice: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 14, marginBottom: 14 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, lineHeight: 18, marginTop: 3, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 7, marginBottom: 12 },
  actionHalf: { flex: 1 },
});