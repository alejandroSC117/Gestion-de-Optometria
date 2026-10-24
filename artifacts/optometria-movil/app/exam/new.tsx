import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useClinic } from '@/context/ClinicContext';
import { useProfessionalProfile } from '@/context/ProfessionalProfileContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { deleteClinicalDraft, getClinicalDraft, listPatients, listPatientConsultations, listPatientPrescriptions, saveClinicalDraft } from '@workspace/api-client-react';
import { EmptyState, Field, PrimaryButton, Screen, SecondaryButton, UpgradeCard, TopBar, formatDate } from '@/components/NexusUI';

const steps = ['Paciente y consulta', 'Antecedentes', 'Agudeza visual', 'Refracción', 'Pruebas optométricas', 'Resultados', 'Receta relacionada', 'Revisión final'];

const emptyAcuity = () => ({ distanceUncorrected: '', distanceCorrected: '', nearUncorrected: '', nearCorrected: '' });
const emptyRefraction = () => ({ sphere: '', cylinder: '', axis: '', add: '', prism: '' });
const emptyAntecedents = () => ({ ocular: '', personal: '', family: '', surgeries: '', glasses: '', contactLenses: '', medications: '', allergies: '' });
const emptyTests = () => ({ pupils: '', ocularMotility: '', coverTest: '', binocularVision: '', vergences: '', accommodation: '', stereopsis: '', colorVision: '', visualField: '', keratometry: '', tonometry: '', intraocularPressureRight: '', intraocularPressureLeft: '', slitLamp: '', other: '' });
const emptyResults = () => ({ findings: '', observations: '', professionalAssessment: '', recommendations: '', followUp: '' });
type ExamDraft = {
  step: number;
  examStarted: boolean;
  patientId: string;
  reason: string;
  date: string;
  time: string;
  generalObservations: string;
  antecedents: ReturnType<typeof emptyAntecedents>;
  scale: string;
  odAcuity: ReturnType<typeof emptyAcuity>;
  oiAcuity: ReturnType<typeof emptyAcuity>;
  aoAcuity: ReturnType<typeof emptyAcuity>;
  odRefraction: ReturnType<typeof emptyRefraction>;
  oiRefraction: ReturnType<typeof emptyRefraction>;
  vertexDistance: string;
  dp: string;
  refractionObservations: string;
  tests: ReturnType<typeof emptyTests>;
  results: ReturnType<typeof emptyResults>;
  rxOdSphere: string;
  rxOdCylinder: string;
  rxOdAxis: string;
  rxOiSphere: string;
  rxOiCylinder: string;
  rxOiAxis: string;
  rxOdAdd: string;
  rxOiAdd: string;
  rxOdPrism: string;
  rxOiPrism: string;
  rxHeight: string;
  rxObservations: string;
  rxLensType: string;
};

function mergeObject<T extends object>(base: T, value: unknown): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return base;
  return { ...base, ...value } as T;
}

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export default function NewExamScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{ patientId?: string }>();
  const { user } = useAuth();
  const { patients, addConsultation, addPrescription } = useClinic();
  const { profile } = useProfessionalProfile();
  const { canAccess } = useSubscription();
  const queryClient = useQueryClient();
  const draftQuery = useQuery({
    queryKey: ['clinic', 'clinical-draft', user?.id],
    queryFn: () => getClinicalDraft(),
    enabled: Boolean(user?.id),
    retry: false,
  });
  const [step, setStep] = useState(0);
  const [patientId, setPatientId] = useState(params.patientId ?? '');
  const [patientSearch, setPatientSearch] = useState('');
  const [examStarted, setExamStarted] = useState(Boolean(params.patientId));
  const [draftReadyUserId, setDraftReadyUserId] = useState<string | undefined>();
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(localDate());
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [generalObservations, setGeneralObservations] = useState('');
  const [antecedents, setAntecedents] = useState(emptyAntecedents);
  const [scale, setScale] = useState('Snellen');
  const [odAcuity, setOdAcuity] = useState(emptyAcuity);
  const [oiAcuity, setOiAcuity] = useState(emptyAcuity);
  const [aoAcuity, setAoAcuity] = useState(emptyAcuity);
  const [odRefraction, setOdRefraction] = useState(emptyRefraction);
  const [oiRefraction, setOiRefraction] = useState(emptyRefraction);
  const [vertexDistance, setVertexDistance] = useState('');
  const [dp, setDp] = useState('');
  const [refractionObservations, setRefractionObservations] = useState('');
  const [tests, setTests] = useState(emptyTests);
  const [results, setResults] = useState(emptyResults);
  const [rxOdSphere, setRxOdSphere] = useState('');
  const [rxOdCylinder, setRxOdCylinder] = useState('');
  const [rxOdAxis, setRxOdAxis] = useState('');
  const [rxOiSphere, setRxOiSphere] = useState('');
  const [rxOiCylinder, setRxOiCylinder] = useState('');
  const [rxOiAxis, setRxOiAxis] = useState('');
  const [rxOdAdd, setRxOdAdd] = useState('');
  const [rxOiAdd, setRxOiAdd] = useState('');
  const [rxOdPrism, setRxOdPrism] = useState('');
  const [rxOiPrism, setRxOiPrism] = useState('');
  const [rxHeight, setRxHeight] = useState('');
  const [rxObservations, setRxObservations] = useState('');
  const [rxLensType, setRxLensType] = useState('');
  const [error, setError] = useState('');
  const draftReady = Boolean(user?.id && draftReadyUserId === user.id);
  const patientSearchQuery = useQuery({
    queryKey: ['clinic', 'patient-search', patientSearch.trim().toLocaleLowerCase()],
    queryFn: () => listPatients({ q: patientSearch.trim() }),
    enabled: Boolean(user?.id && patientSearch.trim().length >= 2),
    retry: false,
  });
  const filteredPatients = useMemo(() => (patientSearch.trim().length >= 2 ? patientSearchQuery.data ?? [] : []).slice(0, 6), [patientSearch, patientSearchQuery.data]);
  const selectedPatient = patients.find((patient) => patient.id === patientId) ?? filteredPatients.find((patient) => patient.id === patientId);
  const recentConsultations = useQuery({
    queryKey: ['clinic', 'consultations', patientId],
    queryFn: () => listPatientConsultations(patientId),
    enabled: Boolean(patientId && user?.id),
    retry: false,
  });
  const recentPrescriptions = useQuery({
    queryKey: ['clinic', 'prescriptions', patientId],
    queryFn: () => listPatientPrescriptions(patientId),
    enabled: Boolean(patientId && user?.id),
    retry: false,
  });

  useEffect(() => {
    if (!user?.id || draftQuery.isLoading || (!draftQuery.isSuccess && !draftQuery.isError)) return;
    const saved = draftQuery.data?.draftData;
    if (saved && typeof saved === 'object') {
      const draft = saved as Partial<ExamDraft>;
      setStep(Math.max(0, Math.min(steps.length - 1, Number(draft.step) || 0)));
      setExamStarted(Boolean(draft.examStarted));
      setPatientId(draft.patientId || params.patientId || '');
      if (typeof draft.reason === 'string') setReason(draft.reason);
      if (typeof draft.date === 'string') setDate(draft.date);
      if (typeof draft.time === 'string') setTime(draft.time);
      if (typeof draft.generalObservations === 'string') setGeneralObservations(draft.generalObservations);
      if (typeof draft.scale === 'string') setScale(draft.scale);
      setAntecedents((current) => mergeObject(current, draft.antecedents));
      setOdAcuity((current) => mergeObject(current, draft.odAcuity));
      setOiAcuity((current) => mergeObject(current, draft.oiAcuity));
      setAoAcuity((current) => mergeObject(current, draft.aoAcuity));
      setOdRefraction((current) => mergeObject(current, draft.odRefraction));
      setOiRefraction((current) => mergeObject(current, draft.oiRefraction));
      if (typeof draft.vertexDistance === 'string') setVertexDistance(draft.vertexDistance);
      if (typeof draft.dp === 'string') setDp(draft.dp);
      if (typeof draft.refractionObservations === 'string') setRefractionObservations(draft.refractionObservations);
      setTests((current) => mergeObject(current, draft.tests));
      setResults((current) => mergeObject(current, draft.results));
      if (typeof draft.rxOdSphere === 'string') setRxOdSphere(draft.rxOdSphere);
      if (typeof draft.rxOdCylinder === 'string') setRxOdCylinder(draft.rxOdCylinder);
      if (typeof draft.rxOdAxis === 'string') setRxOdAxis(draft.rxOdAxis);
      if (typeof draft.rxOiSphere === 'string') setRxOiSphere(draft.rxOiSphere);
      if (typeof draft.rxOiCylinder === 'string') setRxOiCylinder(draft.rxOiCylinder);
      if (typeof draft.rxOiAxis === 'string') setRxOiAxis(draft.rxOiAxis);
      if (typeof draft.rxOdAdd === 'string') setRxOdAdd(draft.rxOdAdd);
      if (typeof draft.rxOiAdd === 'string') setRxOiAdd(draft.rxOiAdd);
      if (typeof draft.rxOdPrism === 'string') setRxOdPrism(draft.rxOdPrism);
      if (typeof draft.rxOiPrism === 'string') setRxOiPrism(draft.rxOiPrism);
      if (typeof draft.rxHeight === 'string') setRxHeight(draft.rxHeight);
      if (typeof draft.rxObservations === 'string') setRxObservations(draft.rxObservations);
      if (typeof draft.rxLensType === 'string') setRxLensType(draft.rxLensType);
      setDraftStatus('saved');
    } else if (params.patientId) {
      setPatientId(params.patientId);
      setExamStarted(true);
    }
    if (draftQuery.isError) setDraftStatus('error');
    setDraftReadyUserId(user.id);
  }, [draftQuery.data, draftQuery.isError, draftQuery.isLoading, draftQuery.isSuccess, params.patientId, user?.id]);

  const draftData = useMemo<ExamDraft>(() => ({
    step, examStarted, patientId, reason, date, time, generalObservations, antecedents,
    scale, odAcuity, oiAcuity, aoAcuity, odRefraction, oiRefraction, vertexDistance, dp,
    refractionObservations, tests, results, rxOdSphere, rxOdCylinder, rxOdAxis,
    rxOiSphere, rxOiCylinder, rxOiAxis, rxOdAdd, rxOiAdd, rxOdPrism, rxOiPrism,
    rxHeight, rxObservations, rxLensType,
  }), [step, examStarted, patientId, reason, date, time, generalObservations, antecedents, scale, odAcuity, oiAcuity, aoAcuity, odRefraction, oiRefraction, vertexDistance, dp, refractionObservations, tests, results, rxOdSphere, rxOdCylinder, rxOdAxis, rxOiSphere, rxOiCylinder, rxOiAxis, rxOdAdd, rxOiAdd, rxOdPrism, rxOiPrism, rxHeight, rxObservations, rxLensType]);

  useEffect(() => {
    if (!draftReady || !user?.id || isSaving) return;
    setDraftStatus('saving');
    const timer = setTimeout(() => {
      saveClinicalDraft({
        ...(patientId ? { patientId } : {}),
        draftData: draftData as unknown as Record<string, unknown>,
      }).then((saved) => {
        queryClient.setQueryData(['clinic', 'clinical-draft', user.id], saved);
        setDraftStatus('saved');
      }).catch(() => setDraftStatus('error'));
    }, 700);
    return () => clearTimeout(timer);
  }, [draftData, draftReady, isSaving, patientId, queryClient, user?.id]);

  const updateAntecedent = (key: keyof typeof antecedents) => (value: string) => setAntecedents((current) => ({ ...current, [key]: value }));
  const updateTest = (key: keyof typeof tests) => (value: string) => setTests((current) => ({ ...current, [key]: value }));
  const updateResult = (key: keyof typeof results) => (value: string) => setResults((current) => ({ ...current, [key]: value }));
  const updateEyeAcuity = (setter: typeof setOdAcuity, key: keyof ReturnType<typeof emptyAcuity>) => (value: string) => setter((current) => ({ ...current, [key]: value }));
  const updateRefraction = (setter: typeof setOdRefraction, key: keyof ReturnType<typeof emptyRefraction>) => (value: string) => setter((current) => ({ ...current, [key]: value }));

  async function save() {
    if (!patientId) {
      setError('Selecciona un paciente para guardar la consulta.');
      setStep(0);
      return;
    }
    if (!isValidDate(date)) {
      setError('Usa el formato AAAA-MM-DD para la fecha de consulta.');
      setStep(0);
      return;
    }
    const hasPrescription = [rxOdSphere, rxOdCylinder, rxOdAxis, rxOiSphere, rxOiCylinder, rxOiAxis, rxOdAdd, rxOiAdd, rxOdPrism, rxOiPrism, rxHeight, rxObservations, rxLensType].some((value) => value.trim());
    const numericRecipeFields = [
      ['esfera OD', rxOdSphere], ['cilindro OD', rxOdCylinder], ['eje OD', rxOdAxis], ['adición OD', rxOdAdd],
      ['esfera OI', rxOiSphere], ['cilindro OI', rxOiCylinder], ['eje OI', rxOiAxis], ['adición OI', rxOiAdd],
    ] as const;
    const invalidNumericField = numericRecipeFields.find(([, value]) => value.trim() && !Number.isFinite(Number(value)));
    if (hasPrescription && invalidNumericField) {
      setError(`El campo ${invalidNumericField[0]} debe ser numérico.`);
      setStep(6);
      return;
    }
    const invalidAxis = [rxOdAxis, rxOiAxis].some((value) => value.trim() && (!Number.isInteger(Number(value)) || Number(value) < 0 || Number(value) > 180));
    if (hasPrescription && invalidAxis) {
      setError('El eje debe ser un número entero entre 0 y 180 grados.');
      setStep(6);
      return;
    }
    setIsSaving(true);
    setError('');
    try {
      const savedConsultation = await addConsultation(patientId, {
        date,
        time,
        reason,
        professional: profile.prescriptionProfessionalName || `${profile.firstName} ${profile.lastName}`.trim() || user?.name || 'Profesional',
        observations: generalObservations,
        antecedents,
        acuity: { scale, od: odAcuity, oi: oiAcuity, ao: aoAcuity },
        refraction: { od: odRefraction, oi: oiRefraction, vertexDistance, dp, observations: refractionObservations },
        tests,
        results,
      });
      try {
        await deleteClinicalDraft();
        queryClient.setQueryData(['clinic', 'clinical-draft', user?.id], null);
      } catch {
        setDraftStatus('error');
      }
      if (hasPrescription) {
        try {
          await addPrescription({
            patientId,
            consultationId: savedConsultation.id,
            issuedDate: date,
            odSphere: Number(rxOdSphere) || 0,
            odCylinder: Number(rxOdCylinder) || 0,
            odAxis: Number(rxOdAxis) || 0,
            osSphere: Number(rxOiSphere) || 0,
            osCylinder: Number(rxOiCylinder) || 0,
            osAxis: Number(rxOiAxis) || 0,
            addPower: Number(rxOdAdd || rxOiAdd) || 0,
            odAdd: rxOdAdd.trim() ? Number(rxOdAdd) : undefined,
            osAdd: rxOiAdd.trim() ? Number(rxOiAdd) : undefined,
            odPrism: rxOdPrism.trim() || undefined,
            osPrism: rxOiPrism.trim() || undefined,
            dp: dp.trim() || undefined,
            height: rxHeight.trim() || undefined,
            observations: rxObservations.trim() || undefined,
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
        } catch (prescriptionError) {
          setError(`La consulta quedó guardada, pero no se pudo guardar la receta: ${prescriptionError instanceof Error ? prescriptionError.message : 'error desconocido'}`);
          router.replace({ pathname: '/patient/[id]', params: { id: patientId } });
          return;
        }
      }
      router.replace({ pathname: '/patient/[id]', params: { id: patientId } });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar la consulta.');
    } finally {
      setIsSaving(false);
    }
  }

  function renderAcuityFields(label: string, value: ReturnType<typeof emptyAcuity>, setter: typeof setOdAcuity) {
    return <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>{label}</Text><View style={styles.twoColumns}><View style={styles.column}><Field label="Lejos sin corrección" value={value.distanceUncorrected} onChangeText={updateEyeAcuity(setter, 'distanceUncorrected')} placeholder="Ej. 20/40" /></View><View style={styles.column}><Field label="Lejos con corrección" value={value.distanceCorrected} onChangeText={updateEyeAcuity(setter, 'distanceCorrected')} placeholder="Ej. 20/20" /></View></View><View style={styles.twoColumns}><View style={styles.column}><Field label="Cerca sin corrección" value={value.nearUncorrected} onChangeText={updateEyeAcuity(setter, 'nearUncorrected')} placeholder="Escala elegida" /></View><View style={styles.column}><Field label="Cerca con corrección" value={value.nearCorrected} onChangeText={updateEyeAcuity(setter, 'nearCorrected')} placeholder="Escala elegida" /></View></View></View>;
  }

  function renderRefractionFields(label: string, value: ReturnType<typeof emptyRefraction>, setter: typeof setOdRefraction) {
    return <View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>{label}</Text><View style={styles.threeColumns}><View style={styles.column}><Field label="Esfera" value={value.sphere} onChangeText={updateRefraction(setter, 'sphere')} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="Cilindro" value={value.cylinder} onChangeText={updateRefraction(setter, 'cylinder')} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="Eje" value={value.axis} onChangeText={updateRefraction(setter, 'axis')} placeholder="0°" keyboardType="numeric" /></View></View><View style={styles.twoColumns}><View style={styles.column}><Field label="Adición" value={value.add} onChangeText={updateRefraction(setter, 'add')} placeholder="Opcional" /></View><View style={styles.column}><Field label="Prisma" value={value.prism} onChangeText={updateRefraction(setter, 'prism')} placeholder="Opcional" /></View></View></View>;
  }

  function renderStep() {
    const hasPrescriptionDraft = [rxOdSphere, rxOdCylinder, rxOdAxis, rxOiSphere, rxOiCylinder, rxOiAxis, rxOdAdd, rxOiAdd, rxOdPrism, rxOiPrism, rxHeight, rxObservations, rxLensType].some(Boolean);
    if (step === 0 && !examStarted) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Busca y selecciona al paciente antes de iniciar la consulta.</Text><Field label="Buscar paciente" value={patientSearch} onChangeText={(value) => { setPatientSearch(value); setError(''); }} placeholder="Nombre, teléfono o correo" />{patientSearch.trim().length < 2 ? <Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>Escribe al menos dos caracteres para buscar en tus pacientes.</Text> : null}{patientSearchQuery.isLoading ? <Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>Buscando…</Text> : null}{patientSearchQuery.isError ? <Text style={[styles.error, { color: colors.destructive }]}>No se pudo buscar. Revisa tu conexión e inténtalo de nuevo.</Text> : null}<View style={styles.patientGrid}>{filteredPatients.map((patient) => <Pressable key={patient.id} onPress={() => { setPatientId(patient.id); setError(''); }} style={[styles.patientChoice, { backgroundColor: patientId === patient.id ? colors.secondary : colors.card, borderColor: patientId === patient.id ? colors.primary : colors.border }]}><Text style={[styles.patientName, { color: patientId === patient.id ? colors.primary : colors.foreground }]}>{patient.firstName} {patient.lastName}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>{patient.phone || patient.email || 'Sin dato de contacto'}</Text></Pressable>)}</View>{patientSearch.trim().length >= 2 && !patientSearchQuery.isLoading && !patientSearchQuery.isError && filteredPatients.length === 0 ? <EmptyState icon="search" title="Sin resultados" message="Prueba otra búsqueda o registra un paciente nuevo." /> : null}{selectedPatient ? <View style={[styles.patientSummary, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.patientName, { color: colors.foreground }]}>{selectedPatient.firstName} {selectedPatient.lastName}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>Última consulta: {recentConsultations.data?.[0] ? formatDate(recentConsultations.data[0].consultationDate) : 'Sin consultas registradas'}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>Última receta: {recentPrescriptions.data?.[0] ? formatDate(recentPrescriptions.data[0].issuedAt) : 'Sin recetas registradas'}</Text></View> : null}<View style={styles.actions}><View style={styles.actionHalf}><SecondaryButton label="Registrar paciente nuevo" icon="user-plus" onPress={() => router.push({ pathname: '/patient/new', params: { fromExam: '1' } })} /></View><View style={styles.actionHalf}><PrimaryButton label="Iniciar examen" icon="eye" onPress={() => { if (!patientId) setError('Selecciona un paciente o crea uno nuevo.'); else { setError(''); setExamStarted(true); } }} disabled={!patientId} /></View></View></>;
    if (step === 0) return <><View style={[styles.patientSummary, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.patientName, { color: colors.foreground }]}>{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Paciente seleccionado'}</Text><Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>La historia y la consulta se guardarán asociadas a este paciente.</Text><Pressable onPress={() => setExamStarted(false)}><Text style={[styles.changePatient, { color: colors.primary }]}>Cambiar paciente</Text></Pressable></View><Field label="Motivo de consulta" value={reason} onChangeText={setReason} placeholder="¿Por qué consulta hoy?" multiline /><View style={styles.twoColumns}><View style={styles.column}><Field label="Fecha" value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" /></View><View style={styles.column}><Field label="Hora" value={time} onChangeText={setTime} placeholder="HH:MM" /></View></View><Field label="Observaciones generales" value={generalObservations} onChangeText={setGeneralObservations} placeholder="Notas de la consulta..." multiline /></>;
    if (step === 1) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Registra antecedentes sin establecer criterios diagnósticos.</Text><Field label="Antecedentes oculares" value={antecedents.ocular} onChangeText={updateAntecedent('ocular')} multiline /><Field label="Antecedentes personales relevantes" value={antecedents.personal} onChangeText={updateAntecedent('personal')} multiline /><Field label="Antecedentes familiares relevantes" value={antecedents.family} onChangeText={updateAntecedent('family')} multiline /><Field label="Cirugías oculares" value={antecedents.surgeries} onChangeText={updateAntecedent('surgeries')} multiline /><Field label="Uso de lentes" value={antecedents.glasses} onChangeText={updateAntecedent('glasses')} /><Field label="Uso de lentes de contacto" value={antecedents.contactLenses} onChangeText={updateAntecedent('contactLenses')} /><Field label="Medicamentos relevantes" value={antecedents.medications} onChangeText={updateAntecedent('medications')} multiline /><Field label="Alergias relevantes" value={antecedents.allergies} onChangeText={updateAntecedent('allergies')} multiline /></>;
    if (step === 2) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>La escala queda guardada junto con cada consulta para permitir futuras conversiones.</Text><Field label="Escala de agudeza visual" value={scale} onChangeText={setScale} placeholder="Snellen, decimal u otra escala" />{renderAcuityFields('OD · Derecho', odAcuity, setOdAcuity)}{renderAcuityFields('OI · Izquierdo', oiAcuity, setOiAcuity)}{renderAcuityFields('AO · Ambos ojos', aoAcuity, setAoAcuity)}</>;
    if (step === 3) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Captura los valores de refracción de acuerdo con tu protocolo profesional.</Text>{renderRefractionFields('OD · Derecho', odRefraction, setOdRefraction)}{renderRefractionFields('OI · Izquierdo', oiRefraction, setOiRefraction)}<View style={styles.twoColumns}><View style={styles.column}><Field label="Distancia de vértice" value={vertexDistance} onChangeText={setVertexDistance} placeholder="Opcional" /></View><View style={styles.column}><Field label="DP" value={dp} onChangeText={setDp} placeholder="Opcional" /></View></View><Field label="Observaciones de refracción" value={refractionObservations} onChangeText={setRefractionObservations} placeholder="Notas de esta sección..." multiline /></>;
    if (step === 4) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Captura los resultados medidos. No se muestran rangos de referencia ni diagnósticos automáticos.</Text><Field label="Pupilas" value={tests.pupils} onChangeText={updateTest('pupils')} multiline /><Field label="Motilidad ocular" value={tests.ocularMotility} onChangeText={updateTest('ocularMotility')} multiline /><Field label="Cover test" value={tests.coverTest} onChangeText={updateTest('coverTest')} multiline /><Field label="Binocularidad" value={tests.binocularVision} onChangeText={updateTest('binocularVision')} multiline /><Field label="Vergencias" value={tests.vergences} onChangeText={updateTest('vergences')} multiline /><Field label="Acomodación" value={tests.accommodation} onChangeText={updateTest('accommodation')} multiline /><Field label="Estereopsis" value={tests.stereopsis} onChangeText={updateTest('stereopsis')} multiline /><Field label="Visión de color" value={tests.colorVision} onChangeText={updateTest('colorVision')} multiline /><Field label="Campo visual" value={tests.visualField} onChangeText={updateTest('visualField')} multiline /><Field label="Queratometría" value={tests.keratometry} onChangeText={updateTest('keratometry')} multiline /><View style={styles.twoColumns}><View style={styles.column}><Field label="Presión intraocular OD" value={tests.intraocularPressureRight} onChangeText={updateTest('intraocularPressureRight')} placeholder="mmHg" keyboardType="numeric" /></View><View style={styles.column}><Field label="Presión intraocular OI" value={tests.intraocularPressureLeft} onChangeText={updateTest('intraocularPressureLeft')} placeholder="mmHg" keyboardType="numeric" /></View></View><Field label="Método / observaciones de tonometría" value={tests.tonometry} onChangeText={updateTest('tonometry')} multiline /><Field label="Lámpara de hendidura" value={tests.slitLamp} onChangeText={updateTest('slitLamp')} multiline /><Field label="Otras pruebas" value={tests.other} onChangeText={updateTest('other')} multiline /></>;
    if (step === 5) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Guarda los resultados y el seguimiento como parte de esta consulta independiente.</Text><Field label="Hallazgos" value={results.findings} onChangeText={updateResult('findings')} multiline /><Field label="Observaciones" value={results.observations} onChangeText={updateResult('observations')} multiline /><Field label="Valoración profesional" value={results.professionalAssessment} onChangeText={updateResult('professionalAssessment')} multiline /><Field label="Recomendaciones" value={results.recommendations} onChangeText={updateResult('recommendations')} multiline /><Field label="Seguimiento" value={results.followUp} onChangeText={updateResult('followUp')} multiline /></>;
    if (step === 6) return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Opcionalmente crea una receta. Los datos del profesional se toman del perfil y quedan asociados al expediente.</Text><View style={[styles.notice, { backgroundColor: colors.secondary }]}><Feather name="file-text" size={16} color={colors.primary} /><Text style={[styles.noticeText, { color: colors.secondaryForeground }]}>Si dejas esta sección vacía, la consulta se guardará sin receta.</Text></View><View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>Graduación</Text><View style={styles.threeColumns}><View style={styles.column}><Field label="OD esfera" value={rxOdSphere} onChangeText={setRxOdSphere} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="OD cilindro" value={rxOdCylinder} onChangeText={setRxOdCylinder} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="OD eje" value={rxOdAxis} onChangeText={setRxOdAxis} placeholder="0°" keyboardType="numeric" /></View></View><View style={styles.threeColumns}><View style={styles.column}><Field label="OI esfera" value={rxOiSphere} onChangeText={setRxOiSphere} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.column}><Field label="OI cilindro" value={rxOiCylinder} onChangeText={setRxOiCylinder} placeholder="0.00" keyboardType="numeric" /></View><View style={styles.axisColumn}><Field label="OI eje" value={rxOiAxis} onChangeText={setRxOiAxis} placeholder="0°" keyboardType="numeric" /></View></View><Field label="Tipo de lente" value={rxLensType} onChangeText={setRxLensType} placeholder="Monofocal, progresivo..." /></View></>;
    return <><Text style={[styles.stepIntro, { color: colors.mutedForeground }]}>Revisa los datos antes de guardar. El expediente conserva cada consulta por separado.</Text><View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>Paciente y consulta</Text><Text style={[styles.reviewLine, { color: colors.mutedForeground }]}>{selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : 'Paciente seleccionado'} · {date} · {time}</Text><Text style={[styles.reviewLine, { color: colors.mutedForeground }]}>Motivo: {reason || 'Sin motivo especificado'}</Text></View><View style={[styles.subCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.subTitle, { color: colors.foreground }]}>Secciones incluidas</Text><Text style={[styles.reviewLine, { color: colors.mutedForeground }]}>Antecedentes · agudeza visual · refracción · pruebas · resultados</Text><Text style={[styles.reviewLine, { color: colors.mutedForeground }]}>{[rxOdSphere, rxOdCylinder, rxOdAxis, rxOiSphere, rxOiCylinder, rxOiAxis, rxLensType].some(Boolean) ? 'Incluye receta' : 'Sin receta relacionada'}</Text><Text style={[styles.reviewLine, { color: colors.mutedForeground }]}>Profesional: {profile.prescriptionProfessionalName || `${profile.firstName} ${profile.lastName}`.trim() || user?.name || 'Sin nombre en perfil'}</Text></View></>;
  }

  if (!canAccess('visualExam')) return <Screen><TopBar eyebrow="Nuevo examen" title="Examen visual" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Exámenes guiados son Pro" message="Actualiza a Nexus Pro para guardar valoraciones y acompañar la consulta paso a paso." onPress={() => router.push('/plans')} /></Screen>;

  return (
    <Screen>
      <TopBar eyebrow="Historia clínica" title="Nuevo examen" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={styles.progressHeader}><Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Paso {step + 1} de {steps.length}</Text><Text style={[styles.progressTitle, { color: colors.foreground }]}>{steps[step]}</Text><View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}><View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%`, backgroundColor: colors.primary }]} /></View></View>
      {draftStatus !== 'idle' ? <Text style={[styles.draftStatus, { color: draftStatus === 'error' ? colors.destructive : colors.mutedForeground }]}>{draftStatus === 'saving' ? 'Guardando borrador en tu cuenta…' : draftStatus === 'saved' ? 'Borrador guardado en tu cuenta' : 'No se pudo sincronizar el borrador. Revisa tu conexión antes de salir.'}</Text> : null}
      {renderStep()}
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      {!(step === 0 && !examStarted) ? <View style={styles.actions}>{step > 0 ? <View style={styles.actionHalf}><SecondaryButton label="Atrás" icon="arrow-left" onPress={() => { setError(''); setStep((current) => current - 1); }} /></View> : <View style={styles.actionHalf} /> }<View style={styles.actionHalf}><PrimaryButton label={isSaving ? 'Guardando…' : step === steps.length - 1 ? 'Guardar historia clínica' : 'Continuar'} icon={step === steps.length - 1 ? 'check' : 'arrow-right'} onPress={() => { setError(''); if (step < steps.length - 1) setStep((current) => current + 1); else void save(); }} disabled={isSaving} /></View></View> : null}
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
  patientSummary: { borderWidth: 1, borderRadius: 16, padding: 13, marginBottom: 14 },
  changePatient: { fontSize: 12, fontWeight: '700', marginTop: 10 },
  subCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 12 },
  subTitle: { fontSize: 14, fontWeight: '700', marginBottom: 13 },
  twoColumns: { flexDirection: 'row', gap: 9 },
  threeColumns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
  axisColumn: { width: 72 },
  notice: { flexDirection: 'row', gap: 8, padding: 13, borderRadius: 14, marginBottom: 14 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18 },
  error: { fontSize: 12, lineHeight: 18, marginTop: 3, marginBottom: 12 },
  draftStatus: { fontSize: 11, marginBottom: 12 },
  reviewLine: { fontSize: 12, lineHeight: 19, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 9, marginTop: 7, marginBottom: 12 },
  actionHalf: { flex: 1 },
});