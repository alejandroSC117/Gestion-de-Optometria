import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { CheckRow, Field, PrimaryButton, Screen, SecondaryButton, TopBar } from '@/components/NexusUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const submit = () => {
    if (!name.trim() || !email.trim() || password.length < 6 || password !== confirmation || !accepted) {
      setError('Completa los campos, usa una contraseña de 6 caracteres o más y acepta los términos.');
      return;
    }
    signUp(name, email);
    router.replace('/plans');
  };
  return <Screen scroll={false}><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24}><TopBar eyebrow="Nexus" title="Crear cuenta" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>Crea tu espacio profesional para empezar.</Text><Field label="Nombre completo" value={name} onChangeText={setName} placeholder="Ej. Laura Méndez" /><Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="laura@consultorio.com" keyboardType="email-address" autoCapitalize="none" /><Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" secureTextEntry autoCapitalize="none" /><Field label="Confirmar contraseña" value={confirmation} onChangeText={setConfirmation} placeholder="Repite tu contraseña" secureTextEntry autoCapitalize="none" /><CheckRow checked={accepted} onPress={() => setAccepted((value) => !value)} label="Acepto los términos y condiciones y el aviso de privacidad." />{error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}<PrimaryButton label="Crear cuenta" icon="arrow-right" onPress={submit} /><View style={styles.switchRow}><Text style={[styles.switchText, { color: colors.mutedForeground }]}>¿Ya tienes cuenta?</Text><SecondaryButton label="Iniciar sesión" onPress={() => router.replace('/auth/sign-in')} /></View></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 35 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  error: { fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 16 },
  switchRow: { alignItems: 'center', marginTop: 24, gap: 9 },
  switchText: { fontSize: 12 },
});