import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, title, message }) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return styles.successAlert;
      case 'error':
        return styles.errorAlert;
      case 'warning':
        return styles.warningAlert;
      case 'info':
        return styles.infoAlert;
      default:
        return styles.infoAlert;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return styles.successText;
      case 'error':
        return styles.errorText;
      case 'warning':
        return styles.warningText;
      case 'info':
        return styles.infoText;
      default:
        return styles.infoText;
    }
  };

  return (
    <View style={getAlertStyle()}>
      {title && <Text style={[styles.title, getTextColor()]}>{title}</Text>}
      <Text style={[styles.message, getTextColor()]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  successAlert: {
    backgroundColor: '#F0FDF4',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  warningAlert: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  infoAlert: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
  },
  successText: {
    color: '#065F46',
  },
  errorText: {
    color: '#7F1D1D',
  },
  warningText: {
    color: '#92400E',
  },
  infoText: {
    color: '#0C4A6E',
  },
});
