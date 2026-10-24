import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function EditPatientScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { getPatient, isHydrated, updatePatient } = useClinic();
  const patient = getPatient(id ?? '');
  const [form, setForm] = useState({ firstName: '', lastName: '', sex: '', phone: '', email: '', birthDate: '', address: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) return;
    setForm({
      firstName: patient.firstName,
      lastName: patient.lastName,
      sex: patient.sex ?? '',
      phone: patient.phone,
      email: patient.email,
      birthDate: patient.birthDate,
      address: patient.address ?? '',
      notes: patient.notes,
    });
  }, [patient]);

  async function save() {
    if (!patient || !form.firstName.trim() || !form.lastName.trim()) {
      setError('El nombre y el apellido son obligatorios.');
      return;
    }
    if (form.birthDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(form.birthDate.trim())) {
      setError('Usa el formato AAAA-MM-DD para la fecha de nacimiento.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updatePatient(patient.id, form);
      router.replace({ pathname: '/patient/[id]', params: { id: patient.id } });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'No se pudo actualizar el paciente.');
    } finally {
      setSaving(false);
    }
  }

  if (!patient && !isHydrated) return <Screen><TopBar title="Editar paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.copy, { color: colors.mutedForeground }]}>Cargando expediente…</Text></Screen>;
  if (!patient) return <Screen><TopBar title="Editar paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.copy, { color: colors.destructive }]}>No se encontró este paciente.</Text></Screen>;

  return (
    <Screen>
      <TopBar eyebrow="Expediente" title="Editar paciente" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Field label="Nombre" value={form.firstName} onChangeText={(firstName) => setForm((current) => ({ ...current, firstName }))} />
      <Field label="Apellido" value={form.lastName} onChangeText={(lastName) => setForm((current) => ({ ...current, lastName }))} />
      <Field label="Sexo (opcional)" value={form.sex} onChangeText={(sex) => setForm((current) => ({ ...current, sex }))} />
      <Field label="Teléfono" value={form.phone} onChangeText={(phone) => setForm((current) => ({ ...current, phone }))} keyboardType="phone-pad" />
      <Field label="Correo electrónico" value={form.email} onChangeText={(email) => setForm((current) => ({ ...current, email }))} keyboardType="email-address" autoCapitalize="none" />
      <Field label="Fecha de nacimiento" value={form.birthDate} onChangeText={(birthDate) => setForm((current) => ({ ...current, birthDate }))} placeholder="AAAA-MM-DD" />
      <Field label="Dirección" value={form.address} onChangeText={(address) => setForm((current) => ({ ...current, address }))} multiline />
      <Field label="Notas clínicas" value={form.notes} onChangeText={(notes) => setForm((current) => ({ ...current, notes }))} multiline />
      {error ? <Text style={[styles.copy, { color: colors.destructive }]}>{error}</Text> : null}
      <PrimaryButton label={saving ? 'Guardando…' : 'Guardar cambios'} icon="check" onPress={save} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
});
