import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { CheckRow, Field, PrimaryButton, Screen, SecondaryButton, TopBar } from '@/components/NexusUI';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useSignUp } from '@clerk/expo';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [code, setCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    if (!name.trim() || !email.trim() || !password || password !== confirmation || !accepted) {
      setError('Completa los campos, usa una contraseña de 6 caracteres o más y acepta los términos.');
      return;
    }
    setError('');
    const [firstName, ...lastParts] = name.trim().split(/\s+/);
    const result = await signUp.password({ emailAddress: email.trim(), password, firstName, lastName: lastParts.join(' ') });
    if (result.error) return setError(result.error.message);
    const verification = await signUp.verifications.sendEmailCode();
    if (verification.error) return setError(verification.error.message);
    setVerificationSent(true);
  };
  const verify = async () => {
    const result = await signUp.verifications.verifyEmailCode({ code });
    if (result.error) return setError(result.error.message);
    if (signUp.status === 'complete') await signUp.finalize({ navigate: () => router.replace('/plans') });
    else setError('La cuenta aún necesita otros pasos de verificación. Revisa el correo y vuelve a intentarlo.');
  };
  return <Screen scroll={false}><KeyboardAwareScrollViewCompat contentContainerStyle={styles.content} bottomOffset={24}><TopBar eyebrow="Nexus" title={verificationSent ? 'Verifica tu correo' : 'Crear cuenta'} action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>{verificationSent ? `Enviamos un código de verificación a ${email}.` : 'Crea tu espacio profesional con una cuenta verificada.'}</Text>{verificationSent ? <><Field label="Código de verificación" value={code} onChangeText={setCode} placeholder="Código recibido por correo" keyboardType="numeric" /><PrimaryButton label={fetchStatus === 'fetching' ? 'Verificando…' : 'Verificar y continuar'} icon="check" onPress={verify} disabled={fetchStatus === 'fetching'} /><SecondaryButton label="Enviar código de nuevo" onPress={() => signUp.verifications.sendEmailCode()} /><View nativeID="clerk-captcha" /></> : <><Field label="Nombre completo" value={name} onChangeText={setName} placeholder="Ej. Laura Méndez" /><Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="laura@consultorio.com" keyboardType="email-address" autoCapitalize="none" /><Field label="Contraseña" value={password} onChangeText={setPassword} placeholder="Contraseña segura" secureTextEntry autoCapitalize="none" /><Field label="Confirmar contraseña" value={confirmation} onChangeText={setConfirmation} placeholder="Repite tu contraseña" secureTextEntry autoCapitalize="none" /><CheckRow checked={accepted} onPress={() => setAccepted((value) => !value)} label="Acepto los términos y condiciones y el aviso de privacidad." /><PrimaryButton label={fetchStatus === 'fetching' ? 'Creando cuenta…' : 'Crear cuenta'} icon="arrow-right" onPress={submit} disabled={fetchStatus === 'fetching'} /><View nativeID="clerk-captcha" /></>}{error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}{errors.fields.emailAddress?.message ? <Text style={[styles.error, { color: colors.destructive }]}>{errors.fields.emailAddress.message}</Text> : null}<View style={styles.switchRow}><Text style={[styles.switchText, { color: colors.mutedForeground }]}>¿Ya tienes cuenta?</Text><SecondaryButton label="Iniciar sesión" onPress={() => router.replace('/auth/sign-in')} /></View></KeyboardAwareScrollViewCompat></Screen>;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 35 },
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  error: { fontSize: 12, lineHeight: 18, marginTop: -4, marginBottom: 16 },
  switchRow: { alignItems: 'center', marginTop: 24, gap: 9 },
  switchText: { fontSize: 12 },
});