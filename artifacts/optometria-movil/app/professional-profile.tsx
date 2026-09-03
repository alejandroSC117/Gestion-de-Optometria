import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useProfessionalProfile } from '@/context/ProfessionalProfileContext';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function ProfessionalProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile } = useProfessionalProfile();
  const [form, setForm] = useState(profile);
  const set = (key: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  function save() {
    updateProfile(form);
    router.back();
  }

  return (
    <Screen>
      <TopBar eyebrow="Mi perfil" title="Perfil profesional" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.intro, { color: colors.mutedForeground }]}>Estos datos se guardarán en Nexus y se reutilizarán automáticamente al preparar tus recetas.</Text>

      <View style={styles.sectionTitle}><Feather name="user" size={16} color={colors.primary} /><Text style={[styles.sectionText, { color: colors.foreground }]}>Datos personales</Text></View>
      <Field label="Nombre" value={form.firstName} onChangeText={set('firstName')} placeholder="Tu nombre" />
      <Field label="Apellido" value={form.lastName} onChangeText={set('lastName')} placeholder="Tu apellido" />
      <Field label="Correo electrónico" value={form.email} onChangeText={set('email')} placeholder="profesional@email.com" keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.sectionTitle}><Feather name="award" size={16} color={colors.primary} /><Text style={[styles.sectionText, { color: colors.foreground }]}>Datos profesionales</Text></View>
      <Field label="Profesión" value={form.profession} onChangeText={set('profession')} placeholder="Optometrista" />
      <Field label="Cédula o licencia profesional" value={form.licenseNumber} onChangeText={set('licenseNumber')} placeholder="Número profesional" />
      <Field label="Especialidad" value={form.specialty} onChangeText={set('specialty')} placeholder="Opcional" />
      <Field label="País" value={form.country} onChangeText={set('country')} placeholder="México" />

      <View style={styles.sectionTitle}><Feather name="home" size={16} color={colors.primary} /><Text style={[styles.sectionText, { color: colors.foreground }]}>Consultorio u óptica</Text></View>
      <Field label="Nombre del consultorio u óptica" value={form.officeName} onChangeText={set('officeName')} placeholder="Nombre comercial" />
      <Field label="Dirección" value={form.officeAddress} onChangeText={set('officeAddress')} placeholder="Dirección completa" multiline />
      <Field label="Teléfono" value={form.officePhone} onChangeText={set('officePhone')} placeholder="+52 55 0000 0000" keyboardType="phone-pad" />
      <Field label="Correo del consultorio" value={form.officeEmail} onChangeText={set('officeEmail')} placeholder="contacto@consultorio.com" keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.sectionTitle}><Feather name="file-text" size={16} color={colors.primary} /><Text style={[styles.sectionText, { color: colors.foreground }]}>Datos para recetas</Text></View>
      <Text style={[styles.sectionHint, { color: colors.mutedForeground }]}>Se mostrarán en la cabecera de tus recetas. El PDF y la firma digital se habilitarán posteriormente.</Text>
      <Field label="Nombre que aparecerá en la receta" value={form.prescriptionName} onChangeText={set('prescriptionName')} placeholder="Nombre para impresión" />
      <Field label="Nombre profesional" value={form.prescriptionProfessionalName} onChangeText={set('prescriptionProfessionalName')} placeholder="Nombre y profesión" />
      <Field label="Cédula o licencia" value={form.prescriptionLicense} onChangeText={set('prescriptionLicense')} placeholder="Se puede reutilizar la cédula profesional" />
      <Field label="Teléfono en receta" value={form.prescriptionPhone} onChangeText={set('prescriptionPhone')} placeholder="Teléfono" keyboardType="phone-pad" />
      <Field label="Correo en receta" value={form.prescriptionEmail} onChangeText={set('prescriptionEmail')} placeholder="Correo" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Dirección en receta" value={form.prescriptionAddress} onChangeText={set('prescriptionAddress')} placeholder="Dirección" multiline />
      <View style={[styles.futureCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Feather name="image" size={18} color={colors.primary} />
        <View style={styles.futureCopy}><Text style={[styles.futureTitle, { color: colors.foreground }]}>Logotipo y firma digital</Text><Text style={[styles.futureText, { color: colors.mutedForeground }]}>Campos preparados para incorporar archivos en una siguiente fase.</Text></View>
        <Feather name="lock" size={16} color={colors.mutedForeground} />
      </View>
      <PrimaryButton label="Guardar perfil profesional" icon="check" onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 22 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, marginBottom: 14 },
  sectionText: { fontSize: 16, fontWeight: '700' },
  sectionHint: { fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 16 },
  futureCard: { borderWidth: 1, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  futureCopy: { flex: 1, marginHorizontal: 10 },
  futureTitle: { fontSize: 13, fontWeight: '700' },
  futureText: { fontSize: 11, lineHeight: 16, marginTop: 3 },
});