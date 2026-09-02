import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface SelectPickerProps {
  label: string;
  placeholder: string;
  value: string;
  items: { label: string; value: string }[];
  onSelect: (value: string) => void;
  error?: string;
}

export const SelectPicker: React.FC<SelectPickerProps> = ({
  label,
  placeholder,
  value,
  items,
  onSelect,
  error,
}) => {
  const selectedLabel = items.find((item) => item.value === value)?.label || placeholder;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.picker,
          error && styles.pickerError,
        ]}
      >
        <Text style={[styles.pickerText, !value && styles.placeholderText]}>
          {selectedLabel}
        </Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Simple inline options for now - will be replaced with Picker modal in production */}
      <View style={styles.optionsContainer}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.option,
              value === item.value && styles.selectedOption,
            ]}
            onPress={() => onSelect(item.value)}
          >
            <Text
              style={[
                styles.optionText,
                value === item.value && styles.selectedOptionText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
  picker: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
  },
  pickerText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
  },
  pickerError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    marginTop: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
