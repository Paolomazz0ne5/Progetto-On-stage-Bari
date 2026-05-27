import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheater, THEATERS } from '../../components/TheaterContext';
import { THEATER_HISTORY_DATA } from '../../constants/TheaterHistory';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StoriaScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedTheaterIds } = useTheater();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <FontAwesome5 name="scroll" size={28} color="#FF7043" />
        <Text style={styles.headerTitle}>Storia dei Teatri</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Sblocca i teatri esplorando la città per scoprire la loro storia!
        </Text>

        {THEATERS.map((theater) => {
          const isUnlocked = unlockedTheaterIds.includes(theater.id);
          const history = THEATER_HISTORY_DATA[theater.id];
          const isExpanded = expandedId === theater.id;

          return (
            <TouchableOpacity 
              key={theater.id} 
              style={[styles.card, !isUnlocked && styles.cardLocked]}
              onPress={() => {
                if (isUnlocked) toggleExpand(theater.id);
              }}
              activeOpacity={isUnlocked ? 0.7 : 1}
            >
              <View style={styles.cardHeader}>
                <Image 
                  source={theater.logo} 
                  style={[styles.theaterLogo, !isUnlocked && styles.lockedLogo]} 
                  contentFit="cover"
                />
                <View style={styles.cardTitleContainer}>
                  <Text style={[styles.cardTitle, !isUnlocked && styles.lockedText]}>
                    {theater.name}
                  </Text>
                  {!isUnlocked ? (
                    <Text style={styles.lockedSubtitle}>Teatro Bloccato</Text>
                  ) : (
                    <Text style={styles.unlockedSubtitle}>Tocca per {isExpanded ? 'chiudere' : 'leggere'}</Text>
                  )}
                </View>
                <View style={styles.iconContainer}>
                  {isUnlocked ? (
                    <FontAwesome5 name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#FF7043" />
                  ) : (
                    <FontAwesome5 name="lock" size={20} color="#78909C" />
                  )}
                </View>
              </View>

              {isUnlocked && isExpanded && history && (
                <View style={styles.historyContent}>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>📍 Dove:</Text>
                    <Text style={styles.sectionValue}>{history.where}</Text>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>🗓️ Quando:</Text>
                    <Text style={styles.sectionValue}>{history.when}</Text>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>🏛️ Stile:</Text>
                    <Text style={styles.sectionValue}>{history.style}</Text>
                  </View>
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionLabel}>💡 Fun Fact:</Text>
                    <Text style={styles.sectionValue}>{history.funFact}</Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333333',
    marginLeft: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#546E7A',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  cardLocked: {
    backgroundColor: '#ECEFF1',
    borderColor: '#B0BEC5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  theaterLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FF7043',
  },
  lockedLogo: {
    opacity: 0.4,
    borderColor: '#90A4AE',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  lockedText: {
    color: '#78909C',
  },
  unlockedSubtitle: {
    fontSize: 13,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  lockedSubtitle: {
    fontSize: 13,
    color: '#E53935',
    marginTop: 4,
    fontWeight: '600',
  },
  iconContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  historyContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: 8,
  },
  infoSection: {
    marginTop: 12,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D84315',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 15,
    color: '#333333',
    lineHeight: 22,
  },
});
