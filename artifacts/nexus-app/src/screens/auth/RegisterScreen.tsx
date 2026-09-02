import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInputField, SelectPicker, Alert, LoadingSpinner } from '@components/index';
import { PROFESSIONAL_CATEGORIES, COLORS } from '@config/constants';
import { validateRegistration } from '@utils/validation';
import { AuthService } from '@services/auth.service';
import { useAuthStore } from '@store/auth.store';

export default function RegisterScreen() {
  const { setUser, setAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    profession: '',
    acceptTerms: false,
  });

  const handleRegister = async () => {
    setErrors([]);
    const validation = validateRegistration(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.country,
        formData.profession
      );

      if (result.error) {
        setErrors([result.error]);
      } else {
        setUser(result.user);
        setAuthenticated(true);
        router.replace('/(app)/(tabs)');
      }
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Error en el registro']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad NEXUS</Text>
        </View>

        {/* Errors */}
        {errors.length > 0 && (
          <Alert type="error" message={errors.join(' | ')} />
        )}

        {/* Form */}
        <TextInputField
          label="Nombre"
          placeholder="Tu nombre"
          value={formData.firstName}
          onChangeText={(text) => setFormData({ ...formData, firstName: text })}
        />

        <TextInputField
          label="Apellido"
          placeholder="Tu apellido"
          value={formData.lastName}
          onChangeText={(text) => setFormData({ ...formData, lastName: text })}
        />

        <TextInputField
          label="Correo Electrónico"
          placeholder="tu@correo.com"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
        />

        <TextInputField
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        <TextInputField
          label="Confirmar Contraseña"
          placeholder="Repite tu contraseña"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
        />

        <TextInputField
          label="País"
          placeholder="Tu país"
          value={formData.country}
          onChangeText={(text) => setFormData({ ...formData, country: text })}
        />

        <SelectPicker
          label="Profesión"
          placeholder="Selecciona tu profesión"
          value={formData.profession}
          items={PROFESSIONAL_CATEGORIES.map((cat) => ({
            label: cat,
            value: cat,
          }))}
          onSelect={(value) => setFormData({ ...formData, profession: value })}
        />

        {/* Terms */}
        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFormData({ ...formData, acceptTerms: !formData.acceptTerms })}
          >
            <View
              style={[
                styles.checkboxBox,
                formData.acceptTerms && styles.checkboxBoxChecked,
              ]}
            >
              {formData.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Acepto los términos y condiciones y aviso de privacidad
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          label="Crear Cuenta"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
        />
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.neutral,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    paddingRight: 12,
    paddingTop: 2,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
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
