import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getLiveTrainStatus, formatDate, parseStationsFromAPI, getCurrentStation, getNextStation } from '../services/railwayAPI';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../utils/theme';

interface Station {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  platform: string;
  delay: number;
  isCurrent?: boolean;
  isPassed?: boolean;
}

export default function TrackTrainScreen() {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainData, setTrainData] = useState<any>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!trainNumber.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setTrainData(null);
    setStations([]);
    
    try {
      const today = formatDate(new Date());
      const result = await getLiveTrainStatus(trainNumber.trim(), today);
      
      if (result.success && result.data) {
        setTrainData(result.data);
        
        const parsedStations = parseStationsFromAPI(result);
        setStations(parsedStations);
      } else {
        setError(result.error?.toString() || 'Train not found. Please check the train number.');
      }
    } catch (err) {
      setError('Failed to fetch train data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setTrainNumber('');
    setTrainData(null);
    setStations([]);
    setError(null);
  };

  const currentStation = getCurrentStation(stations);
  const currentIndex = stations.findIndex(s => s.isCurrent);
  const nextStation = getNextStation(stations, currentIndex);

  const renderInitialState = () => (
    <View style={styles.initialContainer}>
      <View style={styles.initialIcon}>
        <Text style={styles.initialEmoji}>🚂</Text>
      </View>
      <Text style={styles.initialTitle}>Track Any Train</Text>
      <Text style={styles.initialText}>Enter any Indian train number to get real-time live status</Text>
      
      <View style={styles.sampleTrains}>
        <Text style={styles.sampleTitle}>Try these popular trains:</Text>
        {['12001', '12951', '12301', '12627', '12101'].map(num => (
          <TouchableOpacity 
            key={num} 
            style={styles.sampleChip}
            onPress={() => setTrainNumber(num)}
          >
            <Text style={styles.sampleChipText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>Fetching live status...</Text>
      <Text style={styles.loadingSubtext}>Connecting to Indian Railways</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={clearSearch}>
        <Text style={styles.backText}>Try Different Train</Text>
      </TouchableOpacity>
    </View>
  );

  const renderResult = () => {
    if (!trainData) return null;

    const progress = stations.length > 0 
      ? ((currentIndex + 0.5) / stations.length) * 100 
      : 0;

    return (
      <ScrollView style={styles.resultContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.trainHeaderCard}>
          <View style={styles.trainHeaderTop}>
            <View>
              <Text style={styles.trainNumberLarge}>{trainData.trainNo || trainNumber}</Text>
              <Text style={styles.trainNameLarge}>{trainData.trainName || 'Express'}</Text>
              {trainData.statusNote && (
                <Text style={styles.statusNote}>{trainData.statusNote}</Text>
              )}
            </View>
            <View style={styles.liveIndicatorBig}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          {currentStation && (
            <View style={styles.currentInfoCard}>
              <Text style={styles.currentLabel}>📍 Current Location</Text>
              <Text style={styles.currentStation}>{currentStation.stationName}</Text>
              {currentStation.platform && (
                <Text style={styles.currentPlatform}>Platform {currentStation.platform}</Text>
              )}
              {currentStation.delay > 0 && (
                <View style={styles.delayBadge}>
                  <Text style={styles.delayText}>+{currentStation.delay} min delay</Text>
                </View>
              )}
            </View>
          )}

          {nextStation && (
            <View style={styles.nextInfoCard}>
              <Text style={styles.nextLabel}>Next Station</Text>
              <Text style={styles.nextStation}>{nextStation.stationName}</Text>
              {nextStation.arrivalTime && (
                <Text style={styles.nextTime}>ETA: {nextStation.arrivalTime}</Text>
              )}
            </View>
          )}

          {trainData.lastUpdate && (
            <Text style={styles.lastUpdate}>Last updated: {trainData.lastUpdate}</Text>
          )}
        </View>

        {stations.length > 0 && (
          <View style={styles.journeySection}>
            <Text style={styles.journeyTitle}>🚆 Live Journey</Text>
            
            <View style={styles.timelineContainer}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${Math.min(progress, 95)}%` }]} />
                  <View style={[styles.trainIcon, { left: `${Math.min(progress, 95)}%` }]}>
                    <Text style={styles.trainIconEmoji}>🚂</Text>
                  </View>
                </View>
              </View>

              <View style={styles.stopsContainer}>
                {stations.map((stop, index) => {
                  const isPassed = stop.isPassed || index < currentIndex;
                  const isCurrent = stop.isCurrent;
                  const isPending = index > currentIndex;
                  
                  return (
                    <View key={index} style={[styles.stopRow, isCurrent && styles.stopRowActive]}>
                      <View style={styles.stopTimeColumn}>
                        <Text style={[styles.stopTime, isPassed && styles.stopTimeCompleted, isPending && styles.stopTimePending]}>
                          {stop.arrivalTime || '--:--'}
                        </Text>
                        {stop.delay > 0 && (
                          <Text style={styles.delayBadgeSmall}>+{stop.delay}m</Text>
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
                          <View style={[styles.stopDot, isPassed && styles.stopDotCompleted, isPending && styles.stopDotPending]} />
                        )}
                        {index < stations.length - 1 && (
                          <View style={[styles.stopLine, isPassed && styles.stopLineCompleted, isPending && styles.stopLinePending]} />
                        )}
                      </View>

                      <View style={[styles.stopInfoColumn, isCurrent && styles.stopInfoColumnActive]}>
                        <Text style={[styles.stopName, isCurrent && styles.stopNameActive, isPassed && styles.stopNamePassed, isPending && styles.stopNamePending]}>
                          {stop.stationName}
                        </Text>
                        <Text style={styles.stopCode}>{stop.stationCode}</Text>
                        {isCurrent && (
                          <View style={styles.currentStatusBadge}>
                            <Text style={styles.currentStatusText}>Current</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.platformColumn}>
                        {stop.platform && stop.platform !== '-' && (
                          <View style={[styles.platformBadge, isPassed && styles.platformBadgePassed, isPending && styles.platformBadgePending]}>
                            <Text style={[styles.platformLabel, isCurrent && styles.platformLabelActive]}>Plt</Text>
                            <Text style={[styles.platformNumber, isCurrent && styles.platformNumberActive]}>{stop.platform}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.trackAnotherButton} onPress={clearSearch}>
          <Text style={styles.trackAnotherText}>Track Another Train</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const renderContent = () => {
    if (isLoading) return renderLoading();
    if (error) return renderError();
    if (trainData) return renderResult();
    return renderInitialState();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Track Your Train</Text>
        <Text style={styles.subtitle}>Real-time Indian Railways live status</Text>
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
        <TouchableOpacity 
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]} 
          onPress={handleSearch}
          disabled={isLoading || !trainNumber.trim()}
        >
          <Text style={styles.searchButtonText}>{isLoading ? '...' : 'Track'}</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
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
    minWidth: 70,
  },
  searchButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  searchButtonText: {
    color: Colors.textLight,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
  initialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  initialIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  initialEmoji: {
    fontSize: 40,
  },
  initialTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  initialText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  sampleTrains: {
    alignItems: 'center',
  },
  sampleTitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  sampleChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sampleChipText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
  loadingText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  loadingSubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  retryText: {
    color: Colors.textLight,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  backButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backText: {
    color: Colors.primary,
    fontSize: FontSize.md,
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
  statusNote: {
    fontSize: FontSize.sm,
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
  currentInfoCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  currentLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  currentStation: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  currentPlatform: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: 4,
  },
  delayBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  delayText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    fontWeight: FontWeight.medium,
  },
  nextInfoCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nextLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  nextStation: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  nextTime: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lastUpdate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'right',
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
    minHeight: 56,
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
    justifyContent: 'center',
  },
  stopTime: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  stopTimeCompleted: {
    color: Colors.text,
  },
  stopTimePending: {
    color: Colors.textSecondary,
  },
  delayBadgeSmall: {
    fontSize: FontSize.xs,
    color: Colors.error,
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
  stopDotPending: {
    backgroundColor: Colors.border,
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
  stopLinePending: {
    backgroundColor: Colors.border,
  },
  stopInfoColumn: {
    flex: 1,
    paddingLeft: Spacing.sm,
    paddingVertical: Spacing.xs,
    justifyContent: 'center',
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
  stopNamePassed: {
    color: Colors.text,
  },
  stopNamePending: {
    color: Colors.textSecondary,
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
  platformColumn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  platformBadgePassed: {
    backgroundColor: Colors.success,
  },
  platformBadgePending: {
    backgroundColor: Colors.border,
  },
  platformLabel: {
    fontSize: 8,
    color: Colors.textLight,
  },
  platformLabelActive: {
    color: Colors.textLight,
  },
  platformNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textLight,
  },
  platformNumberActive: {
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