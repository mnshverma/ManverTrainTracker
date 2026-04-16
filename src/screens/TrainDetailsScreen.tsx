import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrain } from '../context/TrainContext';
import { TrainSchedule } from '../types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';
import StatusBadge from '../components/StatusBadge';

interface TrainDetailsScreenProps {
  route: {
    params: {
      train: TrainSchedule;
    };
  };
}

export default function TrainDetailsScreen({ route }: TrainDetailsScreenProps) {
  const { train } = route.params;
  const { getTrainPosition } = useTrain();
  const livePosition = getTrainPosition(train.trainNumber);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.backText}>← Back</Text>
        </View>

        <View style={styles.trainHeader}>
          <Text style={styles.trainNumber}>{train.trainNumber}</Text>
          <StatusBadge status={train.status} delayMinutes={train.delayMinutes} />
        </View>

        <Text style={styles.trainName}>{train.trainName}</Text>

        <View style={styles.routeCard}>
          <View style={styles.stationRow}>
            <View style={styles.stationInfo}>
              <Text style={styles.stationTime}>{train.departureTime}</Text>
              <Text style={styles.stationName}>Depart</Text>
            </View>
            <View style={styles.durationInfo}>
              <Text style={styles.durationText}>{train.duration}</Text>
              <View style={styles.durationLine} />
            </View>
            <View style={styles.stationInfo}>
              <Text style={styles.stationTime}>{train.arrivalTime}</Text>
              <Text style={styles.stationName}>Arrive</Text>
            </View>
          </View>
          <View style={styles.routeLabels}>
            <Text style={styles.routeCode}>{train.origin}</Text>
            <Text style={styles.routeCode}>{train.destination}</Text>
          </View>
        </View>

        {livePosition && (
          <View style={styles.liveCard}>
            <View style={styles.liveHeader}>
              <Text style={styles.liveTitle}>🚂 Live Location</Text>
              <View style={styles.liveDot} />
            </View>
            <View style={styles.liveRow}>
              <Text style={styles.liveLabel}>Speed</Text>
              <Text style={styles.liveValue}>{livePosition.speed} km/h</Text>
            </View>
            <View style={styles.liveRow}>
              <Text style={styles.liveLabel}>Next Station</Text>
              <Text style={styles.liveValue}>{livePosition.nextStation}</Text>
            </View>
            <View style={styles.liveRow}>
              <Text style={styles.liveLabel}>ETA</Text>
              <Text style={styles.liveValue}>{livePosition.estimatedArrival}</Text>
            </View>
          </View>
        )}

        <View style={styles.stopsSection}>
          <Text style={styles.sectionTitle}>Stops ({train.stops.length})</Text>
          {train.stops.map((stop, index) => (
            <View key={index} style={styles.stopItem}>
              <View style={styles.stopDot}>
                <View style={[styles.dot, index === 0 && styles.dotStart, index === train.stops.length - 1 && styles.dotEnd]} />
              </View>
              <View style={styles.stopInfo}>
                <Text style={styles.stopStation}>{stop.stationName}</Text>
                <Text style={styles.stopCode}>{stop.stationCode}</Text>
              </View>
              <View style={styles.stopTime}>
                <Text style={styles.arrivalTime}>{stop.arrivalTime}</Text>
                {stop.delay > 0 && (
                  <Text style={styles.delayText}>+{stop.delay} min</Text>
                )}
              </View>
              <View style={styles.platform}>
                <Text style={styles.platformLabel}>Platform</Text>
                <Text style={styles.platformNumber}>{stop.platform}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.daysSection}>
          <Text style={styles.sectionTitle}>Days of Operation</Text>
          <View style={styles.daysContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
              const isOperating = train.daysOfOperation.includes(day);
              return (
                <View key={day} style={[styles.dayBadge, isOperating && styles.dayBadgeActive, !isOperating && styles.dayBadgeInactive]}>
                  <Text style={[styles.dayText, isOperating && styles.dayTextActive]}>{day.slice(0, 2)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.primary,
  },
  trainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  trainNumber: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  trainName: {
    fontSize: FontSize.xl,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  routeCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  stationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stationInfo: {
    alignItems: 'center',
  },
  stationTime: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  stationName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  durationInfo: {
    alignItems: 'center',
    flex: 1,
  },
  durationText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  durationLine: {
    height: 2,
    backgroundColor: Colors.border,
    width: '80%',
    marginTop: Spacing.sm,
  },
  routeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  routeCode: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  liveCard: {
    backgroundColor: Colors.successLight,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  liveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  liveTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
  },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  liveLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  liveValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  stopsSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stopDot: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotStart: {
    backgroundColor: Colors.success,
  },
  dotEnd: {
    backgroundColor: Colors.error,
  },
  stopInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  stopStation: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  stopCode: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  stopTime: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  arrivalTime: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  delayText: {
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  platform: {
    alignItems: 'center',
  },
  platformLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  platformNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  daysSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  dayBadgeActive: {
    backgroundColor: Colors.primary,
  },
  dayBadgeInactive: {
    backgroundColor: Colors.border,
  },
  dayText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  dayTextActive: {
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
});