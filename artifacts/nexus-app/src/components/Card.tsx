import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted' | 'success' | 'error';
  padding?: number;
  marginBottom?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 16,
  marginBottom = 12,
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'highlighted':
        return styles.highlightedCard;
      case 'success':
        return styles.successCard;
      case 'error':
        return styles.errorCard;
      default:
        return styles.defaultCard;
    }
  };

  return (
    <View
      style={[
        getCardStyle(),
        { padding, marginBottom },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  highlightedCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
});
