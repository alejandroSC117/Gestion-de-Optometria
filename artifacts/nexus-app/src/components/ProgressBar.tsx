import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@config/constants';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
}) => {
  const percentage = (current / total) * 100;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.bar,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.text}>
        {current} de {total}
      </Text>
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
  barContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    color: COLORS.neutral,
    textAlign: 'right',
  },
});
