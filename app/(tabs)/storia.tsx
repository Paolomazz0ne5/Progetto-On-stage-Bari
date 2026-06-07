import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useTheater, THEATERS } from '../../components/TheaterContext';
import { THEATER_HISTORY_DATA } from '../../constants/TheaterHistory';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const THEATER_AUDIOS: Record<string, any> = {
  petruzzelli: require('../../Audio/Petruzzelli.mp3'),
  margherita: require('../../Audio/Margherita.mp3'),
  piccinni: require('../../Audio/Piccinni.mp3'),
  kursaal: require('../../Audio/Kursaal-santa-lucia.mp3'),
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function StoriaScreen() {
  const insets = useSafeAreaInsets();
  const { unlockedTheaterIds } = useTheater();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingTheaterId, setPlayingTheaterId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    }).catch(err => console.log('Error setting audio mode:', err));

    return () => {
      // Cleanup audio on screen unmount
      stopAndUnloadSound();
    };
  }, []);

  const stopAndUnloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.log('Error unloading sound:', e);
      }
      soundRef.current = null;
    }
    setPlayingTheaterId(null);
  };

  const handlePlayPause = async (theaterId: string) => {
    try {
      const audioAsset = THEATER_AUDIOS[theaterId];
      if (!audioAsset) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (soundRef.current) {
        if (playingTheaterId === theaterId) {
          // Toggle play/pause for current theater
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await soundRef.current.pauseAsync();
              setPlayingTheaterId(null);
            } else {
              await soundRef.current.playAsync();
              setPlayingTheaterId(theaterId);
            }
          }
          return;
        } else {
          // Stop and unload previous sound
          await stopAndUnloadSound();
        }
      }

      setIsLoadingAudio(true);
      setPlayingTheaterId(theaterId); // Set immediately to show loading spinner on correct button
      
      const { sound } = await Audio.Sound.createAsync(
        audioAsset,
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setPlayingTheaterId(null);
            }
          }
        }
      );
      soundRef.current = sound;
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('Error handling play/pause audio:', error);
      setPlayingTheaterId(null);
      setIsLoadingAudio(false);
    }
  };

  const toggleExpand = async (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Stop audio if the expanded card is collapsing or changing
    if (playingTheaterId && (expandedId === id || expandedId !== id)) {
      await stopAndUnloadSound();
    }
    
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
                  {THEATER_AUDIOS[theater.id] && (
                    <View style={[styles.audioContainer, { borderColor: theater.color + '40' }]}>
                      <TouchableOpacity 
                        style={[styles.audioButton, { backgroundColor: theater.color }]} 
                        onPress={() => handlePlayPause(theater.id)}
                        disabled={isLoadingAudio && playingTheaterId === theater.id}
                        activeOpacity={0.8}
                      >
                        {isLoadingAudio && playingTheaterId === theater.id ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <FontAwesome5 
                            name={playingTheaterId === theater.id ? "pause" : "play"} 
                            size={14} 
                            color="#FFFFFF" 
                            style={{ marginLeft: playingTheaterId === theater.id ? 0 : 2 }}
                          />
                        )}
                      </TouchableOpacity>
                      <View style={styles.audioTextContainer}>
                        <Text style={styles.audioTitle}>Ascolta la storia</Text>
                        <Text style={styles.audioSubtitle}>
                          {playingTheaterId === theater.id 
                            ? "In riproduzione • Tocca per pausare" 
                            : "Avvia l'audioguida del teatro"}
                        </Text>
                      </View>
                    </View>
                  )}

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
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginTop: 12,
  },
  audioButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  audioTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  audioSubtitle: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 2,
    fontWeight: '500',
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
