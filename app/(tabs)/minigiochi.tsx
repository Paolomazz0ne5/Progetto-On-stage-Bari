import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MinigiochiScreen() {
  const [activeTheater, setActiveTheater] = useState('Petruzzelli');

  const theaters = [
    { id: 'Petruzzelli', label: 'Teatro Petruzzelli', color: '#FF6B6B', icon: 'home', textColor: '#FFFFFF' },
    { id: 'Margherita', label: 'Teatro Margherita', color: '#4ECDC4', icon: 'home', textColor: '#333333' },
    { id: 'Piccinni', label: 'Teatro Piccinni', color: '#C7CEEA', icon: 'home', textColor: '#333333' },
    { id: 'Santa Lucia', label: 'Teatro Santa Lucia', color: '#B5EAD7', icon: 'home', textColor: '#333333' },
  ];

  const games = [
    {
      id: 1,
      title: 'Occhio del Restauratore',
      description: "Trova le differenze tra le opere d'arte",
      theater: 'Teatro Petruzzelli',
      icon: 'color-palette',
      iconBg: '#FF6B6B',
    },
    {
      id: 2,
      title: 'Trovarobe',
      description: 'Cerca gli oggetti nascosti nel teatro',
      theater: 'Teatro Petruzzelli',
      icon: 'search',
      iconBg: '#4ECDC4',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>MINIGIOCHI</Text>

        <View style={styles.filtersGrid}>
          <View style={styles.filtersRow}>
            {theaters.slice(0, 2).map((t) => (
              <FilterButton
                key={t.id}
                {...t}
                isActive={activeTheater === t.id}
                onPress={() => setActiveTheater(t.id)}
              />
            ))}
          </View>
          <View style={styles.filtersRow}>
            {theaters.slice(2, 4).map((t) => (
              <FilterButton
                key={t.id}
                {...t}
                isActive={activeTheater === t.id}
                onPress={() => setActiveTheater(t.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.gamesList}>
          {games.map((game) => (
            <Pressable key={game.id} style={styles.cardContainer}>
              <View style={[styles.iconSquare, { backgroundColor: game.iconBg }]}>
                <Ionicons name={game.icon as any} size={36} color="#FFFFFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardDescription}>{game.description}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{game.theater}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={28} color="#FF6B6B" style={styles.cardChevron} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterButton({ label, color, icon, textColor, isActive, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterButton,
        { backgroundColor: color },
        isActive && styles.filterButtonActive
      ]}
    >
      <Ionicons name={icon} size={36} color={textColor} />
      <Text style={[styles.filterButtonText, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 24,
  },
  filtersGrid: {
    marginBottom: 32,
    gap: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  filterButton: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  filterButtonActive: {
    borderBottomWidth: 2,
    transform: [{ translateY: 4 }],
  },
  filterButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gamesList: {
    gap: 20,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 16,
    alignItems: 'center',
  },
  iconSquare: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
  },
  cardContent: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 20,
  },
  badge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333333',
    borderBottomWidth: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardChevron: {
    marginLeft: 8,
  },
});
