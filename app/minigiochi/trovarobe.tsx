import React, { useState } from 'react';
import { StyleSheet, Text, View, Alert, Dimensions, SafeAreaView, Pressable } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Item {
  id: number;
  title: string;
  isHistoric: boolean;
  icon: keyof typeof Ionicons.glyphMap;
}

const ITEMS: Item[] = [
  { id: 1, title: 'Copione Antico', isHistoric: true, icon: 'book' },
  { id: 2, title: 'Faretto LED', isHistoric: false, icon: 'flashlight' },
  { id: 3, title: 'Costume d\'Epoca', isHistoric: true, icon: 'shirt' },
  { id: 4, title: 'Smartphone', isHistoric: false, icon: 'phone-portrait' },
  { id: 5, title: 'Maschera Teatrale', isHistoric: true, icon: 'happy' },
  { id: 6, title: 'Microfono Wireless', isHistoric: false, icon: 'mic' },
];

export default function TrovarobeScreen() {
  const [key, setKey] = useState(0);

  const handleSwipedRight = (cardIndex: number) => {
    const item = ITEMS[cardIndex];
    if (item.isHistoric) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Esatto!', `Hai indovinato: "${item.title}" è un reperto storico!`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sbagliato!', `Attenzione: "${item.title}" è un intruso moderno!`);
    }
  };

  const handleSwipedLeft = (cardIndex: number) => {
    const item = ITEMS[cardIndex];
    if (!item.isHistoric) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Esatto!', `Hai individuato l'intruso: "${item.title}" non appartiene al teatro antico!`);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sbagliato!', `Attenzione: "${item.title}" è in realtà un prezioso reperto storico!`);
    }
  };

  const handleSwipedAll = () => {
    Alert.alert('Partita finita!', 'Hai esaminato tutti gli oggetti.', [
      { text: 'Rigioca', onPress: () => setKey(prev => prev + 1) },
      { text: 'Esci', onPress: () => router.back() }
    ]);
  };

  const renderCard = (item: Item) => {
    return (
      <View style={styles.card}>
        <Ionicons name={item.icon} size={120} color="#333333" />
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
        <Text style={styles.headerTitle}>Il Trovarobe</Text>
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
              title: 'STORICO',
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
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333333',
    marginTop: 40,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  neobrutalPress: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
});
