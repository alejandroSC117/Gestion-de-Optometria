import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return <Screen><TopBar eyebrow="Acceso" title="Recuperar acceso" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.copy, { color: colors.mutedForeground }]}>Escribe tu correo y dejaremos preparado el flujo de recuperación para conectarlo a autenticación real.</Text><Field label="Correo electrónico" value={email} onChangeText={setEmail} placeholder="laura@consultorio.com" keyboardType="email-address" autoCapitalize="none" /><PrimaryButton label="Enviar instrucciones" icon="send" onPress={() => setSent(true)} />{sent ? <Text style={[styles.sent, { color: colors.primary }]}>En una versión conectada, recibirás las instrucciones en tu correo.</Text> : null}</Screen>;
}

const styles = StyleSheet.create({
  copy: { fontSize: 14, lineHeight: 21, marginBottom: 24 },
  sent: { fontSize: 13, lineHeight: 19, marginTop: 18, textAlign: 'center' },
});