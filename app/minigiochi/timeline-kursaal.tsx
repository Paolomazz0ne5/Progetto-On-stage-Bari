import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  LayoutChangeEvent,
} from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheater } from '../../components/TheaterContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Dati degli eventi
const TIMELINE_EVENTS = [
  { id: 'ev1', year: 1925, text: 'Inaugurazione del Teatro', color: '#FF9A9E' },
  { id: 'ev2', year: 1989, text: 'Bene di interesse culturale', color: '#FECFEF' },
  { id: 'ev3', year: 2004, text: 'Chiusura temporanea al pubblico', color: '#A1C4FD' },
  { id: 'ev4', year: 2019, text: 'Inizio dei lavori di restauro', color: '#E2B0FF' },
  { id: 'ev5', year: 2021, text: 'Riapertura come Casa delle Arti', color: '#96FBC4' },
];

interface SlotBounds {
  id: string; // The year
  yMin: number;
  yMax: number;
  xMin: number;
  xMax: number;
}

export default function TimelineKursaalScreen() {
  const { completeMission } = useTheater();

  // State
  const [slots, setSlots] = useState<{ year: number; eventId: string | null }[]>([
    { year: 1925, eventId: null },
    { year: 1989, eventId: null },
    { year: 2004, eventId: null },
    { year: 2019, eventId: null },
    { year: 2021, eventId: null },
  ]);

  const [trayEvents, setTrayEvents] = useState<typeof TIMELINE_EVENTS>([]);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [slotLayouts, setSlotLayouts] = useState<Record<number, SlotBounds>>({});

  const containerRef = useRef<View>(null);

  useEffect(() => {
    resetGame();
  }, []);

  const shuffleArray = (array: any[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const resetGame = () => {
    setSlots([
      { year: 1925, eventId: null },
      { year: 1989, eventId: null },
      { year: 2004, eventId: null },
      { year: 2019, eventId: null },
      { year: 2021, eventId: null },
    ]);
    setTrayEvents(shuffleArray(TIMELINE_EVENTS));
    setShowVictoryModal(false);
  };

  const handleSlotLayout = (year: number, event: LayoutChangeEvent) => {
    containerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      const { x: slotX, y: slotY, width: slotW, height: slotH } = event.nativeEvent.layout;
      setSlotLayouts((prev) => ({
        ...prev,
        [year]: {
          id: year.toString(),
          xMin: pageX + slotX,
          xMax: pageX + slotX + slotW,
          yMin: pageY + slotY,
          yMax: pageY + slotY + slotH,
        },
      }));
    });
  };

  const onDropEvent = (eventId: string, dropX: number, dropY: number) => {
    let matchedYear: number | null = null;

    // Controlla se il drop è avvenuto dentro uno slot
    for (const [yearStr, bounds] of Object.entries(slotLayouts)) {
      if (
        dropY >= bounds.yMin &&
        dropY <= bounds.yMax &&
        dropX >= bounds.xMin &&
        dropX <= bounds.xMax
      ) {
        matchedYear = parseInt(yearStr);
        break;
      }
    }

    if (matchedYear !== null) {
      // Inserisci l'evento nello slot se è vuoto
      setSlots((prevSlots) => {
        const newSlots = [...prevSlots];
        const slotIndex = newSlots.findIndex((s) => s.year === matchedYear);
        
        if (slotIndex !== -1 && newSlots[slotIndex].eventId === null) {
          newSlots[slotIndex].eventId = eventId;
          
          // Rimuovi dal vassoio
          setTrayEvents((prev) => prev.filter((e) => e.id !== eventId));
          
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          checkVictory(newSlots);
          return newSlots;
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return prevSlots; // Slot occupato
        }
      });
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const removeEventFromSlot = (year: number, eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSlots((prev) => {
      const newSlots = [...prev];
      const idx = newSlots.findIndex((s) => s.year === year);
      if (idx !== -1) newSlots[idx].eventId = null;
      return newSlots;
    });

    const eventToReturn = TIMELINE_EVENTS.find((e) => e.id === eventId);
    if (eventToReturn) {
      setTrayEvents((prev) => [...prev, eventToReturn]);
    }
  };

  const checkVictory = (currentSlots: { year: number; eventId: string | null }[]) => {
    const isFull = currentSlots.every((s) => s.eventId !== null);
    if (!isFull) return;

    let isCorrect = true;
    currentSlots.forEach((slot) => {
      const correctEvent = TIMELINE_EVENTS.find((e) => e.year === slot.year);
      if (correctEvent?.id !== slot.eventId) {
        isCorrect = false;
      }
    });

    if (isCorrect) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowVictoryModal(true);
      }, 500);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Non ci siamo ancora! 🤔',
        'Le date non sono corrette. Clicca su un evento nella timeline per rimuoverlo e riprova!'
      );
    }
  };

  const handleClaimXP = () => {
    completeMission(11);
    setShowVictoryModal(false);
    Alert.alert('Vittoria! 🏆', 'Hai completato la timeline e guadagnato 20 XP!', [
      {
        text: 'Ok',
        onPress: () => router.back(),
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={styles.safeArea}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Panel */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.neobrutalPress]}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#333333" />
          </Pressable>
          <Text style={styles.headerTitle}>Timeline Kursaal</Text>
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.neobrutalPress]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Reset', 'Vuoi ricominciare da capo?', [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Sì', style: 'destructive', onPress: resetGame },
              ]);
            }}
          >
            <Ionicons name="refresh" size={20} color="#333333" />
          </Pressable>
        </View>

        <View style={styles.gameContainer} ref={containerRef}>
          {/* Timeline Slots */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineLine} />
            {slots.map((slot, index) => {
              const placedEvent = TIMELINE_EVENTS.find((e) => e.id === slot.eventId);
              return (
                <View
                  key={slot.year}
                  style={styles.slotWrapper}
                  onLayout={(e) => handleSlotLayout(slot.year, e)}
                >
                  <View style={styles.yearBadge}>
                    <Text style={styles.yearText}>{slot.year}</Text>
                  </View>
                  <View style={styles.dot} />
                  
                  <View style={[styles.slot, placedEvent ? { backgroundColor: placedEvent.color } : null]}>
                    {placedEvent ? (
                      <Pressable onPress={() => removeEventFromSlot(slot.year, placedEvent.id)}>
                        <Text style={styles.slotEventText}>{placedEvent.text}</Text>
                      </Pressable>
                    ) : (
                      <Text style={styles.slotEmptyText}>Trascina qui</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Tray Events */}
          <View style={styles.trayContainer}>
            <Text style={styles.trayTitle}>Eventi da posizionare:</Text>
            <View style={styles.tray}>
              {trayEvents.map((event) => (
                <DraggableEvent key={event.id} event={event} onDrop={onDropEvent} />
              ))}
              {trayEvents.length === 0 && (
                <Text style={styles.emptyTrayText}>Tutti gli eventi sono posizionati!</Text>
              )}
            </View>
          </View>
        </View>

        {/* Victory Modal */}
        <Modal visible={showVictoryModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalIconWrapper}>
                <Ionicons name="time" size={54} color="#FFF" />
              </View>
              <Text style={styles.modalTitle}>TEMPO PERFETTO! ⏳</Text>
              <Text style={styles.modalText}>
                Hai ricostruito perfettamente la storia del Teatro Kursaal Santalucia.
              </Text>
              <View style={styles.xpRewardBadge}>
                <Text style={styles.xpRewardText}>Premio: +20 XP</Text>
              </View>
              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [styles.modalResetButton, pressed && styles.neobrutalPress]}
                  onPress={resetGame}
                >
                  <Text style={styles.modalResetButtonText}>Rigioca 🔄</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.modalClaimButton, pressed && styles.neobrutalPress]}
                  onPress={handleClaimXP}
                >
                  <Text style={styles.modalClaimButtonText}>Riscuoti XP</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// Componente per l'evento trascinabile
const DraggableEvent = ({ event, onDrop }: { event: any; onDrop: (id: string, x: number, y: number) => void }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const pan = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      isDragging.value = false;
      runOnJS(onDrop)(event.id, e.absoluteX, e.absoluteY);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    zIndex: isDragging.value ? 1000 : 1,
    shadowOpacity: isDragging.value ? 0.3 : 1,
    elevation: isDragging.value ? 10 : 0,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.draggableCard, { backgroundColor: event.color }, animatedStyle]}>
        <Text style={styles.draggableCardText}>{event.text}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF9E6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 3,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderBottomWidth: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#333333' },
  neobrutalPress: { transform: [{ translateY: 2 }], borderBottomWidth: 2 },
  gameContainer: { flex: 1, padding: 16, justifyContent: 'space-between' },
  
  timelineContainer: {
    flex: 1,
    justifyContent: 'space-around',
    position: 'relative',
    paddingLeft: 80,
    marginTop: 10,
  },
  timelineLine: {
    position: 'absolute',
    left: 60,
    top: 20,
    bottom: 20,
    width: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  slotWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
  },
  yearBadge: {
    position: 'absolute',
    left: -80,
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
  },
  yearText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  dot: {
    position: 'absolute',
    left: -26,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFB300',
    borderWidth: 2,
    borderColor: '#333333',
  },
  slot: {
    flex: 1,
    height: 50,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderStyle: 'dashed',
  },
  slotEmptyText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  slotEventText: { color: '#333333', fontWeight: '800', fontSize: 14, textAlign: 'center' },

  trayContainer: {
    backgroundColor: '#E6DCBF',
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 6,
    borderRadius: 20,
    padding: 16,
    minHeight: 180,
    marginTop: 20,
  },
  trayTitle: { fontSize: 16, fontWeight: '900', color: '#333333', marginBottom: 10 },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  draggableCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    borderRadius: 12,
  },
  draggableCardText: { color: '#333333', fontWeight: '800', fontSize: 13 },
  emptyTrayText: { color: '#666', fontWeight: 'bold', marginTop: 20 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#FFF9E6',
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 8,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#448AFF',
    borderWidth: 3,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#333333', marginBottom: 10 },
  modalText: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 16 },
  xpRewardBadge: {
    backgroundColor: '#66BB6A',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  xpRewardText: { color: '#FFF', fontWeight: '900' },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalResetButton: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalResetButtonText: { fontWeight: '800', color: '#333333' },
  modalClaimButton: {
    flex: 1.2,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#66BB6A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClaimButtonText: { fontWeight: '900', color: '#FFF' },
});
