import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { SupportPriority, SupportStatus, useSupport } from '@/context/SupportContext';
import { Field, PrimaryButton, Screen, TopBar } from '@/components/NexusUI';

const faqs = [
  ['¿Cómo guardo una receta?', 'Abre Recetas desde Inicio o desde el expediente de un paciente y completa la graduación.'],
  ['¿Dónde se almacenan mis datos?', 'Durante esta fase los datos se guardan localmente en el dispositivo para pruebas con pacientes ficticios.'],
  ['¿Cómo funcionan los límites?', 'El uso mensual aparece en Inicio y Ajustes. Al llegar al límite podrás revisar los planes disponibles.'],
];

const statusLabels: Record<SupportStatus, string> = { open: 'Abierto', review: 'En revisión', in_progress: 'En proceso', resolved: 'Resuelto', closed: 'Cerrado' };
const priorityLabels: Record<SupportPriority, string> = { low: 'Baja', normal: 'Normal', high: 'Alta' };

export default function SupportScreen() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { tickets, createTicket } = useSupport();
  const [category, setCategory] = useState('Problema técnico');
  const [priority, setPriority] = useState<SupportPriority>('normal');
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState('');

  function submit() {
    if (!description.trim()) return;
    const ticket = createTicket({ userId: user?.id || 'demo-user', category, description: description.trim(), priority });
    setDescription('');
    setSent(`Ticket ${ticket.id} creado correctamente.`);
  }

  return (
    <Screen>
      <TopBar eyebrow="Ayuda" title="Soporte" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} />
      <View style={[styles.hero, { backgroundColor: colors.primary }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.accent }]}><Feather name="life-buoy" size={22} color={colors.primary} /></View>
        <Text style={styles.heroTitle}>Estamos para ayudarte</Text>
        <Text style={styles.heroText}>Consulta respuestas rápidas o abre un ticket para el equipo de Nexus.</Text>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Centro de ayuda</Text>
      <View style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {faqs.map(([question, answer]) => <View key={question} style={[styles.faq, { borderBottomColor: colors.border }]}><Text style={[styles.question, { color: colors.foreground }]}>{question}</Text><Text style={[styles.answer, { color: colors.mutedForeground }]}>{answer}</Text></View>)}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reportar un problema</Text>
      <Field label="Categoría" value={category} onChangeText={setCategory} placeholder="Problema técnico" />
      <View style={styles.chips}>{(['low', 'normal', 'high'] as SupportPriority[]).map((item) => <Pressable key={item} onPress={() => setPriority(item)} style={[styles.chip, { backgroundColor: priority === item ? colors.secondary : colors.card, borderColor: priority === item ? colors.primary : colors.border }]}><Text style={[styles.chipText, { color: priority === item ? colors.primary : colors.mutedForeground }]}>{priorityLabels[item]}</Text></Pressable>)}</View>
      <Field label="Descripción" value={description} onChangeText={setDescription} placeholder="Cuéntanos qué ocurrió..." multiline />
      {sent ? <Text style={[styles.success, { color: colors.primary }]}>{sent}</Text> : null}
      <PrimaryButton label="Crear ticket" icon="send" onPress={submit} disabled={!description.trim()} />
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Mis tickets</Text>
      {tickets.length ? tickets.map((ticket) => <View key={ticket.id} style={[styles.ticket, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.ticketTop}><Text style={[styles.ticketId, { color: colors.primary }]}>{ticket.id}</Text><Text style={[styles.ticketStatus, { color: colors.mutedForeground }]}>{statusLabels[ticket.status]}</Text></View><Text style={[styles.ticketCategory, { color: colors.foreground }]}>{ticket.category} · Prioridad {priorityLabels[ticket.priority]}</Text><Text style={[styles.ticketDescription, { color: colors.mutedForeground }]}>{ticket.description}</Text></View>) : <Text style={[styles.empty, { color: colors.mutedForeground }]}>Aún no has creado tickets.</Text>}
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Contactar soporte y el panel administrativo se conectarán a un backend posteriormente.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 22, padding: 19, marginBottom: 23 },
  heroIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  heroText: { color: '#DDEEFF', fontSize: 13, lineHeight: 19, marginTop: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 11, marginTop: 4 },
  faqCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, marginBottom: 24 },
  faq: { paddingVertical: 14, borderBottomWidth: 1 },
  question: { fontSize: 13, fontWeight: '700' },
  answer: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  chips: { flexDirection: 'row', gap: 8, marginTop: -3, marginBottom: 15 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipText: { fontSize: 11, fontWeight: '700' },
  success: { fontSize: 12, marginTop: -5, marginBottom: 12 },
  ticket: { borderWidth: 1, borderRadius: 17, padding: 14, marginBottom: 9 },
  ticketTop: { flexDirection: 'row', justifyContent: 'space-between' },
  ticketId: { fontSize: 12, fontWeight: '700' },
  ticketStatus: { fontSize: 11, fontWeight: '600' },
  ticketCategory: { fontSize: 13, fontWeight: '700', marginTop: 10 },
  ticketDescription: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  empty: { fontSize: 13, marginBottom: 18 },
  footer: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 22, marginBottom: 12 },
});