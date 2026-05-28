import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
const TILE_SIZE = (GRID_SIZE - 24) / 3;

type Category = 'curiosita' | 'difficile' | 'facile' | 'geografia' | 'storia';

interface Question {
  text: string;
  options: string[];
  correctIndex: number;
}

const QUESTIONS: Record<Category, Question[]> = {
  curiosita: [
    {
      text: "Cosa accadde al Teatro Piccinni nel 1855, un anno dopo l'inaugurazione?",
      options: [
        "Crollò parzialmente",
        "Fu intitolato al compositore Niccolò Piccinni",
        "Fu venduto a privati",
        "Fu visitato dal re"
      ],
      correctIndex: 1,
    },
    {
      text: "Nel corso degli anni, oltre agli spettacoli, cosa ha ospitato il Teatro Piccinni?",
      options: [
        "Mercati agricoli",
        "Anche assemblee politiche e dibattiti",
        "Gare sportive",
        "Mostre di pittura permanente"
      ],
      correctIndex: 1,
    },
    {
      text: "Quanti ordini di palchi ha il Teatro Piccinni?",
      options: [
        "Due ordini",
        "Tre ordini, più il loggione",
        "Quattro ordini, più il loggione",
        "Cinque ordini"
      ],
      correctIndex: 2,
    }
  ],
  difficile: [
    {
      text: "Chi fu l'architetto che progettò il Teatro Piccinni?",
      options: [
        "Antonio Niccolini",
        "Orazio Santalucia",
        "Ferdinando Fuga",
        "Luigi Vanvitelli"
      ],
      correctIndex: 0,
    },
    {
      text: "Quale opera inaugurò il Teatro Piccinni il 30 maggio 1854?",
      options: [
        "Il Barbiere di Siviglia di Rossini",
        "La Traviata di Verdi",
        "Poliuto di Gaetano Donizetti",
        "Norma di Bellini"
      ],
      correctIndex: 2,
    },
    {
      text: "Fino a quale anno il Piccinni è stato chiuso per restauro prima della sua recente riapertura?",
      options: [
        "2010",
        "2015",
        "2019",
        "2022"
      ],
      correctIndex: 2,
    }
  ],
  facile: [
    {
      text: "A quale celebre compositore barese è intitolato il teatro?",
      options: [
        "Giuseppe Verdi",
        "Niccolò Piccinni",
        "Giacomo Puccini",
        "Umberto Giordano"
      ],
      correctIndex: 1,
    },
    {
      text: "Il Teatro Piccinni è il teatro più antico di Bari attualmente in attività?",
      options: [
        "Sì",
        "No, è il Margherita",
        "No, è il Petruzzelli",
        "No, è il Kursaal"
      ],
      correctIndex: 0,
    },
    {
      text: "In quale secolo è stato inaugurato il Teatro Piccinni?",
      options: [
        "XVIII secolo",
        "XIX secolo",
        "XX secolo",
        "XXI secolo"
      ],
      correctIndex: 1,
    }
  ],
  geografia: [
    {
      text: "Su quale importante arteria del centro di Bari si affaccia il Teatro Piccinni?",
      options: [
        "Corso Cavour",
        "Via Sparano",
        "Corso Vittorio Emanuele II",
        "Lungomare Nazario Sauro"
      ],
      correctIndex: 2,
    },
    {
      text: "Rispetto al Teatro Margherita e al Teatro Petruzzelli, dove si trova il Piccinni?",
      options: [
        "Sul mare",
        "Più all'interno, vicino al Palazzo di Città",
        "Nel quartiere Poggiofranco",
        "Fuori città"
      ],
      correctIndex: 1,
    },
    {
      text: "Il Teatro Piccinni è adiacente a quale importante edificio istituzionale barese?",
      options: [
        "Il Municipio (Palazzo di Città)",
        "La Prefettura",
        "L'Università",
        "Il Tribunale"
      ],
      correctIndex: 0,
    }
  ],
  storia: [
    {
      text: "In che anno fu inaugurato il Teatro Piccinni?",
      options: [
        "1812",
        "1854",
        "1890",
        "1910"
      ],
      correctIndex: 1,
    },
    {
      text: "Durante quale periodo il Teatro Piccinni divenne la sede principale degli spettacoli a Bari a causa della distruzione di un altro teatro?",
      options: [
        "Durante la prima guerra mondiale",
        "Dopo l'incendio del Petruzzelli (dal 1991)",
        "Durante l'epidemia di colera",
        "Negli anni '70"
      ],
      correctIndex: 1,
    },
    {
      text: "Come si chiamava originariamente il teatro prima di essere intitolato a Niccolò Piccinni nel 1855?",
      options: [
        "Teatro Vecchio",
        "Teatro Borbonico",
        "Teatro Nuovo",
        "Teatro Reale"
      ],
      correctIndex: 2,
    }
  ]
};

const CATEGORY_META = {
  curiosita: {
    title: 'Domanda Curiosità 🔍',
    color: '#FFB300',
    image: require('../../sprite/sprite/curiosità.jpeg'),
  },
  difficile: {
    title: 'Domanda Difficile 🧠',
    color: '#E53935',
    image: require('../../sprite/sprite/difficile.jpeg'),
  },
  facile: {
    title: 'Domanda Facile 💡',
    color: '#1E88E5',
    image: require('../../sprite/sprite/facile.jpeg'),
  },
  geografia: {
    title: 'Domanda Geografia 🌍',
    color: '#8D6E63',
    image: require('../../sprite/sprite/geografia.jpeg'),
  },
  storia: {
    title: 'Domanda Storica 🏛️',
    color: '#9C27B0',
    image: require('../../sprite/sprite/storia.jpeg'),
  },
};

export default function QuizPiccinniScreen() {
  const { completeMission } = useTheater();

  // Stato delle casse (null = chiusa, altrimenti contiene la categoria sbloccata)
  const [crates, setCrates] = useState<(Category | null)[]>(Array(9).fill(null));
  const [score, setScore] = useState(0);

  // Stato della domanda attiva
  const [activeCellIdx, setActiveCellIdx] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  
  // Stato selezione risposta
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<'correct' | 'incorrect' | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);

  // Modali di fine gioco
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);

  const resetGame = () => {
    setCrates(Array(9).fill(null));
    setScore(0);
    setActiveCellIdx(null);
    setActiveCategory(null);
    setActiveQuestion(null);
    setSelectedOption(null);
    setAnswerStatus(null);
    setIsProcessingAnswer(false);
    setShowGameOverModal(false);
    setShowVictoryModal(false);
  };

  const handleCratePress = (idx: number) => {
    if (crates[idx] !== null || isProcessingAnswer) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Seleziona una categoria casuale
    const categories: Category[] = ['curiosita', 'difficile', 'facile', 'geografia', 'storia'];
    const randomCat = categories[Math.floor(Math.random() * categories.length)];

    // Seleziona una domanda casuale per quella categoria
    const questionList = QUESTIONS[randomCat];
    const randomQ = questionList[Math.floor(Math.random() * questionList.length)];

    setActiveCellIdx(idx);
    setActiveCategory(randomCat);
    setActiveQuestion(randomQ);
    setSelectedOption(null);
    setAnswerStatus(null);
  };

  const handleOptionPress = (optionIdx: number) => {
    if (selectedOption !== null || isProcessingAnswer || !activeQuestion || activeCellIdx === null || !activeCategory) return;

    setSelectedOption(optionIdx);
    setIsProcessingAnswer(true);

    const isCorrect = optionIdx === activeQuestion.correctIndex;

    if (isCorrect) {
      setAnswerStatus('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Incrementa punteggio locale
      setScore((prev) => prev + 20);

      // Ritarda la chiusura della domanda per far vedere il feedback verde
      setTimeout(() => {
        const newCrates = [...crates];
        newCrates[activeCellIdx] = activeCategory;
        setCrates(newCrates);

        // Aggiunge XP globale
        completeMission();

        // Pulisce stato domanda
        setActiveCellIdx(null);
        setActiveCategory(null);
        setActiveQuestion(null);
        setSelectedOption(null);
        setAnswerStatus(null);
        setIsProcessingAnswer(false);

        // Controlla se il gioco è finito con vittoria (tutte le casse aperte)
        const isFinished = newCrates.every((c) => c !== null);
        if (isFinished) {
          setShowVictoryModal(true);
        }
      }, 1500);

    } else {
      setAnswerStatus('incorrect');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Ritarda il Game Over per far vedere la risposta corretta in verde e quella errata in rosso
      setTimeout(() => {
        setShowGameOverModal(true);
        setIsProcessingAnswer(false);
      }, 1800);
    }
  };

  const openedCount = crates.filter((c) => c !== null).length;

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
        <Text style={styles.headerTitle}>Quiz del Piccinni</Text>
        <View style={styles.headerRightActions}>
          <Pressable
            style={({ pressed }) => [styles.resetButton, pressed && styles.neobrutalPress]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Ricomincia', 'Vuoi davvero azzerare la griglia di quiz?', [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Sì, ricomincia', style: 'destructive', onPress: resetGame },
              ]);
            }}
          >
            <Ionicons name="refresh" size={20} color="#333333" />
          </Pressable>
        </View>
      </View>

      {/* Main Grid View */}
      {activeQuestion === null ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          <View style={styles.progressCard}>
            <Ionicons name="help-circle" size={32} color="#66BB6A" style={styles.progressIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.progressCardTitle}>Casse Misteriose</Text>
              <Text style={styles.progressCardText}>
                Risolte: <Text style={styles.bold}>{openedCount} / 9</Text> | Punteggio: <Text style={styles.bold}>+{score} XP</Text>
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.instructionText}>
            Clicca su una cassa di legno per svelare una domanda. Rispondi correttamente per sostituire la cassa con il suo sprite. Se sbagli, è Game Over!
          </Text>

          {/* The Grid Board */}
          <View style={styles.gridOuterFrame}>
            <View style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}>
              <View style={styles.gridCellsWrapper}>
                {crates.map((crateCat, idx) => {
                  return (
                    <Pressable
                      key={idx}
                      onPress={() => handleCratePress(idx)}
                      style={({ pressed }) => [
                        styles.gridCell,
                        {
                          width: TILE_SIZE,
                          height: TILE_SIZE,
                          left: (idx % 3) * (TILE_SIZE + 6) + 6,
                          top: Math.floor(idx / 3) * (TILE_SIZE + 6) + 6,
                        },
                        crateCat === null && pressed && styles.neobrutalPressSmall,
                      ]}
                    >
                      {crateCat === null ? (
                        <Image
                          source={require('../../sprite/sprite/cassa.jpeg')}
                          style={styles.spriteImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Image
                          source={CATEGORY_META[crateCat].image}
                          style={styles.spriteImage}
                          resizeMode="cover"
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        /* Active Question View overlay */
        <ScrollView
          contentContainerStyle={styles.questionContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeCategory && (
            <View style={styles.questionCard}>
              {/* Category Indicator */}
              <View style={[styles.categoryHeader, { backgroundColor: CATEGORY_META[activeCategory].color }]}>
                <Image
                  source={CATEGORY_META[activeCategory].image}
                  style={styles.categoryHeaderIcon}
                  resizeMode="contain"
                />
                <Text style={styles.categoryHeaderText}>
                  {CATEGORY_META[activeCategory].title}
                </Text>
              </View>

              <View style={{ alignItems: 'center', marginVertical: 20 }}>
                <Image
                  source={CATEGORY_META[activeCategory].image}
                  style={{ width: 200, height: 200, borderRadius: 16 }}
                  resizeMode="contain"
                />
              </View>

              {/* Question text */}
              <Text style={styles.questionText}>
                {activeQuestion.text}
              </Text>

              {/* Options buttons */}
              <View style={styles.optionsWrapper}>
                {activeQuestion.options.map((option, oIdx) => {
                  let buttonStyle: any = styles.optionButton;
                  let textStyle: any = styles.optionButtonText;

                  if (selectedOption !== null) {
                    if (oIdx === activeQuestion.correctIndex) {
                      // Correct option is always green after selection
                      buttonStyle = [styles.optionButton, styles.optionButtonCorrect];
                      textStyle = [styles.optionButtonText, styles.optionButtonTextCorrect];
                    } else if (selectedOption === oIdx && answerStatus === 'incorrect') {
                      // Clicked incorrect option is red
                      buttonStyle = [styles.optionButton, styles.optionButtonIncorrect];
                      textStyle = [styles.optionButtonText, styles.optionButtonTextIncorrect];
                    } else {
                      // Others disabled/dimmed
                      buttonStyle = [styles.optionButton, styles.optionButtonDisabled];
                    }
                  }

                  return (
                    <Pressable
                      key={oIdx}
                      onPress={() => handleOptionPress(oIdx)}
                      disabled={selectedOption !== null}
                      style={({ pressed }) => [
                        buttonStyle,
                        selectedOption === null && pressed && styles.neobrutalPress,
                      ]}
                    >
                      <Text style={textStyle}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Game Over Modal */}
      <Modal visible={showGameOverModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrapper, { backgroundColor: '#E53935' }]}>
              <Ionicons name="close-circle" size={54} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>GAME OVER! ❌</Text>
            <Text style={styles.modalText}>
              Ops! La risposta selezionata non era corretta. La sfida delle casse misteriose finisce qui.
            </Text>

            <View style={styles.xpRewardBadge}>
              <Text style={styles.xpRewardText}>Punteggio finale: +{score} XP</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalResetButton, pressed && styles.neobrutalPress]}
                onPress={resetGame}
              >
                <Text style={styles.modalResetButtonText}>Riprova 🔄</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalExitButton, pressed && styles.neobrutalPress]}
                onPress={() => {
                  setShowGameOverModal(false);
                  router.back();
                }}
              >
                <Text style={styles.modalExitButtonText}>Esci 🚪</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Victory Modal */}
      <Modal visible={showVictoryModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconWrapper, { backgroundColor: '#66BB6A' }]}>
              <Ionicons name="trophy" size={54} color="#FFF" />
            </View>
            <Text style={styles.modalTitle}>VITTORIA COMPLETA! 🏆</Text>
            <Text style={styles.modalText}>
              Incredibile! Hai risposto correttamente a tutte le 9 casse misteriose del Teatro Piccinni! Sei un vero esperto!
            </Text>

            <View style={[styles.xpRewardBadge, { backgroundColor: '#66BB6A' }]}>
              <Text style={styles.xpRewardText}>XP Totali: +{score} XP</Text>
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalResetButton, pressed && styles.neobrutalPress]}
                onPress={resetGame}
              >
                <Text style={styles.modalResetButtonText}>Rigioca 🔄</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalExitButton, { backgroundColor: '#66BB6A' }, pressed && styles.neobrutalPress]}
                onPress={() => {
                  setShowVictoryModal(false);
                  router.back();
                }}
              >
                <Text style={[styles.modalExitButtonText, { color: '#FFF' }]}>Esci 🏆</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
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
    marginBottom: 20,
    width: '100%',
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
  bold: {
    fontWeight: '900',
    color: '#333333',
  },
  instructionText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  gridOuterFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderRadius: 20,
    backgroundColor: '#D7CCC8',
    position: 'relative',
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
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spriteImage: {
    width: '100%',
    height: '100%',
  },
  questionContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 3,
    borderColor: '#333333',
  },
  categoryHeaderIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  categoryHeaderText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333333',
    padding: 20,
    lineHeight: 26,
  },
  optionsWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333333',
  },
  optionButtonCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E7D32',
  },
  optionButtonTextCorrect: {
    color: '#2E7D32',
    fontWeight: '900',
  },
  optionButtonIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: '#C62828',
  },
  optionButtonTextIncorrect: {
    color: '#C62828',
    fontWeight: '900',
  },
  optionButtonDisabled: {
    opacity: 0.5,
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
    borderWidth: 3,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
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
    backgroundColor: '#E53935',
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
  modalExitButton: {
    flex: 1.2,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#FF8A80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalExitButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#333333',
  },
  neobrutalPress: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  neobrutalPressSmall: {
    transform: [{ translateY: 1 }],
    borderBottomWidth: 2,
  },
});
