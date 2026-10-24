import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useSubscription } from '@/context/SubscriptionContext';
import { Screen, TopBar } from '@/components/NexusUI';

type Message = { id: string; role: 'assistant' | 'user'; text: string };
const initialMessages: Message[] = [{ id: 'welcome', role: 'assistant', text: 'Esta es una vista de demostración con respuestas predefinidas. No hay un modelo de IA conectado. No compartas datos identificables ni clínicos.' }];
const optometryTerms = ['ojo', 'visual', 'lente', 'graduación', 'refracción', 'cilindro', 'esfera', 'eje', 'paciente', 'optometr', 'agudeza', 'prisma'];

export default function NexusAiScreen() {
  const colors = useColors();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const reversed = useMemo(() => [...messages].reverse(), [messages]);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const relevant = optometryTerms.some((term) => text.toLowerCase().includes(term));
    const answer = relevant ? 'Respuesta predefinida de demostración: verifica la información con una fuente profesional y tu criterio clínico. Esta pantalla no analiza tu pregunta con IA.' : 'Respuesta predefinida: esta demostración solo muestra mensajes fijos sobre optometría; no interpreta preguntas con un modelo de IA.';
    setMessages((current) => [{ id: `${Date.now()}-answer`, role: 'assistant', text: answer }, { id: `${Date.now()}-question`, role: 'user', text }, ...current]);
    setDraft('');
  };
  return <Screen scroll={false}><TopBar eyebrow="Demostración" title="Nexus AI · vista previa" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><KeyboardAvoidingView style={styles.chat} behavior="padding"><FlatList data={reversed} inverted keyExtractor={(item) => item.id} contentContainerStyle={styles.messages} keyboardDismissMode="interactive" keyboardShouldPersistTaps="handled" renderItem={({ item }) => <View style={[styles.bubble, item.role === 'user' ? [styles.userBubble, { backgroundColor: colors.primary }] : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]]}><Text style={[styles.bubbleText, { color: item.role === 'user' ? colors.primaryForeground : colors.foreground }]}>{item.text}</Text></View>} ListHeaderComponent={<Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>Respuestas fijas de demostración. No hay una IA real conectada; no introduzcas información de pacientes.</Text>} /></KeyboardAvoidingView><View style={[styles.composer, { borderColor: colors.border, backgroundColor: colors.card }]}><TextInput value={draft} onChangeText={setDraft} placeholder="Escribe una pregunta de prueba…" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} multiline testID="nexus-ai-input" /><Pressable onPress={send} accessibilityLabel="Enviar pregunta" style={[styles.send, { backgroundColor: colors.primary }]}><Feather name="arrow-up" size={18} color={colors.primaryForeground} /></Pressable></View></Screen>;
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