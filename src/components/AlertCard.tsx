import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DelayAlert } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../utils/theme';

interface AlertCardProps {
  alert: DelayAlert;
  onPress?: () => void;
}

export default function AlertCard({ alert, onPress }: AlertCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.delayIndicator}>
          <Text style={styles.delayText}>+{alert.delayMinutes} min</Text>
        </View>
        <Text style={styles.time}>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>

      <View style={styles.trainInfo}>
        <Text style={styles.trainNumber}>{alert.trainNumber}</Text>
        <Text style={styles.trainName}>{alert.trainName}</Text>
      </View>

      <View style={styles.reasonContainer}>
        <Text style={styles.reasonLabel}>Reason:</Text>
        <Text style={styles.reasonText}>{alert.reason}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  delayIndicator: {
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  delayText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
  },
  time: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  trainInfo: {
    marginBottom: Spacing.sm,
  },
  trainNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  trainName: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginRight: Spacing.xs,
  },
  reasonText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
});
