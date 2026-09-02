import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface TextInputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  multiline = false,
  numberOfLines = 1,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#999"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
});
