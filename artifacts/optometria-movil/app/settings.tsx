import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { PLAN_DEFINITIONS } from '@/config/subscription';
import { PlanBadge, Screen, TopBar, UsageProgress } from '@/components/NexusUI';

const settingRows = [{ label: 'Plan y suscripción', icon: 'credit-card' as const, route: '/plans' as const }, { label: 'Notificaciones', icon: 'bell' as const }, { label: 'Privacidad', icon: 'shield' as const }, { label: 'Términos y condiciones', icon: 'file-text' as const }];

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { plan, usage, limitFor } = useSubscription();
  return <Screen><TopBar eyebrow="Preferencias" title="Ajustes" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><View style={[styles.profile, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={[styles.avatar, { backgroundColor: colors.secondary }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{(user?.name || 'N').charAt(0).toUpperCase()}</Text></View><View style={styles.profileCopy}><Text style={[styles.name, { color: colors.foreground }]}>{user?.name || 'Profesional Nexus'}</Text><Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email || 'demo@nexus.app'}</Text></View><PlanBadge plan={plan} /></View><View style={[styles.usageCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.usageTitle}><Text style={[styles.cardTitle, { color: colors.foreground }]}>Uso mensual</Text><Text style={[styles.usageHint, { color: colors.mutedForeground }]}>Plan {PLAN_DEFINITIONS[plan].name.replace('NEXUS ', '')}</Text></View><UsageProgress feature="transposition" used={usage.transposition} limit={limitFor('transposition')} /><UsageProgress feature="calculator" used={usage.calculator} limit={limitFor('calculator')} /><UsageProgress feature="assistant" used={usage.assistant} limit={limitFor('assistant')} /></View><View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>{settingRows.map((row) => <Pressable key={row.label} onPress={() => row.route && router.push(row.route)} style={[styles.menuRow, { borderBottomColor: colors.border }]}><Feather name={row.icon} size={18} color={colors.primary} /><Text style={[styles.menuText, { color: colors.foreground }]}>{row.label}</Text><Feather name={row.route ? 'chevron-right' : 'lock'} size={17} color={colors.mutedForeground} /></Pressable>)}</View><Pressable onPress={() => { signOut(); router.replace('/welcome'); }} style={styles.logout}><Feather name="log-out" size={17} color={colors.destructive} /><Text style={[styles.logoutText, { color: colors.destructive }]}>Cerrar sesión</Text></Pressable></Screen>;
}

const styles = StyleSheet.create({
  profile: { borderWidth: 1, borderRadius: 19, padding: 15, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 19, fontWeight: '700' },
  profileCopy: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700' },
  email: { fontSize: 11, marginTop: 4 },
  usageCard: { borderWidth: 1, borderRadius: 19, padding: 16, marginTop: 12 },
  usageTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  usageHint: { fontSize: 10 },
  menu: { borderWidth: 1, borderRadius: 19, paddingHorizontal: 15, marginTop: 12 },
  menuRow: { minHeight: 53, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRowLast: { borderBottomWidth: 0 },
  menuText: { flex: 1, fontSize: 13, fontWeight: '600' },
  logout: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 52, marginTop: 17 },
  logoutText: { fontSize: 13, fontWeight: '700' },
});