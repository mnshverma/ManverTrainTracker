import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Station } from '../types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../utils/theme';

interface StationCardProps {
  station: Station;
  onPress: () => void;
}

export default function StationCard({ station, onPress }: StationCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.stationCode}>{station.code}</Text>
        <Text style={styles.platforms}>{station.platforms} platforms</Text>
      </View>

      <Text style={styles.stationName}>{station.name}</Text>

      <View style={styles.amenitiesContainer}>
        {station.amenities.slice(0, 4).map((amenity, index) => (
          <View key={index} style={styles.amenityBadge}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
        {station.amenities.length > 4 && (
          <Text style={styles.moreAmenities}>+{station.amenities.length - 4}</Text>
        )}
      </View>

      <Text style={styles.address} numberOfLines={1}>
        {station.address}
      </Text>
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
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stationCode: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  platforms: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  stationName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  amenityBadge: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  amenityText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  moreAmenities: {
    fontSize: FontSize.xs,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },
  address: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});
