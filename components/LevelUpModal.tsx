import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheater } from './TheaterContext';

export function LevelUpModal() {
  const { levelUpData, clearLevelUpData } = useTheater();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (levelUpData) {
      // Reset
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      // Animate
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [levelUpData]);

  if (!levelUpData) return null;

  return (
    <Modal transparent visible={!!levelUpData} animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContent, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.title}>Congratulazioni!</Text>
          <Text style={styles.subtitle}>Sei arrivato al Livello {levelUpData.level}</Text>

          {levelUpData.badges && levelUpData.badges.length > 0 && (
            <View style={styles.badgeContainer}>
              <View style={styles.badgeCircle}>
                <FontAwesome5 name="medal" size={48} color="#FFC107" />
              </View>
              <Text style={styles.badgeText}>Nuovo Badge: {levelUpData.badges[0]}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.closeButton} onPress={clearLevelUpData}>
            <Text style={styles.closeButtonText}>Continua</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF9E6',
    width: '80%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF7F50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFE0B2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#333',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
