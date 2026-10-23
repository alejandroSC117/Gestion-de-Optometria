import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { Field, PrimaryButton, Screen, TopBar, UpgradeCard } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';

export default function NewPatientScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addPatient } = useClinic();
  const { canAccess } = useSubscription();
  const params = useLocalSearchParams<{ fromExam?: string }>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);

  async function save() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Escribe el nombre y apellido para continuar.');
      return;
    }
    if (birthDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) {
      setError('Usa el formato AAAA-MM-DD para la fecha de nacimiento.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const created = await addPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sex: sex.trim(),
        phone: phone.trim(),
        email: email.trim(),
        birthDate: birthDate.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      if (params.fromExam === '1') {
        router.replace({ pathname: '/exam/new', params: { patientId: created.id } });
      } else {
        router.replace({ pathname: '/patient/[id]', params: { id: created.id } });
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo guardar el paciente.');
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess('patientHistory')) {
    return <Screen><TopBar eyebrow="Expediente" title="Nuevo paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><UpgradeCard title="Crea pacientes con Nexus Pro" message="El historial de pacientes es una función profesional. Elige Nexus Pro para comenzar a registrar expedientes." onPress={() => router.push('/plans')} /></Screen>;
  }

  return (
    <Screen>
      <TopBar eyebrow="Expediente" title="Nuevo paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Registra los datos básicos para comenzar su historial visual.</Text>
      <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Ej. Valentina" />
      <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Ej. Ríos" />
      <Field label="Sexo (opcional)" value={sex} onChangeText={setSex} placeholder="Solo cuando sea necesario" />
      <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="+52 55 0000 0000" keyboardType="phone-pad" />
      <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="paciente@email.com" keyboardType="email-address" />
      <Field label="Fecha de nacimiento" value={birthDate} onChangeText={setBirthDate} placeholder="AAAA-MM-DD (opcional)" />
      <Field label="Dirección (opcional)" value={address} onChangeText={setAddress} placeholder="Dirección del paciente" multiline />
      <Field label="Notas clínicas" value={notes} onChangeText={setNotes} placeholder="Alergias, preferencias o antecedentes..." multiline />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      <PrimaryButton label={saving ? 'Guardando…' : 'Crear expediente'} icon="user-plus" onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 23 },
  error: { fontSize: 12, marginTop: -5, marginBottom: 16 },
});