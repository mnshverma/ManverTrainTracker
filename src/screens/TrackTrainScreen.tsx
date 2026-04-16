import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrain } from '../context/TrainContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';

interface Stop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
  delay: number;
}

interface Schedule {
  stops: Stop[];
}

export default function TrackTrainScreen() {
  const { state, getTrainPosition } = useTrain();
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

  const getScheduleForTrain = (trainNum: string): Schedule | undefined => {
    return state.schedules.find(s => s.trainNumber === trainNum);
  };

  const calculateProgress = (trainNum: string) => {
    const schedule = getScheduleForTrain(trainNum);
    if (!schedule || !searchedTrain) return 0;

    const currentLat = searchedTrain.latitude;
    const stops = schedule.stops;
    
    if (stops.length < 2) return 0;
    
    const firstStop = state.stations.find(s => s.code === stops[0].stationCode);
    const lastStop = state.stations.find(s => s.code === stops[stops.length - 1].stationCode);
    
    if (!firstStop || !lastStop) return 0;
    
    const totalLatDiff = Math.abs(lastStop.location.latitude - firstStop.location.latitude);
    const totalLonDiff = Math.abs(lastStop.location.longitude - firstStop.location.longitude);
    const totalDist = Math.sqrt(totalLatDiff ** 2 + totalLonDiff ** 2);
    
    const currLatDiff = Math.abs(currentLat - firstStop.location.latitude);
    const currLonDiff = Math.abs(searchedTrain.longitude - firstStop.location.longitude);
    const currDist = Math.sqrt(currLatDiff ** 2 + currLonDiff ** 2);
    
    return Math.min(100, Math.max(0, (currDist / totalDist) * 100));
  };

  const getCurrentStopIndex = (trainNum: string): number => {
    const schedule = getScheduleForTrain(trainNum);
    if (!schedule || !searchedTrain) return 0;
    
    const currentLat = searchedTrain.latitude;
    const stops = schedule.stops;
    
    for (let i = 0; i < stops.length - 1; i++) {
      const station1 = state.stations.find(s => s.code === stops[i].stationCode);
      const station2 = state.stations.find(s => s.code === stops[i + 1].stationCode);
      
      if (station1 && station2) {
        const lat1 = station1.location.latitude;
        const lat2 = station2.location.latitude;
        
        if (currentLat >= lat1 && currentLat <= lat2) {
          return i;
        }
      }
    }
    return stops.length - 1;
  };

  const progress = searchedTrain ? calculateProgress(searchedTrain.trainNumber) : 0;
  const currentStopIndex = searchedTrain ? getCurrentStopIndex(searchedTrain.trainNumber) : 0;
  const schedule = searchedTrain ? getScheduleForTrain(searchedTrain.trainNumber) : null;

  const renderSearchHistory = () => (
    <View style={styles.historySection}>
      <Text style={styles.sectionTitle}>Active Trains</Text>
      <Text style={styles.sectionSubtitle}>Tap to track live location</Text>
      {state.liveTrains.map(train => {
        const sched = getScheduleForTrain(train.trainNumber);
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
              <Text style={styles.historyTrainName}>{sched?.trainName || 'Unknown'}</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDotSmall} />
              <Text style={styles.liveTextSmall}>LIVE</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderJourneyTimeline = () => {
    if (!schedule || !searchedTrain) return null;

    const stops = schedule.stops;

    return (
      <View style={styles.timelineContainer}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            <View style={[styles.trainIcon, { left: `${progress}%` }]}>
              <Text style={styles.trainIconEmoji}>🚂</Text>
            </View>
          </View>
        </View>

        <View style={styles.stopsContainer}>
          {stops.map((stop, index) => {
            const isCompleted = index < currentStopIndex;
            const isCurrent = index === currentStopIndex;
            const isPending = index > currentStopIndex;
            
            return (
              <View key={index} style={[styles.stopRow, isCurrent && styles.stopRowActive]}>
                <View style={styles.stopTimeColumn}>
                  <Text style={[styles.stopTime, isCompleted && styles.stopTimeCompleted]}>
                    {stop.arrivalTime}
                  </Text>
                  {stop.delay > 0 && (
                    <Text style={styles.delayBadge}>+{stop.delay}m</Text>
                  )}
                </View>

                <View style={styles.stopMarkerColumn}>
                  {isCurrent ? (
                    <View style={styles.currentStopMarker}>
                      <View style={styles.trainMarker}>
                        <Text style={styles.trainMarkerText}>🚂</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.stopDot, isCompleted && styles.stopDotCompleted]} />
                  )}
                  {index < stops.length - 1 && (
                    <View style={[styles.stopLine, isCompleted && styles.stopLineCompleted]} />
                  )}
                </View>

                <View style={[styles.stopInfoColumn, isCurrent && styles.stopInfoColumnActive]}>
                  <Text style={[styles.stopName, isCurrent && styles.stopNameActive]}>
                    {stop.stationName}
                  </Text>
                  <Text style={styles.stopCode}>{stop.stationCode}</Text>
                  {isCurrent && (
                    <View style={styles.currentStatusBadge}>
                      <Text style={styles.currentStatusText}>Current Location</Text>
                    </View>
                  )}
                  {isCompleted && (
                    <Text style={styles.passedText}>Passed</Text>
                  )}
                </View>

                <View style={styles.platformColumn}>
                  {isCurrent && (
                    <View style={styles.platformBadge}>
                      <Text style={styles.platformLabel}>Plt</Text>
                      <Text style={styles.platformNumber}>{stop.platform}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

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

    const sched = getScheduleForTrain(searchedTrain.trainNumber);

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.trainHeaderCard}>
          <View style={styles.trainHeaderTop}>
            <View>
              <Text style={styles.trainNumberLarge}>{searchedTrain.trainNumber}</Text>
              <Text style={styles.trainNameLarge}>{sched?.trainName || 'Unknown Train'}</Text>
              <Text style={styles.trainRoute}>{sched?.origin} → {sched?.destination}</Text>
            </View>
            <View style={styles.liveIndicatorBig}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{searchedTrain.speed}</Text>
              <Text style={styles.statLabel}>km/h</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{searchedTrain.nextStation}</Text>
              <Text style={styles.statLabel}>Next Station</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{searchedTrain.estimatedArrival}</Text>
              <Text style={styles.statLabel}>ETA</Text>
            </View>
          </View>

          {sched?.status === 'delayed' && (
            <View style={styles.delayCard}>
              <Text style={styles.delayIcon}>⚠️</Text>
              <Text style={styles.delayText}>Delayed by {sched.delayMinutes} minutes</Text>
            </View>
          )}
        </View>

        <View style={styles.journeySection}>
          <Text style={styles.journeyTitle}>🚆 Journey Progress</Text>
          {renderJourneyTimeline()}
        </View>

        <TouchableOpacity style={styles.trackAnotherButton} onPress={clearSearch}>
          <Text style={styles.trackAnotherText}>Track Another Train</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Train</Text>
        <Text style={styles.subtitle}>Enter train number for live location</Text>
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
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyIconText: {
    fontSize: 22,
  },
  historyInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  historyTrainNumber: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  historyTrainName: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 4,
  },
  liveTextSmall: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.success,
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
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  trainHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trainHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trainNumberLarge: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  trainNameLarge: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  trainRoute: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  liveIndicatorBig: {
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
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.sm,
  },
  delayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  delayIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  delayText: {
    fontSize: FontSize.md,
    color: Colors.warning,
    fontWeight: FontWeight.medium,
  },
  journeySection: {
    marginBottom: Spacing.lg,
  },
  journeyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  timelineContainer: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  progressBarContainer: {
    height: 40,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginTop: 16,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  trainIcon: {
    position: 'absolute',
    top: -12,
    marginLeft: -12,
  },
  trainIconEmoji: {
    fontSize: 24,
  },
  stopsContainer: {
    marginTop: Spacing.sm,
  },
  stopRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  stopRowActive: {
    backgroundColor: Colors.primaryLight,
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  stopTimeColumn: {
    width: 55,
    alignItems: 'flex-end',
    paddingRight: Spacing.sm,
  },
  stopTime: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  stopTimeCompleted: {
    color: Colors.text,
  },
  delayBadge: {
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 2,
  },
  stopMarkerColumn: {
    width: 30,
    alignItems: 'center',
  },
  currentStopMarker: {
    alignItems: 'center',
  },
  trainMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trainMarkerText: {
    fontSize: 14,
  },
  stopDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  stopDotCompleted: {
    backgroundColor: Colors.success,
  },
  stopLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
    marginBottom: -4,
  },
  stopLineCompleted: {
    backgroundColor: Colors.success,
  },
  stopInfoColumn: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  stopInfoColumnActive: {
    paddingLeft: Spacing.md,
  },
  stopName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  stopNameActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.lg,
  },
  stopCode: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  currentStatusBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  currentStatusText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  passedText: {
    fontSize: FontSize.xs,
    color: Colors.success,
    marginTop: 4,
  },
  platformColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  platformLabel: {
    fontSize: 8,
    color: Colors.textLight,
  },
  platformNumber: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
  },
  trackAnotherButton: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  trackAnotherText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
});