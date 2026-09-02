import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import type { UsageFeature } from '@/config/subscription';
import { Screen, TopBar } from '@/components/NexusUI';

type Message = { id: string; role: 'assistant' | 'user'; text: string };
const initialMessages: Message[] = [{ id: 'welcome', role: 'assistant', text: 'Hola. Soy Nexus AI. Puedo ayudarte con conceptos y herramientas de optometría. Mi información es de apoyo y no sustituye tu criterio profesional.' }];
const optometryTerms = ['ojo', 'visual', 'lente', 'graduación', 'refracción', 'cilindro', 'esfera', 'eje', 'paciente', 'optometr', 'agudeza', 'prisma'];

export default function NexusAiScreen() {
  const colors = useColors();
  const router = useRouter();
  const { usage, limitFor, consume } = useSubscription();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const remaining = Math.max(0, limitFor('assistant' as UsageFeature) - usage.assistant);
  const reversed = useMemo(() => [...messages].reverse(), [messages]);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    if (!consume('assistant')) { router.push('/plans'); return; }
    const relevant = optometryTerms.some((term) => text.toLowerCase().includes(term));
    const answer = relevant ? 'Puedo orientarte de forma general sobre ese tema. Verifica siempre la información con tu protocolo y criterio clínico antes de aplicarla.' : 'Nexus AI responde exclusivamente preguntas relacionadas con optometría. Reformula tu pregunta con un contexto visual o clínico.';
    setMessages((current) => [{ id: `${Date.now()}-answer`, role: 'assistant', text: answer }, { id: `${Date.now()}-question`, role: 'user', text }, ...current]);
    setDraft('');
  };
  return <Screen scroll={false}><TopBar eyebrow="Apoyo profesional" title="Nexus AI" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><KeyboardAvoidingView style={styles.chat} behavior="padding"><FlatList data={reversed} inverted keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" renderItem={({ item }) => <View style={[styles.bubble, item.role === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]]}><Text style={[styles.bubbleText, { color: item.role === 'user' ? colors.primaryForeground : colors.foreground }]}>{item.text}</Text></View>} ListHeaderComponent={<Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Herramienta de apoyo. No sustituye el criterio de un optometrista.</Text>} /></KeyboardAvoidingView><View style={[styles.composer, { borderColor: colors.border, backgroundColor: colors.card }]}><TextInput value={draft} onChangeText={setDraft} placeholder="Pregunta sobre optometría..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} multiline testID="nexus-ai-input" /><Pressable onPress={send} accessibilityLabel="Enviar pregunta" style={[styles.send, { backgroundColor: colors.primary }]}><Feather name="arrow-up" size={18} color={colors.primaryForeground} /></Pressable></View><Text style={[styles.remaining, { color: colors.mutedForeground }]}>{remaining} consultas disponibles este mes</Text></Screen>;
}

const styles = StyleSheet.create({
  chat: { flex: 1 },
  messages: { paddingVertical: 12, gap: 9 },
  bubble: { maxWidth: '88%', borderRadius: 18, padding: 13, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', borderBottomRightRadius: 5 },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 5 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  disclaimer: { fontSize: 10, lineHeight: 15, textAlign: 'center', marginHorizontal: 30, marginBottom: 9 },
  composer: { minHeight: 54, borderWidth: 1, borderRadius: 17, paddingLeft: 14, paddingRight: 7, flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, maxHeight: 90, fontSize: 13, paddingVertical: 12 },
  send: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  remaining: { fontSize: 10, textAlign: 'center', marginTop: 8, marginBottom: 8 },
});