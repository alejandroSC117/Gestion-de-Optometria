import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Button, Card } from '@components/index';
import { NEXUS_NAME, NEXUS_TAGLINE } from '@config/constants';
import { COLORS } from '@config/constants';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>{NEXUS_NAME}</Text>
          <Text style={styles.tagline}>{NEXUS_TAGLINE}</Text>
        </View>

        {/* Description Card */}
        <Card variant="highlighted" padding={24} marginBottom={32}>
          <Text style={styles.descriptionTitle}>Bienvenido a NEXUS</Text>
          <Text style={styles.descriptionText}>
            Una plataforma profesional para simplificar el trabajo optométrico.
          </Text>
          <Text style={styles.descriptionSubtext}>
            Calculadoras optométricas, historia clínica, expediente de pacientes,
            recetas y asistente inteligente.
          </Text>
        </Card>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Características principales</Text>

          <Card padding={16} marginBottom={12}>
            <Text style={styles.featureTitle}>📊 Calculadoras Optométricas</Text>
            <Text style={styles.featureDescription}>
              Herramientas precisas para refracción y óptica
            </Text>
          </Card>

          <Card padding={16} marginBottom={12}>
            <Text style={styles.featureTitle}>👁️ Examen Visual Guiado</Text>
            <Text style={styles.featureDescription}>
              Protocolo estructurado para cada consulta
            </Text>
          </Card>

          <Card padding={16} marginBottom={12}>
            <Text style={styles.featureTitle}>📋 Historia Clínica</Text>
            <Text style={styles.featureDescription}>
              Registro completo y seguro de pacientes
            </Text>
          </Card>

          <Card padding={16} marginBottom={12}>
            <Text style={styles.featureTitle}>🤖 Asistente NEXUS AI</Text>
            <Text style={styles.featureDescription}>
              Soporte inteligente en tus decisiones
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          label="Crear Cuenta"
          onPress={() => router.push('/(auth)/register')}
          variant="primary"
          fullWidth
        />
        <Button
          label="Iniciar Sesión"
          onPress={() => router.push('/(auth)/login')}
          variant="ghost"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: COLORS.neutral,
    fontStyle: 'italic',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 20,
  },
  descriptionSubtext: {
    fontSize: 13,
    color: COLORS.neutral,
    lineHeight: 18,
  },
  featuresSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.neutral,
    lineHeight: 18,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
