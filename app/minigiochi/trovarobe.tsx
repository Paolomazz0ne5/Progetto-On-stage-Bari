import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, Dimensions, SafeAreaView, Pressable, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheater } from '../../components/TheaterContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Item {
  id: number;
  title: string;
  isTheaterElement: boolean;
  image: any;
}

const ITEMS: Item[] = [
  { id: 1, title: 'Cappella', isTheaterElement: true, image: require('../../immagini trovarobe/immagini trovarobe/cappella corretto.jpg') },
  { id: 2, title: 'Facciata', isTheaterElement: true, image: require('../../immagini trovarobe/immagini trovarobe/facciata corretto.jpg') },
  { id: 3, title: 'Interno Teatro', isTheaterElement: false, image: require('../../immagini trovarobe/immagini trovarobe/intruso caltanisetta.jpg') },
  { id: 4, title: 'Elemento esterno', isTheaterElement: false, image: require('../../immagini trovarobe/immagini trovarobe/la scala intruso.jpg') },
  { id: 5, title: 'Torri', isTheaterElement: true, image: require('../../immagini trovarobe/immagini trovarobe/torri corrette.png') },
];

export default function TrovarobeScreen() {
  const { completeMission } = useTheater();
  const [key, setKey] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: 'success' | 'error' | 'finish';
    title: string;
    message: string;
  } | null>(null);

  const handleSwipedRight = (cardIndex: number) => {
    const item = ITEMS[cardIndex];
    if (item.isTheaterElement) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalContent({ type: 'success', title: 'ESATTO! 🎉', message: 'Corretto!' });
      setModalVisible(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setModalContent({ type: 'error', title: 'SBAGLIATO! ❌', message: 'Sbagliato, era un intruso!' });
      setModalVisible(true);
    }
  };

  const handleSwipedLeft = (cardIndex: number) => {
    const item = ITEMS[cardIndex];
    if (!item.isTheaterElement) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalContent({ type: 'success', title: 'ESATTO! 🎉', message: 'Esatto, occhio di falco!' });
      setModalVisible(true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setModalContent({ type: 'error', title: 'SBAGLIATO! ❌', message: 'Sbagliato, appartiene al teatro!' });
      setModalVisible(true);
    }
  };

  const handleSwipedAll = () => {
    completeMission(2);
    setModalContent({ type: 'finish', title: 'PARTITA FINITA! 🏆', message: 'Hai esaminato tutti gli oggetti di scena.' });
    setModalVisible(true);
  };

  const renderCard = (item: Item) => {
    return (
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Image source={item.image} style={{ width: '100%', height: '100%', borderRadius: 14 }} resizeMode="cover" />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.neobrutalPress]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333333" />
        </Pressable>
        <Text style={styles.headerTitle}>Reperti e Intrusi</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          key={key}
          cards={ITEMS}
          renderCard={renderCard}
          onSwipedRight={handleSwipedRight}
          onSwipedLeft={handleSwipedLeft}
          onSwipedAll={handleSwipedAll}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          animateCardOpacity
          overlayLabels={{
            left: {
              title: 'INTRUSO',
              style: {
                label: {
                  backgroundColor: '#E53935',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: '900',
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 2,
                  borderColor: '#333333',
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30
                }
              }
            },
            right: {
              title: 'DEL TEATRO',
              style: {
                label: {
                  backgroundColor: '#66BB6A',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: '900',
                  borderRadius: 10,
                  padding: 10,
                  borderWidth: 2,
                  borderColor: '#333333',
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30
                }
              }
            }
          }}
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          {modalContent && (
            <View style={styles.modalCard}>
              <View style={[styles.modalIconWrapper, { backgroundColor: modalContent.type === 'error' ? '#E53935' : (modalContent.type === 'finish' ? '#FFB300' : '#66BB6A') }]}>
                <Ionicons
                  name={modalContent.type === 'error' ? "close-circle" : (modalContent.type === 'finish' ? "trophy" : "checkmark-circle")}
                  size={54}
                  color="#FFF"
                />
              </View>
              <Text style={styles.modalTitle}>{modalContent.title}</Text>
              <Text style={styles.modalText}>{modalContent.message}</Text>

              <View style={styles.modalActions}>
                {modalContent.type === 'finish' ? (
                  <>
                    <Pressable
                      style={({ pressed }) => [styles.modalResetButton, pressed && styles.neobrutalPress]}
                      onPress={() => {
                        setModalVisible(false);
                        setKey(prev => prev + 1);
                      }}
                    >
                      <Text style={styles.modalResetButtonText}>Rigioca 🔄</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [styles.modalExitButton, pressed && styles.neobrutalPress]}
                      onPress={() => {
                        setModalVisible(false);
                        router.back();
                      }}
                    >
                      <Text style={styles.modalExitButtonText}>Esci 🚪</Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    style={({ pressed }) => [styles.modalContinueButton, pressed && styles.neobrutalPress]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalContinueButtonText}>Continua ➡️</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    zIndex: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333333',
  },
  swiperContainer: {
    flex: 1,
  },
  card: {
    flex: 0.7,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#333333',
    borderBottomWidth: 8,
    borderRightWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 50,
    padding: 24,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
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
    fontSize: 14,
    lineHeight: 20,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalContinueButton: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    borderRadius: 16,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContinueButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
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
    flex: 1,
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
});
