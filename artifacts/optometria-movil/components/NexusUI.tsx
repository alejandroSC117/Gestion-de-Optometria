import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import type { Patient } from '@/context/ClinicContext';

type FeatherName = React.ComponentProps<typeof Feather>['name'];

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const colors = useColors();
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.fixedContent}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
        Platform.OS === 'web' ? styles.webSafeArea : undefined,
      ]}
    >
      {content}
    </SafeAreaView>
  );
}

export function TopBar({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: { icon: FeatherName; onPress: () => void; label: string };
}) {
  const colors = useColors();
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarCopy}>
        {eyebrow ? <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
      </View>
      {action ? (
        <Pressable
          accessibilityLabel={action.label}
          testID={`top-action-${action.label}`}
          onPress={action.onPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Feather name={action.icon} size={21} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function SectionHeading({ title, action }: { title: string; action?: string }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action ? <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text> : null}
    </View>
  );
}

export function ActionTile({
  icon,
  label,
  caption,
  onPress,
  wide = false,
}: {
  icon: FeatherName;
  label: string;
  caption: string;
  onPress: () => void;
  wide?: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID={`action-${label}`}
      style={({ pressed }) => [
        styles.actionTile,
        wide && styles.actionTileWide,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.tilePressed,
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.accent }]}>
        <Feather name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.actionCopy}>
        <Text style={[styles.actionLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.actionCaption, { color: colors.mutedForeground }]}>{caption}</Text>
      </View>
      <Feather name="arrow-up-right" size={17} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function StatCard({ value, label, icon }: { value: string; label: string; icon: FeatherName }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export function PatientAvatar({ patient, size = 44 }: { patient: Pick<Patient, 'firstName' | 'lastName'>; size?: number }) {
  const colors = useColors();
  const initials = `${patient.firstName.charAt(0)}${patient.lastName.charAt(0)}`.toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondary }]}>
      <Text style={[styles.avatarText, { color: colors.primary, fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export function PatientRow({ patient, onPress, meta }: { patient: Patient; onPress: () => void; meta?: string }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      testID={`patient-${patient.id}`}
      style={({ pressed }) => [
        styles.patientRow,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && styles.tilePressed,
      ]}
    >
      <PatientAvatar patient={patient} />
      <View style={styles.patientCopy}>
        <Text style={[styles.patientName, { color: colors.foreground }]}>{patient.firstName} {patient.lastName}</Text>
        <Text style={[styles.patientMeta, { color: colors.mutedForeground }]}>{meta || patient.phone || 'Sin teléfono registrado'}</Text>
      </View>
      <Feather name="chevron-right" size={19} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function StatusPill({ status }: { status: string }) {
  const colors = useColors();
  const isDone = status === 'completed';
  const isPending = status === 'pending';
  const isCancelled = status === 'cancelled';
  const background = isCancelled ? '#FBE9E9' : isDone ? colors.secondary : isPending ? '#FFF4DC' : '#E8F0FF';
  const foreground = isCancelled ? colors.destructive : isDone ? colors.primary : isPending ? '#9A6A09' : '#3565AF';
  const label = isCancelled ? 'Cancelada' : isDone ? 'Atendida' : isPending ? 'Pendiente' : 'Confirmada';
  return (
    <View style={[styles.statusPill, { backgroundColor: background }]}>
      <View style={[styles.statusDot, { backgroundColor: foreground }]} />
      <Text style={[styles.statusText, { color: foreground }]}>{label}</Text>
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'phone-pad' | 'email-address' | 'numeric';
  multiline?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border },
        ]}
      />
    </View>
  );
}

export function PrimaryButton({ label, icon, onPress, disabled = false }: { label: string; icon?: FeatherName; onPress: () => void; disabled?: boolean }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={`button-${label}`}
      style={({ pressed }) => [
        styles.primaryButton,
        { backgroundColor: colors.primary },
        disabled && styles.buttonDisabled,
        pressed && styles.buttonPressed,
      ]}
    >
      {icon ? <Feather name={icon} size={18} color={colors.primaryForeground} /> : null}
      <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, message }: { icon: FeatherName; title: string; message: string }) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );
}

export function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  webSafeArea: { paddingTop: 12, paddingBottom: 34 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 42 },
  fixedContent: { flex: 1, paddingHorizontal: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, paddingBottom: 22 },
  topBarCopy: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 5 },
  pageTitle: { fontSize: 28, fontWeight: '700', letterSpacing: -0.7 },
  iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.55 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.2 },
  sectionAction: { fontSize: 13, fontWeight: '600' },
  actionTile: { width: '48.2%', minHeight: 132, borderWidth: 1, borderRadius: 20, padding: 15, marginBottom: 10, justifyContent: 'space-between' },
  actionTileWide: { width: '100%', minHeight: 92, flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  actionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionCopy: { flex: 1, marginLeft: 0 },
  actionLabel: { fontSize: 14, fontWeight: '700', lineHeight: 19, marginTop: 10 },
  actionCaption: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  tilePressed: { opacity: 0.7, transform: [{ scale: 0.985 }] },
  statCard: { flex: 1, minHeight: 108, borderRadius: 18, borderWidth: 1, padding: 13, marginRight: 9 },
  statIcon: { width: 29, height: 29, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, marginTop: 3 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700' },
  patientRow: { minHeight: 72, borderWidth: 1, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 9 },
  patientCopy: { flex: 1, marginLeft: 12 },
  patientName: { fontSize: 14, fontWeight: '700' },
  patientMeta: { fontSize: 12, marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 4, marginRight: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '700', marginBottom: 7 },
  field: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 15 },
  fieldMultiline: { minHeight: 104, paddingTop: 13 },
  primaryButton: { minHeight: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 18 },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  buttonDisabled: { opacity: 0.45 },
  emptyState: { borderWidth: 1, borderRadius: 18, alignItems: 'center', padding: 28, marginTop: 10 },
  emptyIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emptyTitle: { fontSize: 15, fontWeight: '700' },
  emptyMessage: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, maxWidth: 260 },
});
