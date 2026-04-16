import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTrain } from '../context/TrainContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const initialRegion = {
  latitude: 23.5,
  longitude: 80.5,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

export default function LiveMapScreen() {
  const mapRef = useRef<MapView>(null);
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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {stationMarkers.map((station) => (
            <Marker
              key={station.code}
              coordinate={station.location}
              title={station.name}
              description={`${station.platforms} platforms`}
              pinColor={Colors.primary}
            />
          ))}

          {state.liveTrains.map((train) => (
            <Marker
              key={train.trainNumber}
              coordinate={{ latitude: train.latitude, longitude: train.longitude }}
              title={train.trainNumber}
              description={`Next: ${train.nextStation} - ${train.estimatedArrival}`}
              pinColor={Colors.secondary}
              onPress={() => setSelectedTrain(train.trainNumber)}
            />
          ))}
        </MapView>
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
    height: height * 0.45,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
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
