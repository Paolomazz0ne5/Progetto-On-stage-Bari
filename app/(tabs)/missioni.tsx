import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheater, THEATERS, Theater } from '../../components/TheaterContext';

interface MissionItem {
  id: string;
  title: string;
  description: string;
  theaterId?: string;
  type: 'esplorazione' | 'giornaliere';
  rewardExp: number;
  distanceText?: string;
  progressText?: string;
  status: 'daSbloccare' | 'inCorso' | 'completate';
  color?: string;
}

export default function MissioniScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unlockedTheaterIds, getDistanceToTheater, level, currentXP, xpForNextLevel } = useTheater();

  const [activeTab, setActiveTab] = useState<'esplorazione' | 'giornaliere'>('esplorazione');
  const [activeSubFilter, setActiveSubFilter] = useState<'tutte' | 'daSbloccare' | 'inCorso' | 'completate'>('tutte');

  // Compute dynamic distance & status for exploration missions
  const getExplorationMissions = (): MissionItem[] => {
    const list: MissionItem[] = [];

    THEATERS.forEach((t) => {
      const isUnlocked = unlockedTheaterIds.includes(t.id);
      const rawDistance = getDistanceToTheater(t);
      const distanceText =
        rawDistance !== null
          ? rawDistance < 1000
            ? `${rawDistance.toFixed(0)} m`
            : `${(rawDistance / 1000).toFixed(1)} km`
          : '0.5 km'; // Mock fallback if location not loaded yet

      // 1. Esplora
      list.push({
        id: `esplora_${t.id}`,
        title: `Esplora il ${t.name}`,
        description: `Raggiungi il ${t.name} per iniziare l'avventura`,
        theaterId: t.id,
        color: t.color,
        type: 'esplorazione',
        rewardExp: 250,
        distanceText,
        status: isUnlocked ? 'completate' : 'inCorso',
      });

      // 2. Minigiochi
      list.push({
        id: `minigiochi_${t.id}`,
        title: `Minigiochi ${t.name.replace('Teatro ', '')}`,
        description: `Gioca a tutti i minigiochi del ${t.name}`,
        theaterId: t.id,
        color: t.color,
        type: 'esplorazione',
        rewardExp: 400,
        distanceText,
        progressText: isUnlocked ? '1/4' : '0/4', // Simple dynamic mock indicator
        status: isUnlocked ? 'inCorso' : 'daSbloccare',
      });

      // 3. Esperto
      list.push({
        id: `esperto_${t.id}`,
        title: `Esperto ${t.name.replace('Teatro ', '')}`,
        description: `Completa tutte le attività del ${t.name}`,
        theaterId: t.id,
        color: t.color,
        type: 'esplorazione',
        rewardExp: 500,
        distanceText,
        progressText: isUnlocked ? '2/8' : '0/8',
        status: isUnlocked ? 'inCorso' : 'daSbloccare',
      });
    });

    return list;
  };

  // Compute dynamic progress for daily missions
  const getDailyMissions = (): MissionItem[] => {
    const unlockedCount = unlockedTheaterIds.length;
    
    return [
      {
        id: 'daily_1',
        title: 'Passeggiata Culturale',
        description: 'Esplora almeno un teatro storico oggi.',
        type: 'giornaliere',
        rewardExp: 150,
        progressText: `${unlockedCount >= 1 ? 1 : 0}/1`,
        status: unlockedCount >= 1 ? 'completate' : 'inCorso',
      },
      {
        id: 'daily_2',
        title: 'Appassionato Barese',
        description: 'Gioca a 2 minigiochi qualsiasi.',
        type: 'giornaliere',
        rewardExp: 200,
        progressText: unlockedCount >= 1 ? '1/2' : '0/2',
        status: 'inCorso',
      },
      {
        id: 'daily_3',
        title: 'Super Spettatore',
        description: 'Sblocca tutti i teatri nella mappa.',
        type: 'giornaliere',
        rewardExp: 500,
        progressText: `${unlockedCount}/4`,
        status: unlockedCount === 4 ? 'completate' : 'inCorso',
      },
    ];
  };

  const allMissions = activeTab === 'esplorazione' ? getExplorationMissions() : getDailyMissions();

  // Filter based on sub-filters
  const filteredMissions = allMissions.filter((mission) => {
    if (activeSubFilter === 'tutte') return true;
    return mission.status === activeSubFilter;
  });

  // Handle card click
  const handleMissionPress = (item: MissionItem) => {
    if (item.type === 'esplorazione' && item.theaterId) {
      if (item.status === 'daSbloccare') {
        // Redirige alla home centrando la mappa sul teatro per sbloccarlo
        router.push({
          pathname: '/',
          params: { highlightTheaterId: item.theaterId },
        });
      } else if (item.status === 'inCorso' && item.id.startsWith('esplora_')) {
        // Se è l'esplorazione principale in corso, redirige alla mappa per sbloccarlo
        router.push({
          pathname: '/',
          params: { highlightTheaterId: item.theaterId },
        });
      } else {
        // Se è sbloccato (minigiochi o esperto), porta alla tab minigiochi
        router.push({
          pathname: '/minigiochi',
          params: { theaterId: item.theaterId },
        });
      }
    }
  };

  // Custom mini theater building representation
  const TheaterCardIcon = ({ color, isLocked }: { color: string; isLocked: boolean }) => {
    const displayColor = isLocked ? '#90A4AE' : color;
    const roofColor = isLocked ? '#78909C' : '#FF7043';
    const baseColor = isLocked ? '#CFD8DC' : '#FFE0B2';
    const doorColor = isLocked ? '#90A4AE' : '#FFB74D';

    return (
      <View style={[styles.cardIconBox, isLocked && styles.lockedCardIconBox]}>
        <View style={styles.iconTheaterContainer}>
          {/* Roof */}
          <View style={[styles.iconRoof, { borderBottomColor: roofColor }]} />
          {/* Base */}
          <View style={[styles.iconBase, { backgroundColor: baseColor }]}>
            <View style={styles.iconColumns}>
              <View style={[styles.iconColumn, { backgroundColor: displayColor }]} />
              <View style={[styles.iconColumn, { backgroundColor: displayColor }]} />
            </View>
            <View style={[styles.iconDoor, { backgroundColor: doorColor }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.userInfoRow}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <FontAwesome5 name="user-alt" size={24} color="#FF7043" />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>Mario Rossi</Text>
              <Text style={styles.userLevel}>Livello {level}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.medalButton}
            onPress={() => router.push('/modal')}
          >
            <View style={styles.medalCircle}>
              <FontAwesome5 name="medal" size={20} color="#FFC107" />
              {unlockedTheaterIds.length > 0 && <View style={styles.notificationDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.expSection}>
          <View style={styles.expLabels}>
            <Text style={styles.expText}>EXP</Text>
            <Text style={styles.expValue}>{currentXP} / {xpForNextLevel}</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min((currentXP / xpForNextLevel) * 100, 100)}%` }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>LE TUE MISSIONI</Text>

        {/* Tab Selectors */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'esplorazione' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('esplorazione');
              setActiveSubFilter('tutte');
            }}
          >
            <Ionicons
              name="map"
              size={18}
              color={activeTab === 'esplorazione' ? '#FFFFFF' : '#333333'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'esplorazione' && styles.tabButtonTextActive]}>
              ESPLORAZIONE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'giornaliere' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('giornaliere');
              setActiveSubFilter('tutte');
            }}
          >
            <Ionicons
              name="flash"
              size={18}
              color={activeTab === 'giornaliere' ? '#FFFFFF' : '#333333'}
              style={{ marginRight: 6 }}
            />
            <Text style={[styles.tabButtonText, activeTab === 'giornaliere' && styles.tabButtonTextActive]}>
              GIORNALIERE
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub filters only for exploration, or available for both */}
        <View style={{ marginBottom: 4 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subFiltersRow}>
            <TouchableOpacity
              style={[styles.subFilterButton, activeSubFilter === 'tutte' && styles.subFilterButtonActive]}
              onPress={() => setActiveSubFilter('tutte')}
            >
              <Text style={[styles.subFilterText, activeSubFilter === 'tutte' && styles.subFilterTextActive]}>
                Tutte
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subFilterButton, activeSubFilter === 'daSbloccare' && styles.subFilterButtonActive]}
              onPress={() => setActiveSubFilter('daSbloccare')}
            >
              <FontAwesome5 name="lock" size={10} color={activeSubFilter === 'daSbloccare' ? '#FFF' : '#333'} style={{ marginRight: 4 }} />
              <Text style={[styles.subFilterText, activeSubFilter === 'daSbloccare' && styles.subFilterTextActive]}>
                Da Sbloccare
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subFilterButton, activeSubFilter === 'inCorso' && styles.subFilterButtonActive]}
              onPress={() => setActiveSubFilter('inCorso')}
            >
              <FontAwesome5 name="clock" size={10} color={activeSubFilter === 'inCorso' ? '#FFF' : '#333'} style={{ marginRight: 4 }} />
              <Text style={[styles.subFilterText, activeSubFilter === 'inCorso' && styles.subFilterTextActive]}>
                In Corso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.subFilterButton, activeSubFilter === 'completate' && styles.subFilterButtonActive]}
              onPress={() => setActiveSubFilter('completate')}
            >
              <FontAwesome5 name="check" size={10} color={activeSubFilter === 'completate' ? '#FFF' : '#333'} style={{ marginRight: 4 }} />
              <Text style={[styles.subFilterText, activeSubFilter === 'completate' && styles.subFilterTextActive]}>
                Completate
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Scrollbar Tracker Deco */}
        <View style={styles.scrollbarContainer}>
          <View style={styles.scrollbarArrow}>
            <FontAwesome5 name="caret-left" size={14} color="#333333" />
          </View>
          <View style={styles.scrollbarTrack}>
            <View style={[
              styles.scrollbarThumb, 
              activeSubFilter === 'tutte' && { left: '5%', width: '25%' },
              activeSubFilter === 'daSbloccare' && { left: '30%', width: '25%' },
              activeSubFilter === 'inCorso' && { left: '55%', width: '25%' },
              activeSubFilter === 'completate' && { left: '80%', width: '15%' },
            ]} />
          </View>
          <View style={styles.scrollbarArrow}>
            <FontAwesome5 name="caret-right" size={14} color="#333333" />
          </View>
        </View>

        {/* Missions List */}
        <View style={styles.missionsList}>
          {filteredMissions.map((item) => {
            const isLocked = item.status === 'daSbloccare';
            const isCompleted = item.status === 'completate';

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.missionCard, isLocked && styles.lockedMissionCard]}
                onPress={() => handleMissionPress(item)}
                disabled={activeTab === 'giornaliere'}
              >
                {/* Left Side: Custom Theatre Icon / Daily Lightning */}
                {item.type === 'esplorazione' ? (
                  <TheaterCardIcon color={item.color || '#FF7043'} isLocked={isLocked} />
                ) : (
                  <View style={[styles.cardIconBox, isCompleted && styles.completedDailyIconBox]}>
                    <Ionicons
                      name={isCompleted ? 'checkmark-circle' : 'flash'}
                      size={28}
                      color={isCompleted ? '#4CAF50' : '#FFC107'}
                    />
                  </View>
                )}

                {/* Center Side: Title and Sub-details */}
                <View style={styles.cardContent}>
                  <Text numberOfLines={1} style={[styles.cardTitle, isLocked && styles.lockedCardText]}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardDescription}>{item.description}</Text>

                  {/* Badges/Tags Row */}
                  <View style={styles.tagsRow}>
                    {item.distanceText && (
                      <View style={styles.tag}>
                        <Ionicons name="location" size={12} color="#FF7043" style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{item.distanceText}</Text>
                      </View>
                    )}

                    {item.progressText && (
                      <View style={styles.tag}>
                        <Ionicons name="time" size={12} color="#FF9800" style={{ marginRight: 4 }} />
                        <Text style={styles.tagText}>{item.progressText}</Text>
                      </View>
                    )}

                    <View style={styles.tag}>
                      <FontAwesome5 name="award" size={12} color="#FFD54F" style={{ marginRight: 4 }} />
                      <Text style={[styles.tagText, { color: '#FF7043', fontWeight: 'bold' }]}>
                        {item.rewardExp} EXP
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Right Side: Status Badge & Navigation Arrow */}
                <View style={styles.cardRight}>
                  <View style={[
                    styles.statusBadgeCircle,
                    isCompleted && styles.completedBadgeCircle,
                    isLocked && styles.lockedBadgeCircle
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    ) : isLocked ? (
                      <Ionicons name="lock-closed" size={16} color="#90A4AE" />
                    ) : (
                      <Ionicons name="time" size={16} color="#FF9800" />
                    )}
                  </View>
                  {item.type === 'esplorazione' && (
                    <Ionicons name="chevron-forward" size={18} color={isLocked ? '#B0BEC5' : '#FF7043'} style={{ marginTop: 4 }} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredMissions.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="target-account" size={54} color="#B0BEC5" />
              <Text style={styles.emptyText}>Nessuna missione in questa categoria.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    zIndex: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF7043',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userLevel: {
    fontSize: 14,
    color: '#FF7043',
    fontWeight: '600',
  },
  medalButton: {
    padding: 2,
  },
  medalCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    borderWidth: 1,
    borderColor: 'white',
  },
  expSection: {
    marginTop: 5,
  },
  expLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  expText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  expValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressBarBackground: {
    height: 18,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333333',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 8,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FF7043',
    borderColor: '#333333',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  subFiltersRow: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  subFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subFilterButtonActive: {
    backgroundColor: '#333333',
  },
  subFilterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  subFilterTextActive: {
    color: '#FFFFFF',
  },
  scrollbarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 10,
    height: 24,
    marginVertical: 16,
    paddingHorizontal: 6,
  },
  scrollbarArrow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollbarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#ECEFF1',
    borderRadius: 3,
    marginHorizontal: 10,
    position: 'relative',
  },
  scrollbarThumb: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#90A4AE',
    borderRadius: 3,
  },
  missionsList: {
    gap: 16,
  },
  missionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 16,
    alignItems: 'center',
  },
  lockedMissionCard: {
    borderColor: '#90A4AE',
    backgroundColor: '#ECEFF1',
    opacity: 0.85,
  },
  cardIconBox: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedCardIconBox: {
    borderColor: '#78909C',
    backgroundColor: '#ECEFF1',
  },
  completedDailyIconBox: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  iconTheaterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRoof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 16,
    borderRightWidth: 16,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  iconBase: {
    width: 28,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#333333',
    position: 'relative',
    marginTop: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconColumns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    position: 'absolute',
    top: 2,
    bottom: 2,
  },
  iconColumn: {
    width: 2,
    height: '100%',
  },
  iconDoor: {
    width: 6,
    height: 8,
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardContent: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 4,
  },
  lockedCardText: {
    color: '#546E7A',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10,
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  statusBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadgeCircle: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  lockedBadgeCircle: {
    borderColor: '#90A4AE',
    backgroundColor: '#ECEFF1',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyText: {
    color: '#90A4AE',
    fontSize: 14,
    textAlign: 'center',
  },
});
