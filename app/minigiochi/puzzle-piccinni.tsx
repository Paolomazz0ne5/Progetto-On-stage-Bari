import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheater } from '../../components/TheaterContext';

const { width: screenWidth } = Dimensions.get('window');

const GRID_SIZE = Math.min(screenWidth - 40, 360);
const TILE_SIZE = GRID_SIZE / 4;
const TRAY_TILE_SIZE = Math.min((screenWidth - 60) / 4, 75);

const FIXED_PIECES = [0, 5, 10, 15]; // Diagonale principale

export default function PuzzlePiccinniScreen() {
  const { completeMission } = useTheater();

  // State
  const [gridPieces, setGridPieces] = useState<(number | null)[]>(Array(16).fill(null));
  const [trayPieces, setTrayPieces] = useState<number[]>([]);

  // Pezzo selezionato per il tap-to-place
  const [selectedPiece, setSelectedPiece] = useState<{
    id: number;
    fromGridIdx: number | null;
    fromTray: boolean;
  } | null>(null);

  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const shuffleArray = (array: number[]): number[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Initialize Game
  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const initialGrid = Array(16).fill(null);
    initialGrid[0] = 0;
    initialGrid[5] = 5;
    initialGrid[10] = 10;
    initialGrid[15] = 15;
    setGridPieces(initialGrid);

    const initialPieces = Array.from({ length: 16 }, (_, i) => i).filter(
      (id) => !FIXED_PIECES.includes(id)
    );
    setTrayPieces(shuffleArray(initialPieces));

    setSelectedPiece(null);
    setShowVictoryModal(false);
  };

  // Seleziona/deseleziona un pezzo
  const handlePieceTap = (pieceId: number, fromGridIdx: number | null, fromTray: boolean) => {
    if (fromGridIdx !== null && FIXED_PIECES.includes(fromGridIdx)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Se clicchi lo stesso pezzo, deselezionalo
    if (selectedPiece && selectedPiece.id === pieceId) {
      setSelectedPiece(null);
    } else {
      // Altrimenti selezionalo
      setSelectedPiece({ id: pieceId, fromGridIdx, fromTray });
    }
  };

  // Ref per tracciare il double tap sul mosaico
  const lastTapRef = useRef<{ cellIdx: number; time: number } | null>(null);

  // Clicca su una casella della griglia (mosaico)
  const handleGridCellTap = (cellIdx: number) => {
    if (FIXED_PIECES.includes(cellIdx)) return;

    const existingPieceId = gridPieces[cellIdx];
    const now = Date.now();
    const lastTap = lastTapRef.current;

    // Controllo double tap: se tocchi lo stesso pezzo/cella entro 300ms
    if (existingPieceId !== null && lastTap && lastTap.cellIdx === cellIdx && now - lastTap.time < 300) {
      // È un double tap per rilasciare il pezzo nel vassoio
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const newGrid = [...gridPieces];
      newGrid[cellIdx] = null;
      setGridPieces(newGrid);

      setTrayPieces((prev) => {
        if (!prev.includes(existingPieceId)) {
          return [...prev, existingPieceId];
        }
        return prev;
      });
      setSelectedPiece(null);
      lastTapRef.current = null;
      return;
    }

    // Registra questo tap per il potenziale double tap
    lastTapRef.current = { cellIdx, time: now };

    // Gestione single tap
    if (!selectedPiece) {
      // Nessun pezzo selezionato: se la cella ha un pezzo, lo selezioniamo
      if (existingPieceId !== null) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedPiece({ id: existingPieceId, fromGridIdx: cellIdx, fromTray: false });
      }
      return;
    }

    // Se c'è un pezzo selezionato:
    // Se clicchi la stessa casella del pezzo selezionato, lo deselezioni
    if (selectedPiece.fromGridIdx === cellIdx) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedPiece(null);
      return;
    }

    // Altrimenti piazza o scambia!
    handlePlacement(selectedPiece, cellIdx);
    setSelectedPiece(null);
  };

  // Piazza un pezzo
  const handlePlacement = (
    piece: { id: number; fromGridIdx: number | null; fromTray: boolean },
    targetCellIdx: number
  ) => {
    if (FIXED_PIECES.includes(targetCellIdx)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Attenzione', 'Non puoi piazzare su questa casella!');
      return;
    }

    const existingPieceId = gridPieces[targetCellIdx];
    const newGrid = [...gridPieces];

    if (existingPieceId === null) {
      // Cella vuota: piazza il pezzo
      newGrid[targetCellIdx] = piece.id;

      if (piece.fromGridIdx !== null) {
        newGrid[piece.fromGridIdx] = null;
      }

      if (piece.fromTray) {
        setTrayPieces((prev) => prev.filter((id) => id !== piece.id));
      }

      setGridPieces(newGrid);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      checkAndVerifyVictory(newGrid);
    } else {
      // Cella occupata: eseguiamo lo scambio!
      if (piece.fromGridIdx !== null) {
        // Scambio tra due pezzi della griglia (mosaico)
        newGrid[targetCellIdx] = piece.id;
        newGrid[piece.fromGridIdx] = existingPieceId;

        setGridPieces(newGrid);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        checkAndVerifyVictory(newGrid);
      } else if (piece.fromTray) {
        // Scambio tra pezzo del vassoio e pezzo sulla griglia
        newGrid[targetCellIdx] = piece.id;

        // Quello sulla griglia torna nel vassoio, quello nel vassoio viene rimosso
        setTrayPieces((prev) => {
          const filtered = prev.filter((id) => id !== piece.id);
          return [...filtered, existingPieceId];
        });

        setGridPieces(newGrid);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        checkAndVerifyVictory(newGrid);
      }
    }
  };

  // Rilascia il pezzo selezionato rimettendolo nel vassoio
  const handleReturnSelectedToTray = () => {
    if (selectedPiece) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (selectedPiece.fromGridIdx !== null) {
        // Rimuovilo dalla griglia
        const newGrid = [...gridPieces];
        newGrid[selectedPiece.fromGridIdx] = null;
        setGridPieces(newGrid);

        // Aggiungilo al vassoio
        setTrayPieces((prev) => {
          if (!prev.includes(selectedPiece.id)) {
            return [...prev, selectedPiece.id];
          }
          return prev;
        });
      }

      setSelectedPiece(null);
    }
  };

  const checkAndVerifyVictory = (currentGrid: (number | null)[]) => {
    const isFull = currentGrid.every((p) => p !== null);
    if (!isFull) return;

    const isCorrect = currentGrid.every((p, idx) => p === idx);

    if (isCorrect) {
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowVictoryModal(true);
      }, 350);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Quasi pronto! 🤔',
        'Tutti i pezzi sono posizionati, ma alcuni non sono nella posizione corretta. Continua a spostarli o scambiarli per completare la figura!'
      );
    }
  };

  const handleClaimXP = () => {
    completeMission();
    setShowVictoryModal(false);
    Alert.alert('Vittoria! 🏆', 'Hai completato la sfida e guadagnato 20 XP!', [
      {
        text: 'Ok',
        onPress: () => {
          router.back();
        },
      },
    ]);
  };

  const placedCount = gridPieces.filter((p) => p !== null).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Panel */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.neobrutalPress]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333333" />
        </Pressable>
        <Text style={styles.headerTitle}>Sfida Piccinni</Text>
        <View style={styles.headerRightActions}>
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.neobrutalPress]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Reset sfida', 'Vuoi davvero ricominciare da capo?', [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Sì, resetta', style: 'destructive', onPress: resetGame },
              ]);
            }}
          >
            <Ionicons name="refresh" size={20} color="#333333" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Ionicons name="extension-puzzle" size={28} color="#E91E63" style={styles.progressIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.progressCardTitle}>Jigsaw Puzzle Reale</Text>
            <Text style={styles.progressCardText}>
              Pezzi sulla tavola: <Text style={styles.bold}>{placedCount} / 16</Text>
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <Text style={styles.instructionText}>
          Per riposizionare un pezzo nel vassoio puoi fare doppio tap.
        </Text>

        {/* The Grid Board */}
        <View style={styles.gridOuterFrame}>
          <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}>
            <View style={styles.gridCellsWrapper}>
              {Array.from({ length: 16 }).map((_, idx) => {
                const pieceId = gridPieces[idx];
                const isSelected = selectedPiece && !selectedPiece.fromTray && selectedPiece.fromGridIdx === idx;
                const r = Math.floor(idx / 4);
                const c = idx % 4;
                const isLocked = FIXED_PIECES.includes(idx);

                return (
                  <Pressable
                    key={idx}
                    onPress={() => !isLocked && handleGridCellTap(idx)}
                    style={[
                      styles.gridCell,
                      {
                        width: TILE_SIZE,
                        height: TILE_SIZE,
                        left: c * TILE_SIZE,
                        top: r * TILE_SIZE,
                      },
                      isLocked && styles.gridCellLocked,
                      isSelected && styles.selectedTileHighlight,
                    ]}
                  >
                    {pieceId !== null ? (
                      <View
                        style={[
                          styles.placedTile,
                          isLocked && styles.lockedTile,
                        ]}
                      >
                        <Image
                          source={require('../../assets/images/piccinni_facciata.jpg')}
                          style={[
                            styles.tileImage,
                            {
                              width: GRID_SIZE,
                              height: GRID_SIZE,
                              left: -(pieceId % 4) * TILE_SIZE,
                              top: -Math.floor(pieceId / 4) * TILE_SIZE,
                            },
                          ]}
                          resizeMode="stretch"
                        />
                      </View>
                    ) : (
                      <View style={styles.emptyGuideCell} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Tray */}
        <Text style={styles.trayTitle}>Pezzi nel vassoio</Text>
        <View style={styles.trayContainer}>
          <View style={styles.trayGrid}>
            {/* Quadratino tratteggiato vuoto nel vassoio per rilascio */}
            <Pressable
              onPress={() => {
                if (selectedPiece && selectedPiece.fromGridIdx !== null) {
                  handleReturnSelectedToTray();
                } else {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(
                    'Info 💡',
                    'Seleziona prima un pezzo posizionato sulla griglia, poi clicca qui per rimandarlo nel vassoio.'
                  );
                }
              }}
              style={[
                styles.queueSlot,
                styles.draggableTile,
                styles.emptySlotPlaceholder,
                { width: TRAY_TILE_SIZE - 6, height: TRAY_TILE_SIZE - 6 },
              ]}
            >
              <Ionicons name="arrow-undo-outline" size={20} color="#78909C" />
              <Text style={styles.emptySlotText}>Rilascia</Text>
            </Pressable>

            {trayPieces.map((pieceId) => {
              const isSelected = selectedPiece && selectedPiece.fromTray && selectedPiece.id === pieceId;
              return (
                <Pressable
                  key={pieceId}
                  onPress={() => handlePieceTap(pieceId, null, true)}
                  style={[
                    styles.queueSlot,
                    styles.draggableTile,
                    { width: TRAY_TILE_SIZE - 6, height: TRAY_TILE_SIZE - 6 },
                    isSelected && styles.selectedTileHighlight,
                  ]}
                >
                  <Image
                    source={require('../../assets/images/piccinni_facciata.jpg')}
                    style={[
                      styles.tileImage,
                      {
                        width: TRAY_TILE_SIZE * 4,
                        height: TRAY_TILE_SIZE * 4,
                        left: -(pieceId % 4) * TRAY_TILE_SIZE,
                        top: -Math.floor(pieceId / 4) * TRAY_TILE_SIZE,
                      },
                    ]}
                    resizeMode="stretch"
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Victory Modal */}
      <Modal visible={showVictoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="trophy" size={54} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>RISOLTO! 🏆</Text>
            <Text style={styles.modalText}>
              Incredibile! Hai assemblato perfettamente lo storico Teatro Piccinni senza alcuna guida. Un vero maestro del puzzle!
            </Text>

            <View style={styles.xpRewardBadge}>
              <Text style={styles.xpRewardText}>Premio Missione: +20 XP</Text>
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
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
  headerRightActions: {
    flexDirection: 'row',
    gap: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333333',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  progressIcon: {
    marginRight: 16,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#333333',
  },
  progressCardText: {
    fontSize: 13,
    color: '#666666',
    marginTop: 2,
  },
  trayReturnBtn: {
    backgroundColor: '#FFE6E6',
    borderWidth: 2,
    borderColor: '#EF5350',
    borderBottomWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  trayReturnBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#333333',
  },
  bold: {
    fontWeight: '900',
    color: '#333333',
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  gridOuterFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  gridContainer: {
    position: 'relative',
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 7,
    borderRightWidth: 7,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  gridCellsWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  gridCell: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridCellLocked: {
    borderColor: '#66BB6A',
    backgroundColor: '#E8F5E9',
  },
  placedTile: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  lockedTile: {
    opacity: 0.95,
  },
  emptySlotPlaceholder: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#78909C',
    backgroundColor: 'rgba(120, 144, 156, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  emptySlotText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#78909C',
    textAlign: 'center',
  },
  tileImage: {
    position: 'absolute',
  },
  emptyGuideCell: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  trayTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 10,
    paddingLeft: 4,
  },
  trayContainer: {
    backgroundColor: '#E6DCBF',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 20,
    padding: 16,
    minHeight: 120,
    justifyContent: 'center',
  },
  trayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  queueSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  draggableTile: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  selectedTileHighlight: {
    borderColor: '#FFB300',
    borderWidth: 3,
    borderBottomWidth: 6,
    transform: [{ scale: 1.08 }],
  },
  emptyTray: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyTrayText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  neobrutalPress: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#FFF9E6',
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#66BB6A',
    borderWidth: 3,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
  },
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
  xpRewardText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalResetButton: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalResetButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333333',
  },
  modalClaimButton: {
    flex: 1.2,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#66BB6A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClaimButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
