import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Screen, TopBar } from '@/components/NexusUI';

type CalculatorTool = { label: string; caption: string; route?: '/tools/transposition' | '/tools/optical-calculations' };
type CalculatorCategory = { title: string; icon: 'refresh-cw' | 'sliders' | 'eye'; tools: CalculatorTool[] };

const categories: CalculatorCategory[] = [
  { title: 'Refracción', icon: 'refresh-cw' as const, tools: [{ label: 'Transposición de cilindro', caption: 'Positivo ↔ negativo', route: '/tools/transposition' as const }, { label: 'Equivalente esférico', caption: 'Próximamente' }, { label: 'Conversión de recetas', caption: 'Próximamente' }] },
  { title: 'Óptica', icon: 'sliders' as const, tools: [{ label: 'Distancia de vértice', caption: 'Conversión de potencia', route: '/tools/optical-calculations' as const }, { label: 'Prismas', caption: 'Próximamente' }, { label: 'Cálculos ópticos', caption: 'Vértice y distancia pupilar', route: '/tools/optical-calculations' as const }] },
  { title: 'Agudeza visual', icon: 'eye' as const, tools: [{ label: 'Conversión de escalas', caption: 'Próximamente' }] },
];

export default function CalculatorsScreen() {
  const colors = useColors();
  const router = useRouter();
  return <Screen><TopBar eyebrow="Herramientas" title="Calculadoras" action={{ icon: 'x', label: 'Cerrar', onPress: () => router.back() }} /><Text style={[styles.intro, { color: colors.mutedForeground }]}>Elige una categoría para resolver cálculos habituales de la consulta.</Text>{categories.map((category) => <View key={category.title} style={[styles.category, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.categoryHeader}><View style={[styles.categoryIcon, { backgroundColor: colors.accent }]}><Feather name={category.icon} size={17} color={colors.primary} /></View><Text style={[styles.categoryTitle, { color: colors.foreground }]}>{category.title}</Text></View>{category.tools.map((tool) => <Pressable key={tool.label} disabled={!tool.route} onPress={() => tool.route && router.push(tool.route)} style={({ pressed }) => [styles.toolRow, { borderTopColor: colors.border }, pressed && { opacity: 0.65 }]}><View style={styles.toolCopy}><Text style={[styles.toolLabel, { color: tool.route ? colors.foreground : colors.mutedForeground }]}>{tool.label}</Text><Text style={[styles.toolCaption, { color: colors.mutedForeground }]}>{tool.caption}</Text></View><Feather name={tool.route ? 'arrow-up-right' : 'lock'} size={16} color={tool.route ? colors.primary : colors.mutedForeground} /></Pressable>)}</View>)}</Screen>;
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 21, marginBottom: 19 },
  category: { borderWidth: 1, borderRadius: 20, padding: 15, marginBottom: 12 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  categoryIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  categoryTitle: { fontSize: 16, fontWeight: '700' },
  toolRow: { borderTopWidth: 1, minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toolCopy: { flex: 1 },
  toolLabel: { fontSize: 13, fontWeight: '700' },
  toolCaption: { fontSize: 11, marginTop: 3 },
});