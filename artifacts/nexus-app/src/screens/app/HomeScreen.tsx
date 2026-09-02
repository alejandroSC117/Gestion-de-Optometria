import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Card, Button } from '@components/index';
import { COLORS, SUBSCRIPTION_PLANS } from '@config/constants';
import { useAuthStore } from '@store/auth.store';
import { formatDate } from '@utils/formatting';

export default function HomeScreen() {
  const { user, profile } = useAuthStore();
  const currentPlan = profile?.subscriptionPlan || 'free';
  const planData = SUBSCRIPTION_PLANS[currentPlan.toUpperCase() as keyof typeof SUBSCRIPTION_PLANS];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {user?.firstName || 'Usuario'}</Text>
          <Text style={styles.subtitle}>{formatDate(new Date())}</Text>
        </View>

        {/* Plan Card */}
        <Card variant="highlighted" padding={16} marginBottom={20}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planLabel}>Plan Actual</Text>
              <Text style={styles.planName}>{planData?.name}</Text>
            </View>
            <TouchableOpacity
              style={styles.upgradeBadge}
              onPress={() => router.push('/(app)/(tabs)/subscriptions')}
            >
              <Text style={styles.upgradeBadgeText}>Actualizar</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Usage Card */}
        <Card padding={16} marginBottom={20}>
          <Text style={styles.cardTitle}>Uso Mensual</Text>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Cálculos</Text>
            <Text style={styles.usageValue}>0 / {planData?.limits.monthlyCalculations || '∞'}</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Consultas IA</Text>
            <Text style={styles.usageValue}>0 / {planData?.limits.aiConsultations || '∞'}</Text>
          </View>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>Pacientes</Text>
            <Text style={styles.usageValue}>0 / {planData?.limits.patients || '∞'}</Text>
          </View>
        </Card>

        {/* Quick Access */}
        <Text style={styles.sectionTitle}>Acceso Rápido</Text>

        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/exams')}
          >
            <Text style={styles.gridIcon}>📊</Text>
            <Text style={styles.gridLabel}>Nuevo Examen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/patients')}
          >
            <Text style={styles.gridIcon}>👥</Text>
            <Text style={styles.gridLabel}>Pacientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/clinical')}
          >
            <Text style={styles.gridIcon}>📋</Text>
            <Text style={styles.gridLabel}>Historia Clínica</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/calculators')}
          >
            <Text style={styles.gridIcon}>🔢</Text>
            <Text style={styles.gridLabel}>Calculadoras</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/prescriptions')}
          >
            <Text style={styles.gridIcon}>📄</Text>
            <Text style={styles.gridLabel}>Recetas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/ai')}
          >
            <Text style={styles.gridIcon}>🤖</Text>
            <Text style={styles.gridLabel}>NEXUS AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/support')}
          >
            <Text style={styles.gridIcon}>💬</Text>
            <Text style={styles.gridLabel}>Soporte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => router.push('/(app)/(tabs)/settings')}
          >
            <Text style={styles.gridIcon}>⚙️</Text>
            <Text style={styles.gridLabel}>Ajustes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.neutral,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planLabel: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  upgradeBadge: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  upgradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  usageLabel: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  usageValue: {
    fontSize: 13,
    color: COLORS.neutral,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
});
