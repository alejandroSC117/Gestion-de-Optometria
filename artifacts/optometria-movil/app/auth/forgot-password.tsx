import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { useColors } from '@/hooks/useColors';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function sendCode() {
    if (!email.trim()) {
      setError('Escribe el correo asociado a tu cuenta.');
      return;
    }
    setError('');
    const created = await signIn.create({ identifier: email.trim() });
    if (created.error) {
      setError('No se pudo iniciar la recuperación. Verifica el correo e inténtalo de nuevo.');
      return;
    }
    const result = await signIn.resetPasswordEmailCode.sendCode();
    if (result.error) {
      setError('No se pudo enviar el código. Verifica el correo o inténtalo más tarde.');
      return;
    }
    setStep('reset');
    setMessage('Si el correo corresponde a una cuenta, Clerk enviará un código de recuperación.');
  }

  async function resetPassword() {
    if (!code.trim() || password.length < 8) {
      setError('Escribe el código y una contraseña de al menos 8 caracteres.');
      return;
    }
    setError('');
    const verification = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
    if (verification.error) {
      setError(verification.error.message);
      return;
    }
    const result = await signIn.resetPasswordEmailCode.submitPassword({ password });
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setMessage('La contraseña se actualizó. Inicia sesión con tu nueva contraseña.');
    setStep('done');
  }

  return (
    <Screen>
      <TopBar eyebrow="Acceso seguro" title="Recuperar contraseña" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <Text style={[styles.copy, { color: colors.mutedForeground }]}>
        {step === 'email' ? 'Clerk enviará un código al correo asociado a tu cuenta.' : step === 'reset' ? `Ingresa el código enviado a ${email} y crea una contraseña nueva.` : 'La recuperación terminó. Inicia sesión con tu contraseña nueva.'}
      </Text>
      {step === 'email' ? (
        <>
          <Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="profesional@email.com" keyboardType="email-address" autoCapitalize="none" />
          <PrimaryButton label={fetchStatus === 'fetching' ? 'Enviando…' : 'Enviar código'} icon="send" onPress={sendCode} disabled={fetchStatus === 'fetching'} />
        </>
      ) : step === 'reset' ? (
        <>
          <Field label="Código de recuperación" value={code} onChangeText={setCode} placeholder="Código recibido por correo" keyboardType="numeric" />
          <Field label="Nueva contraseña" value={password} onChangeText={setPassword} placeholder="Al menos 8 caracteres" secureTextEntry autoCapitalize="none" />
          <PrimaryButton label={fetchStatus === 'fetching' ? 'Actualizando…' : 'Actualizar contraseña'} icon="check" onPress={resetPassword} disabled={fetchStatus === 'fetching'} />
        </>
      ) : <PrimaryButton label="Volver a iniciar sesión" icon="log-in" onPress={() => router.replace('/auth/sign-in')} />}
      {message ? <Text style={[styles.copy, { color: colors.primary }]}>{message}</Text> : null}
      {error ? <Text style={[styles.copy, { color: colors.destructive }]}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
});
