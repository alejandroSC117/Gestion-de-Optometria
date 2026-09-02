import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function NewPatientScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addPatient } = useClinic();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  function save() {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Escribe el nombre y apellido para continuar.');
      return;
    }
    const created = addPatient({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), email: email.trim(), birthDate: birthDate.trim(), notes: notes.trim() });
    router.replace({ pathname: '/patient/[id]', params: { id: String(created.id) } });
  }

  return (
    <Screen>
      <TopBar eyebrow="Expediente" title="Nuevo paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Registra los datos básicos para comenzar su historial visual.</Text>
      <Field label="Nombre" value={firstName} onChangeText={setFirstName} placeholder="Ej. Valentina" />
      <Field label="Apellido" value={lastName} onChangeText={setLastName} placeholder="Ej. Ríos" />
      <Field label="Teléfono" value={phone} onChangeText={setPhone} placeholder="+52 55 0000 0000" keyboardType="phone-pad" />
      <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="paciente@email.com" keyboardType="email-address" />
      <Field label="Fecha de nacimiento" value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/AAAA" />
      <Field label="Notas clínicas" value={notes} onChangeText={setNotes} placeholder="Alergias, preferencias o antecedentes..." multiline />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
      <PrimaryButton label="Crear expediente" icon="user-plus" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 23 },
  error: { fontSize: 12, marginTop: -5, marginBottom: 16 },
});