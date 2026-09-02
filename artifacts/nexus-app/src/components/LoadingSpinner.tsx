import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '@config/constants';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.neutral,
    fontWeight: '500',
  },
});
