import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { Field, PrimaryButton, Screen, SecondaryButton, TopBar } from '@/components/NexusUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!email.trim() || !password) return setError('Escribe tu correo y contraseña para continuar.');
    signIn(email);
    router.replace('/plans');
  };
  return <Screen scroll={false}><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24}><TopBar eyebrow="Nexus" title="Iniciar sesión" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>Vuelve a tu espacio de trabajo clínico.</Text><Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="laura@consultorio.com" keyboardType="email-address" autoCapitalize="none" /><Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry autoCapitalize="none" />{error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}<PrimaryButton label="Iniciar sesión" icon="log-in" onPress={submit} /><Text style={[styles.forgot, { color: colors.primary }]} onPress={() => router.push('/auth/forgot-password')}>¿Olvidaste tu contraseña?</Text><View style={styles.switchRow}><Text style={[styles.switchText, { color: colors.mutedForeground }]}>¿Aún no tienes cuenta?</Text><SecondaryButton label="Crear una cuenta" onPress={() => router.replace('/auth/sign-up')} /></View></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 35 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  error: { fontSize: 12, marginBottom: 16 },
  forgot: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 18 },
  switchRow: { alignItems: 'center', marginTop: 27, gap: 9 },
  switchText: { fontSize: 12 },
});