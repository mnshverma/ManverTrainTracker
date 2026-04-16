import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrain } from '../context/TrainContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';

export default function TrackTrainScreen() {
  const { state, getTrainPosition, getStationByCode } = useTrain();
  const [trainNumber, setTrainNumber] = useState('');
  const [searchedTrain, setSearchedTrain] = useState<ReturnType<typeof getTrainPosition> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!trainNumber.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      const train = getTrainPosition(trainNumber.trim());
      setSearchedTrain(train || null);
      setIsSearching(false);
    }, 500);
  };

  const clearSearch = () => {
    setTrainNumber('');
    setSearchedTrain(null);
  };

  const getScheduleForTrain = (trainNum: string) => {
    return state.schedules.find(s => s.trainNumber === trainNum);
  };

  const renderSearchHistory = () => (
    <View style={styles.historySection}>
      <Text style={styles.sectionTitle}>Recent Trains</Text>
      {state.liveTrains.map(train => {
        const schedule = getScheduleForTrain(train.trainNumber);
        return (
          <TouchableOpacity
            key={train.trainNumber}
            style={styles.historyItem}
            onPress={() => {
              setTrainNumber(train.trainNumber);
              setSearchedTrain(train);
            }}
          >
            <View style={styles.historyIcon}>
              <Text style={styles.historyIconText}>🚂</Text>
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTrainNumber}>{train.trainNumber}</Text>
              <Text style={styles.historyTrainName}>{schedule?.trainName || 'Unknown'}</Text>
            </View>
            <Text style={styles.historyArrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSearchResult = () => {
    if (isSearching) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Locating train...</Text>
        </View>
      );
    }

    if (!searchedTrain) {
      return (
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundIcon}>🔍</Text>
          <Text style={styles.notFoundText}>Train not found</Text>
          <Text style={styles.notFoundSubtext}>Try entering a valid train number</Text>
        </View>
      );
    }

    const schedule = getScheduleForTrain(searchedTrain.trainNumber);
    const nextStation = getStationByCode(schedule?.stops[1]?.stationCode || '');

    return (
      <View style={styles.resultContainer}>
        <View style={styles.trainHeader}>
          <Text style={styles.trainNumberLarge}>{searchedTrain.trainNumber}</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        
        <Text style={styles.trainNameLarge}>{schedule?.trainName || 'Unknown Train'}</Text>
        <Text style={styles.trainRoute}>
          {schedule?.origin} → {schedule?.destination}
        </Text>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={[styles.statusValue, { color: schedule?.status === 'delayed' ? Colors.error : Colors.success }]}>
              {schedule?.status === 'delayed' ? `Delayed by ${schedule.delayMinutes} min` : 'On Time'}
            </Text>
          </View>
        </View>

        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>📍 Current Location</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Speed</Text>
            <Text style={styles.locationValue}>{searchedTrain.speed} km/h</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Latitude</Text>
            <Text style={styles.locationValue}>{searchedTrain.latitude.toFixed(4)}</Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>Longitude</Text>
            <Text style={styles.locationValue}>{searchedTrain.longitude.toFixed(4)}</Text>
          </View>
        </View>

        <View style={styles.nextStationCard}>
          <Text style={styles.cardTitle}>🚉 Next Station</Text>
          <Text style={styles.nextStationName}>{searchedTrain.nextStation}</Text>
          <Text style={styles.etaText}>ETA: {searchedTrain.estimatedArrival}</Text>
        </View>

        <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
          <Text style={styles.clearButtonText}>Track Another Train</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Train</Text>
        <Text style={styles.subtitle}>Enter train number to see live location</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={trainNumber}
            onChangeText={setTrainNumber}
            placeholder="Enter train number (e.g., 12001)"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="number-pad"
            maxLength={5}
          />
          {trainNumber.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearInput}>
              <Text style={styles.clearInputText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Track</Text>
        </TouchableOpacity>
      </View>

      {searchedTrain !== null ? renderSearchResult() : renderSearchHistory()}
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  clearInput: {
    padding: Spacing.xs,
  },
  clearInputText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: Colors.textLight,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  historySection: {
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIconText: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  historyTrainNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  historyTrainName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  historyArrow: {
    fontSize: FontSize.xl,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  notFoundIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  notFoundText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  notFoundSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  resultContainer: {
    paddingHorizontal: Spacing.md,
  },
  trainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trainNumberLarge: {
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: Spacing.xs,
  },
  liveText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.success,
  },
  trainNameLarge: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  trainRoute: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  locationCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  locationLabel: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  locationValue: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  nextStationCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  nextStationName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  etaText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  clearButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.md,
  },
  clearButtonText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});