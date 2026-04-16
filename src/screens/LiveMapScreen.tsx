import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrain } from '../context/TrainContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';

const isWeb = Platform.OS === 'web';

export default function LiveMapScreen() {
  const { state, getStationByCode, getTrainPosition } = useTrain();
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);

  const stationMarkers = state.schedules.reduce((acc, train) => {
    train.stops.forEach((stop) => {
      const station = getStationByCode(stop.stationCode);
      if (station && !acc.find((s) => s.code === station.code)) {
        acc.push(station);
      }
    });
    return acc;
  }, [] as typeof state.stations);

  const selectedTrainData = selectedTrain ? getTrainPosition(selectedTrain) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Train Map</Text>
        <Text style={styles.subtitle}>Real-time train positions</Text>
      </View>

      <View style={styles.mapContainer}>
        {isWeb ? (
          <View style={styles.webPlaceholder}>
            <Text style={styles.webPlaceholderText}>🗺️ Map view available in mobile app</Text>
            <Text style={styles.webSubtext}>{stationMarkers.length} stations • {state.liveTrains.length} live trains</Text>
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map (requires native build)</Text>
          </View>
        )}
      </View>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Stations</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
          <Text style={styles.legendText}>Live Trains ({state.liveTrains.length})</Text>
        </View>
      </View>

      {selectedTrainData && (
        <View style={styles.trainInfoCard}>
          <View style={styles.trainInfoHeader}>
            <Text style={styles.trainNumber}>{selectedTrainData.trainNumber}</Text>
            <TouchableOpacity onPress={() => setSelectedTrain(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.trainInfoText}>
            Next Station: {selectedTrainData.nextStation}
          </Text>
          <Text style={styles.trainInfoText}>
            ETA: {selectedTrainData.estimatedArrival}
          </Text>
          <Text style={styles.trainInfoText}>
            Speed: {selectedTrainData.speed} km/h
          </Text>
        </View>
      )}

      <View style={styles.alertsContainer}>
        <Text style={styles.alertsTitle}>Active Alerts ({state.alerts.length})</Text>
        <FlatList
          horizontal
          data={state.alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.alertItem}>
              <Text style={styles.alertTrain}>{item.trainNumber}</Text>
              <Text style={styles.alertDelay}>+{item.delayMinutes}m</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  webPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  webPlaceholderText: {
    fontSize: FontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  webSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  map: {
    flex: 1,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  trainInfoCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trainNumber: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  closeButton: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    padding: Spacing.xs,
  },
  trainInfoText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  alertsContainer: {
    paddingVertical: Spacing.sm,
  },
  alertsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  alertItem: {
    backgroundColor: Colors.warning,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  alertTrain: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
  },
  alertDelay: {
    fontSize: FontSize.md,
    color: Colors.textLight,
  },
});
