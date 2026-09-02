import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={getTextStyle()}>{loading ? 'Cargando...' : label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  ghostText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
});
