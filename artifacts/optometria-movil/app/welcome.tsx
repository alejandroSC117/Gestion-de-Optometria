import { Redirect, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { PrimaryButton, Screen, SecondaryButton } from '@/components/NexusUI';

function NexusMark() {
  const colors = useColors();
  return <View style={[styles.mark, { backgroundColor: colors.primary }]}><View style={[styles.markRing, { borderColor: colors.card }]}><Feather name="eye" size={32} color={colors.card} /></View></View>;
}

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Redirect href="/(tabs)" />;
  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.brand}><NexusMark /><Text style={[styles.brandName, { color: colors.foreground }]}>NEXUS</Text><Text style={[styles.tagline, { color: colors.mutedForeground }]}>Asistente inteligente para optometría</Text></View>
        <View style={styles.bottom}><Text style={[styles.kicker, { color: colors.primary }]}>TU PRÁCTICA, EN FOCO</Text><Text style={[styles.title, { color: colors.foreground }]}>Todo lo que necesitas para ver mejor.</Text><Text style={[styles.body, { color: colors.mutedForeground }]}>Herramientas profesionales para acompañar tu consulta, desde el teléfono.</Text><PrimaryButton label="Crear cuenta" icon="user-plus" onPress={() => router.push('/auth/sign-up')} /><View style={styles.gap} /><SecondaryButton label="Iniciar sesión" icon="log-in" onPress={() => router.push('/auth/sign-in')} /><Text style={[styles.footnote, { color: colors.mutedForeground }]}>Diseñado exclusivamente para profesionales de optometría.</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingVertical: 22 },
  brand: { alignItems: 'center', paddingTop: 60 },
  mark: { width: 94, height: 94, borderRadius: 32, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
  markRing: { width: 61, height: 61, borderWidth: 2, borderRadius: 31, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
  brandName: { fontSize: 31, fontWeight: '700', letterSpacing: 5, marginTop: 18 },
  tagline: { fontSize: 14, marginTop: 7 },
  bottom: { paddingBottom: 12 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  title: { fontSize: 29, lineHeight: 35, fontWeight: '700', letterSpacing: -0.8, maxWidth: 330 },
  body: { fontSize: 14, lineHeight: 21, marginTop: 10, marginBottom: 26, maxWidth: 315 },
  gap: { height: 10 },
  footnote: { fontSize: 11, textAlign: 'center', marginTop: 20 },
});