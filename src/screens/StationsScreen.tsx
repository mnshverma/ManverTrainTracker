import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrain } from '../context/TrainContext';
import { StationCard, SearchInput } from '../components';
import { Colors, Spacing, FontSize, FontWeight } from '../utils/theme';

export default function StationsScreen() {
  const { state, dispatch } = useTrain();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const displayedStations = searchQuery
    ? state.stations.filter(
        (station) =>
          station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          station.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : state.stations;

  const onRefresh = () => {
    setRefreshing(true);
    dispatch({ type: 'REFRESH_DATA' });
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏢</Text>
      <Text style={styles.emptyText}>No stations found</Text>
      <Text style={styles.emptySubtext}>Try a different search term</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Stations</Text>
        <Text style={styles.subtitle}>Station information and amenities</Text>
      </View>

      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by station name or code..."
        onClear={() => setSearchQuery('')}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'All Stations'} ({displayedStations.length})
        </Text>
      </View>

      <FlatList
        data={displayedStations}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => (
          <StationCard station={item} onPress={() => {}} />
        )}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
