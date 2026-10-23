import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { Field, PrimaryButton, Screen, SecondaryButton, TopBar } from '@/components/NexusUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSignIn } from '@clerk/expo';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!email.trim() || !password) return setError('Escribe tu correo y contraseña para continuar.');
    setError('');
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (result.error) return setError(result.error.message);
    if (signIn.status === 'complete') {
      await signIn.finalize({ navigate: () => router.replace('/plans') });
    } else if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
      const emailFactor = signIn.supportedSecondFactors?.find((factor) => factor.strategy === 'email_code');
      if (emailFactor || signIn.status === 'needs_client_trust') {
        await signIn.mfa.sendEmailCode();
        setNeedsCode(true);
      } else {
        setError('Tu cuenta requiere un segundo factor que todavía no está disponible en esta pantalla.');
      }
    } else {
      setError('No se pudo completar el inicio de sesión. Revisa los datos e inténtalo de nuevo.');
    }
  };
  const verify = async () => {
    const result = await signIn.mfa.verifyEmailCode({ code });
    if (result.error) return setError(result.error.message);
    if (signIn.status === 'complete') await signIn.finalize({ navigate: () => router.replace('/plans') });
  };
  return <Screen scroll={false}><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24}><TopBar eyebrow="Nexus" title={needsCode ? 'Verifica tu acceso' : 'Iniciar sesión'} action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>{needsCode ? `Ingresa el código enviado a ${email}.` : 'Acceso seguro a tu espacio de trabajo clínico.'}</Text>{needsCode ? <><Field label="Código de verificación" value={code} onChangeText={setCode} placeholder="Código recibido por correo" keyboardType="numeric" /><PrimaryButton label="Verificar y continuar" icon="check" onPress={verify} disabled={fetchStatus === 'fetching'} /><SecondaryButton label="Enviar código de nuevo" onPress={() => signIn.mfa.sendEmailCode()} /></> : <><Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="laura@consultorio.com" keyboardType="email-address" autoCapitalize="none" /><Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Tu contraseña" secureTextEntry autoCapitalize="none" /><Text style={[styles.forgot, { color: colors.primary }]} onPress={() => router.push('/auth/forgot-password')}>¿Olvidaste tu contraseña?</Text><PrimaryButton label={fetchStatus === 'fetching' ? 'Verificando…' : 'Iniciar sesión'} icon="log-in" onPress={submit} disabled={fetchStatus === 'fetching'} /></>}{error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}{errors.fields.identifier?.message ? <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.identifier.message}</Text> : null}<View style={styles.switchRow}><Text style={[styles.switchText, { color: colors.mutedForeground }]}>¿Aún no tienes cuenta?</Text><SecondaryButton label="Crear una cuenta" onPress={() => router.replace('/auth/sign-up')} /></View></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 35 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  error: { fontSize: 12, marginBottom: 16 },
  forgot: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginTop: 18 },
  switchRow: { alignItems: 'center', marginTop: 27, gap: 9 },
  switchText: { fontSize: 12 },
});