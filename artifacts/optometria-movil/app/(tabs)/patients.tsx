import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useClinic } from '@/context/ClinicContext';
import { EmptyState, PatientRow, Screen, TopBar, UpgradeCard } from '@/components/NexusUI';
import { useSubscription } from '@/context/SubscriptionContext';

export default function PatientsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { patients } = useClinic();
  const { canAccess } = useSubscription();
  const [search, setSearch] = useState('');
  const filteredPatients = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return patients.filter((patient) => `${patient.firstName} ${patient.lastName} ${patient.phone}`.toLowerCase().includes(normalized));
  }, [patients, search]);

  if (!canAccess('patientHistory')) {
    return <Screen><TopBar eyebrow="Expedientes" title="Pacientes" /><UpgradeCard title="Historial de pacientes es Pro" message="Actualiza a Nexus Pro para crear expedientes, guardar exámenes y consultar la evolución clínica." onPress={() => router.push('/plans')} /></Screen>;
  }

  return (
    <Screen>
      <TopBar
        eyebrow="Expedientes"
        title="Pacientes"
        action={{ icon: 'plus', label: 'Nuevo paciente', onPress: () => router.push('/patient/new') }}
      />
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre o teléfono"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
          testID="patient-search"
        />
        {search ? <Pressable onPress={() => setSearch('')}><Feather name="x-circle" size={17} color={colors.mutedForeground} /></Pressable> : null}
      </View>
      <Text style={[styles.count, { color: colors.mutedForeground }]}>{filteredPatients.length} expedientes activos</Text>
      {filteredPatients.length ? filteredPatients.map((patient) => (
        <PatientRow
          key={patient.id}
          patient={patient}
          meta={patient.email || patient.phone}
          onPress={() => router.push({ pathname: '/patient/[id]', params: { id: String(patient.id) } })}
        />
      )) : (
        <EmptyState icon="users" title="No encontramos pacientes" message="Prueba con otro nombre o registra un paciente nuevo." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: { minHeight: 51, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 14 },
  count: { fontSize: 12, marginTop: 18, marginBottom: 10 },
});