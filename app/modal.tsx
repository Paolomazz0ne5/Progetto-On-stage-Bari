import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheater } from '../components/TheaterContext';

type Rarity = 'comune' | 'non_comune' | 'raro' | 'epico' | 'leggendario';

interface RarityConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  comune: {
    label: 'COMUNE',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    borderColor: '#90A4AE',
  },
  non_comune: {
    label: 'NON COMUNE',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  raro: {
    label: 'RARO',
    color: '#1565C0',
    bgColor: '#E3F2FD',
    borderColor: '#64B5F6',
  },
  epico: {
    label: 'EPICO',
    color: '#7B1FA2',
    bgColor: '#F3E5F5',
    borderColor: '#BA68C8',
  },
  leggendario: {
    label: 'LEGGENDARIO',
    color: '#E65100',
    bgColor: '#FFF3E0',
    borderColor: '#FFB74D',
  },
};

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconFamily: 'FontAwesome5' | 'Ionicons';
  requirementText: string;
  rarity: Rarity;
  checkUnlocked: (unlockedIds: string[]) => boolean;
}

const BADGES: BadgeItem[] = [
  {
    id: 'pioneer',
    title: 'Novizio del Sipario',
    description: 'Hai mosso i primi passi sbloccando il tuo primo teatro.',
    icon: 'compass',
    iconFamily: 'FontAwesome5',
    requirementText: 'Sblocca almeno 1 teatro storico',
    rarity: 'comune',
    checkUnlocked: (unlockedIds) => unlockedIds.length >= 1,
  },
  {
    id: 'margherita',
    title: 'Gemma del Margherita',
    description: 'Hai sbloccato lo storico teatro Margherita, sospeso sull\'acqua.',
    icon: 'water',
    iconFamily: 'Ionicons',
    requirementText: 'Avvicinati e sblocca il Teatro Margherita',
    rarity: 'non_comune',
    checkUnlocked: (unlockedIds) => unlockedIds.includes('margherita'),
  },
  {
    id: 'kursaal',
    title: 'Cavaliere del Liberty',
    description: 'Hai sbloccato la magnificenza artistica del Kursaal Santalucia.',
    icon: 'key',
    iconFamily: 'FontAwesome5',
    requirementText: 'Avvicinati e sblocca il Teatro Kursaal Santalucia',
    rarity: 'non_comune',
    checkUnlocked: (unlockedIds) => unlockedIds.includes('kursaal'),
  },
  {
    id: 'piccinni',
    title: 'Storico Municipale',
    description: 'Hai riscoperto il Teatro Piccinni, primo parlamento dell\'Italia libera.',
    icon: 'hourglass-half',
    iconFamily: 'FontAwesome5',
    requirementText: 'Avvicinati e sblocca il Teatro Piccinni',
    rarity: 'raro',
    checkUnlocked: (unlockedIds) => unlockedIds.includes('piccinni'),
  },
  {
    id: 'petruzzelli',
    title: 'Tempio della Lirica',
    description: 'Sei entrato nell\'orbita del Petruzzelli, ricostruito fedelmente com\'era.',
    icon: 'landmark',
    iconFamily: 'FontAwesome5',
    requirementText: 'Avvicinati e sblocca il Teatro Petruzzelli',
    rarity: 'raro',
    checkUnlocked: (unlockedIds) => unlockedIds.includes('petruzzelli'),
  },
  {
    id: 'explorer',
    title: 'Esploratore Barese',
    description: 'La tua passione cresce! Hai sbloccato 3 teatri storici differenti.',
    icon: 'map-marked-alt',
    iconFamily: 'FontAwesome5',
    requirementText: 'Sblocca almeno 3 teatri storici',
    rarity: 'epico',
    checkUnlocked: (unlockedIds) => unlockedIds.length >= 3,
  },
  {
    id: 'mecenate',
    title: 'Mecenate di Bari',
    description: 'La cultura non ha segreti! Hai sbloccato tutti e 4 i teatri storici della città.',
    icon: 'trophy',
    iconFamily: 'FontAwesome5',
    requirementText: 'Sblocca tutti e 4 i teatri storici',
    rarity: 'leggendario',
    checkUnlocked: (unlockedIds) => unlockedIds.length === 4,
  },
  {
    id: 'gold_collector',
    title: 'Collezionista d\'Oro',
    description: 'Sei una leggenda barese! Hai sbloccato l\'intera bacheca dei trofei.',
    icon: 'crown',
    iconFamily: 'FontAwesome5',
    requirementText: 'Sblocca tutti i trofei disponibili',
    rarity: 'leggendario',
    checkUnlocked: (unlockedIds) => unlockedIds.length === 4,
  },
];

export default function ModalScreen() {
  const router = useRouter();
  const { unlockedTheaterIds } = useTheater();

  // Calculate unlocked badges count
  const unlockedBadges = BADGES.filter(badge => badge.checkUnlocked(unlockedTheaterIds));
  const unlockedCount = unlockedBadges.length;
  const totalCount = BADGES.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Progression summary card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.trophyIconBg}>
              <FontAwesome5 name="trophy" size={32} color="#FFC107" />
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressTitle}>Bacheca delle Medaglie</Text>
              <Text style={styles.progressCount}>{unlockedCount} di {totalCount} Sbloccati ({progressPercentage}%)</Text>
            </View>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>

        {/* Badges List */}
        <View style={styles.badgesList}>
          {BADGES.map((badge) => {
            const isUnlocked = badge.checkUnlocked(unlockedTheaterIds);
            const config = RARITY_CONFIGS[badge.rarity];
            
            return (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard,
                  isUnlocked ? styles.unlockedCard : styles.lockedCard
                ]}
              >
                {/* Left side: Icon */}
                <View style={[
                  styles.iconContainer,
                  isUnlocked 
                    ? { backgroundColor: `${config.color}15`, borderColor: config.color }
                    : { backgroundColor: '#ECEFF1', borderColor: '#B0BEC5' }
                ]}>
                  {badge.iconFamily === 'FontAwesome5' ? (
                    <FontAwesome5 
                      name={badge.icon} 
                      size={24} 
                      color={isUnlocked ? config.color : '#90A4AE'} 
                    />
                  ) : (
                    <Ionicons 
                      name={badge.icon as any} 
                      size={26} 
                      color={isUnlocked ? config.color : '#90A4AE'} 
                    />
                  )}

                  {!isUnlocked && (
                    <View style={styles.lockedBadgeOverlay}>
                      <FontAwesome5 name="lock" size={9} color="#FFFFFF" />
                    </View>
                  )}
                </View>

                {/* Center: Title, Rarity & Description */}
                <View style={styles.badgeDetails}>
                  <View style={styles.titleRow}>
                    <Text style={[
                      styles.badgeTitle,
                      !isUnlocked && styles.lockedText
                    ]}>
                      {badge.title}
                    </Text>
                    <View style={[
                      styles.rarityBadge, 
                      { backgroundColor: config.bgColor, borderColor: config.borderColor }
                    ]}>
                      <Text style={[styles.rarityText, { color: config.color }]}>
                        {config.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.badgeDesc}>
                    {isUnlocked ? badge.description : badge.requirementText}
                  </Text>
                </View>

                {/* Right side: Status Label */}
                <View style={[
                  styles.statusLabel,
                  isUnlocked ? styles.unlockedStatusLabel : styles.lockedStatusLabel
                ]}>
                  <Text style={[
                    styles.statusLabelText,
                    isUnlocked ? { color: '#2E7D32' } : { color: '#455A64' }
                  ]}>
                    {isUnlocked ? 'Sbloccato' : 'Bloccato'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Text style={styles.closeButtonText}>Torna alla Mappa</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 20,
    marginBottom: 28,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFDE7',
    borderWidth: 2,
    borderColor: '#FFD54F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD54F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  progressTextContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
  },
  progressCount: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '600',
    marginTop: 2,
  },
  progressBarBackground: {
    height: 14,
    backgroundColor: '#EEEEEE',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#333333',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFC107',
    borderRadius: 7,
  },
  badgesList: {
    gap: 16,
    marginBottom: 30,
  },
  badgeCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  unlockedCard: {
    backgroundColor: '#FFFFFF',
  },
  lockedCard: {
    backgroundColor: '#ECEFF1',
    borderColor: '#78909C',
    borderBottomWidth: 4,
    opacity: 0.85,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lockedBadgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#78909C',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeDetails: {
    flex: 1,
    marginLeft: 14,
    marginRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#333333',
  },
  lockedText: {
    color: '#546E7A',
  },
  rarityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  statusLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  unlockedStatusLabel: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  lockedStatusLabel: {
    backgroundColor: '#CFD8DC',
    borderColor: '#B0BEC5',
  },
  statusLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF7043',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
