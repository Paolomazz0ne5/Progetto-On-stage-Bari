import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheater, THEATERS } from '../../components/TheaterContext';
import { GAMES } from '../../constants/games';

export default function MinigiochiScreen() {
  const { isTheaterLocked, completeMission } = useTheater();
  const params = useLocalSearchParams<{ theaterId?: string }>();
  const [activeTheater, setActiveTheater] = useState('petruzzelli');

  // If redirected from the map with a specific theater, select it
  useEffect(() => {
    if (params.theaterId) {
      setActiveTheater(params.theaterId);
    }
  }, [params.theaterId]);

  const theaters = THEATERS.map((t) => ({
    id: t.id,
    label: t.name,
    color: t.color,
    icon: 'business' as const, // More building-like icon for theater
    textColor: '#FFFFFF',
  }));

  // Filter games based on current active theater tab
  const activeTheaterGames = GAMES.filter((g) => g.theaterId === activeTheater);
  const isCurrentTheaterLocked = isTheaterLocked(activeTheater);
  const activeTheaterObj = THEATERS.find((t) => t.id === activeTheater);

  const handleGamePress = (game: typeof GAMES[0]) => {
    if (isCurrentTheaterLocked) {
      Alert.alert(
        'Teatro Bloccato 🔒',
        `Non sei abbastanza vicino a "${activeTheaterObj?.name || 'questo teatro'}". Torna alla mappa della Home e avvicinati ad esso (meno di 150m) per sbloccare e giocare!`
      );
    } else {
      if (game.id === 2) {
        router.push('/minigiochi/trovarobe' as any);
      } else if (game.id === 3) {
        router.push('/minigiochi/puzzle-margherita' as any);
      } else if (game.id === 4) {
        router.push('/minigiochi/reperti-e-intrusi' as any);
      } else if (game.id === 5) {
        router.push('/minigiochi/puzzle-kursaal' as any);
      } else if (game.id === 6) {
        router.push('/minigiochi/quiz-kursaal' as any);
      } else if (game.id === 7) {
        router.push('/minigiochi/timeline-piccinni' as any);
      } else if (game.id === 8) {
        router.push('/minigiochi/puzzle-piccinni' as any);
      } else if (game.id === 9) {
        router.push('/minigiochi/quiz-piccinni' as any);
      } else if (game.id === 10) {
        router.push('/minigiochi/reperti-e-intrusi-kursaal' as any);
      } else if (game.id === 11) {
        router.push('/minigiochi/timeline-kursaal' as any);
      } else if (game.id === 12) {
        router.push('/minigiochi/quiz-margherita' as any);
      } else {
        Alert.alert(
          'Minigioco Avviato! 🎮',
          `Stai avviando "${game.title}". Divertiti!`,
          [
            { text: 'Annulla', style: 'cancel' },
            { 
              text: 'Vinci! (+20 XP)', 
              onPress: () => {
                completeMission(game.id);
                Alert.alert('Vittoria! 🏆', `Hai completato il minigioco e guadagnato 20 XP! La tua barra dell'esperienza è salita.`);
              }
            }
          ]
        );
      }
    }
  };

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
                isLocked={isTheaterLocked(t.id)}
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
                isLocked={isTheaterLocked(t.id)}
                onPress={() => setActiveTheater(t.id)}
              />
            ))}
          </View>
        </View>

        {isCurrentTheaterLocked && (
          <View style={styles.lockedBanner}>
            <Ionicons name="lock-closed" size={24} color="#E53935" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockedBannerTitle}>Teatro Bloccato</Text>
              <Text style={styles.lockedBannerText}>
                Devi essere vicino a questo teatro nella realtà (o usare la simulazione nella mappa) per giocare ai suoi minigiochi.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.gamesList}>
          {activeTheaterGames.map((game) => (
            <Pressable
              key={game.id}
              style={[
                styles.cardContainer,
                isCurrentTheaterLocked && styles.lockedCardContainer
              ]}
              onPress={() => handleGamePress(game)}
            >
              <View style={[
                styles.iconSquare, 
                { backgroundColor: isCurrentTheaterLocked ? '#B0BEC5' : game.iconBg }
              ]}>
                <Ionicons 
                  name={isCurrentTheaterLocked ? 'lock-closed' : game.icon} 
                  size={36} 
                  color="#FFFFFF" 
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={[
                  styles.cardTitle,
                  isCurrentTheaterLocked && styles.lockedCardText
                ]}>
                  {game.title}
                </Text>
                <Text style={styles.cardDescription}>{game.description}</Text>
                <View style={[
                  styles.badge,
                  { backgroundColor: isCurrentTheaterLocked ? '#B0BEC5' : game.iconBg }
                ]}>
                  <Text style={styles.badgeText}>{game.theaterLabel}</Text>
                </View>
              </View>
              <Ionicons 
                name={isCurrentTheaterLocked ? "lock-closed" : "chevron-forward"} 
                size={24} 
                color={isCurrentTheaterLocked ? "#78909C" : "#FF6B6B"} 
                style={styles.cardChevron} 
              />
            </Pressable>
          ))}

          {activeTheaterGames.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="game-controller-outline" size={48} color="#B0BEC5" />
              <Text style={styles.emptyText}>Nessun minigioco disponibile per questo teatro.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterButton({ label, color, icon, textColor, isActive, isLocked, onPress }: any) {
  const displayColor = isLocked ? '#CFD8DC' : color;
  const displayTextColor = isLocked ? '#78909C' : textColor;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterButton,
        { backgroundColor: displayColor },
        isActive && styles.filterButtonActive,
        isLocked && styles.filterButtonLocked
      ]}
    >
      <View style={styles.filterIconWrapper}>
        <Ionicons name={icon} size={30} color={displayTextColor} />
        {isLocked && (
          <View style={styles.lockBadgeMini}>
            <Ionicons name="lock-closed" size={10} color="#FFFFFF" />
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.filterButtonText, { color: displayTextColor }]}>
        {label.replace('Teatro ', '')}
      </Text>
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
    marginBottom: 24,
    gap: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  filterButton: {
    flex: 1,
    aspectRatio: 1.6,
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
  filterButtonLocked: {
    borderColor: '#78909C',
    borderBottomWidth: 4,
  },
  filterIconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    aspectRatio: 1,
  },
  lockBadgeMini: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E53935',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterButtonText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lockedBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderWidth: 1.5,
    borderColor: '#FFCDD2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  lockedBannerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#C62828',
    marginBottom: 4,
  },
  lockedBannerText: {
    fontSize: 12,
    color: '#D32F2F',
    lineHeight: 18,
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
  lockedCardContainer: {
    borderColor: '#90A4AE',
    backgroundColor: '#ECEFF1',
    opacity: 0.8,
  },
  iconSquare: {
    width: '22%',
    aspectRatio: 1,
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
    fontSize: 17,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 4,
  },
  lockedCardText: {
    color: '#546E7A',
  },
  cardDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 18,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333333',
    borderBottomWidth: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardChevron: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: '#78909C',
    fontSize: 14,
    textAlign: 'center',
  },
});

