import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInputField, Alert, LoadingSpinner } from '@components/index';
import { COLORS } from '@config/constants';
import { validateLogin } from '@utils/validation';
import { AuthService } from '@services/auth.service';
import { useAuthStore } from '@store/auth.store';

export default function LoginScreen() {
  const { setUser, setAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    setErrors([]);
    const validation = validateLogin(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.login(formData.email, formData.password);

      if (result.error) {
        setErrors([result.error]);
      } else {
        setUser(result.user);
        setAuthenticated(true);
        router.replace('/(app)/(tabs)');
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error en el inicio de sesión']);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Iniciando sesión..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>NEXUS</Text>
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
        </View>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert type="error" message={errors.join(' | ')} />
        )}

        {/* Form */}
        <TextInputField
          label="Correo Electrónico"
          placeholder="tu@correo.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />

        <TextInputField
          label="Contraseña"
          placeholder="Tu contraseña"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        {/* Forgot Password Link */}
        <TouchableOpacity style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          label="Iniciar Sesión"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
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
    marginTop: 40,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.neutral,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  linkText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
});
