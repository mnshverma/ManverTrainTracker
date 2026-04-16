import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '../utils/theme';

interface StatusBadgeProps {
  status: 'on-time' | 'delayed' | 'cancelled';
  delayMinutes?: number;
}

export default function StatusBadge({ status, delayMinutes }: StatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'on-time':
        return Colors.success;
      case 'delayed':
        return Colors.warning;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'on-time':
        return 'On Time';
      case 'delayed':
        return delayMinutes ? `+${delayMinutes} min` : 'Delayed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textLight,
  },
});
