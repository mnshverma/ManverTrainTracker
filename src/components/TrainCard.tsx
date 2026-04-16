import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrainSchedule } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../utils/theme';
import StatusBadge from './StatusBadge';

interface TrainCardProps {
  train: TrainSchedule;
  onPress: () => void;
}

export default function TrainCard({ train, onPress }: TrainCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.trainInfo}>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          <Text style={styles.trainName}>{train.trainName}</Text>
        </View>
        <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.stationInfo}>
          <Text style={styles.time}>{train.departureTime}</Text>
          <Text style={styles.stationCode}>{train.origin}</Text>
        </View>

        <View style={styles.durationContainer}>
          <View style={styles.durationLine} />
          <Text style={styles.duration}>{train.duration}</Text>
          <View style={styles.durationLine} />
        </View>

        <View style={styles.stationInfo}>
          <Text style={styles.time}>{train.arrivalTime}</Text>
          <Text style={styles.stationCode}>{train.destination}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dayContainer}>
          {train.daysOfOperation.slice(0, 3).map((day, index) => (
            <View key={index} style={styles.dayBadge}>
              <Text style={styles.dayText}>{day.slice(0, 2)}</Text>
            </View>
          ))}
          {train.daysOfOperation.length > 3 && (
            <Text style={styles.moreDays}>+{train.daysOfOperation.length - 3}</Text>
          )}
        </View>
        <Text style={styles.stopsText}>{train.stops.length} stops</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  trainInfo: {
    flex: 1,
  },
  trainNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  trainName: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stationInfo: {
    alignItems: 'center',
    minWidth: 60,
  },
  time: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  stationCode: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  durationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  durationLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
  },
  duration: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  dayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    marginRight: 4,
  },
  dayText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  moreDays: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  stopsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
