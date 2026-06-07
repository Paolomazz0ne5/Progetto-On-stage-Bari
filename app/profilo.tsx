import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useTheater, THEATERS, AVATAR_PRESETS } from '../components/TheaterContext';
import { BADGES, RARITY_CONFIGS } from './modal';

const getLevelTitle = (lvl: number) => {
  if (lvl === 1) return 'Esploratore Curioso';
  if (lvl === 2) return 'Aiuto Scenografo';
  if (lvl === 3) return 'Apprendista Scenografo';
  if (lvl === 4) return 'Attore Emergente';
  if (lvl === 5) return 'Scenografo Esperto';
  if (lvl === 6) return 'Regista Teatrale';
  return "Mastro d'Onore";
};

export default function ProfiloScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    unlockedTheaterIds,
    level,
    currentXP,
    xpForNextLevel,
    completedMinigames,
    claimedMissions,
    username,
    setUsername,
    avatar,
    setAvatar,
    userEmail,
    setUserEmail,
    userPassword,
    setUserPassword,
  } = useTheater();

  // Settings Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempUsername, setTempUsername] = useState(username);
  const [tempPassword, setTempPassword] = useState(userPassword);
  const [tempAvatar, setTempAvatar] = useState(avatar);

  // Selected Badge details popup
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const activePreset = AVATAR_PRESETS.find((p) => p.id === avatar) || AVATAR_PRESETS[0];

  const handleOpenEdit = () => {
    setTempUsername(username);
    setTempPassword(userPassword);
    setTempAvatar(avatar);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = () => {
    if (!tempUsername.trim()) {
      Alert.alert('Errore', 'Il nome utente non può essere vuoto.');
      return;
    }
    if (!tempPassword.trim()) {
      Alert.alert('Errore', 'La password non può essere vuota.');
      return;
    }
    setUsername(tempUsername.trim());
    setUserPassword(tempPassword.trim());
    setAvatar(tempAvatar);
    setIsEditModalVisible(false);
    Alert.alert('Profilo Aggiornato', 'Le modifiche al tuo profilo sono state salvate con successo.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Uscita',
      'Sei sicuro di voler effettuare il logout?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive', 
          onPress: () => {
            router.replace('/login');
          } 
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Header Bar */}
      <View style={[styles.customHeader, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome5 name="arrow-left" size={16} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>IL MIO PROFILO</Text>
        <TouchableOpacity style={styles.editHeaderButton} onPress={handleOpenEdit}>
          <FontAwesome5 name="cog" size={18} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Intestazione */}
        <View style={styles.identityCard}>
          <View style={[styles.identityAvatarContainer, { backgroundColor: activePreset.bgColor, borderColor: activePreset.iconColor }]}>
            <FontAwesome5 name={activePreset.icon} size={48} color={activePreset.iconColor} />
            <TouchableOpacity style={styles.avatarEditOverlay} onPress={handleOpenEdit}>
              <FontAwesome5 name="camera" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.identityUsername}>{username}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>Livello {level} - {getLevelTitle(level)}</Text>
          </View>

          {/* XP Bar */}
          <View style={styles.xpWrapper}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>PUNTI ESPERIENZA</Text>
              <Text style={styles.xpValues}>{currentXP} / {xpForNextLevel} XP</Text>
            </View>
            <View style={styles.xpBarBackground}>
              <View style={[styles.xpBarFill, { width: `${Math.min((currentXP / xpForNextLevel) * 100, 100)}%` }]} />
            </View>
            <Text style={styles.xpRemaining}>
              Mancano {xpForNextLevel - currentXP} XP al livello successivo
            </Text>
          </View>
        </View>

        {/* 2. Statistiche Rapide */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>🏆 I TUOI TRAGUARDI</Text>
          
          <View style={styles.statsRow}>
            {/* Stat 1 */}
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{unlockedTheaterIds.length}/4</Text>
              <Text style={styles.statLabel}>Teatri Visitati</Text>
            </View>
            {/* Divider */}
            <View style={styles.verticalDivider} />
            {/* Stat 2 */}
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{claimedMissions.length}</Text>
              <Text style={styles.statLabel}>Missioni Fatte</Text>
            </View>
            {/* Divider */}
            <View style={styles.verticalDivider} />
            {/* Stat 3 */}
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{completedMinigames.length}</Text>
              <Text style={styles.statLabel}>Minigiochi Vinti</Text>
            </View>
          </View>

          {/* 4 Small Theater Icons */}
          <View style={styles.theatersGrid}>
            {THEATERS.map((t) => {
              const isUnlocked = unlockedTheaterIds.includes(t.id);
              return (
                <View key={t.id} style={styles.theaterIconOuter}>
                  <View style={[
                    styles.theaterIconCircle,
                    { borderColor: isUnlocked ? t.color : '#CFD8DC' }
                  ]}>
                    <Image
                      source={t.logo}
                      style={[styles.theaterIconImage, !isUnlocked && styles.lockedTheaterImage]}
                      contentFit="cover"
                    />
                    {!isUnlocked && (
                      <View style={styles.theaterLockOverlay}>
                        <FontAwesome5 name="lock" size={10} color="#78909C" />
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={[styles.theaterIconName, isUnlocked ? styles.textBold : styles.textLight]}>
                    {t.name.replace('Teatro ', '')}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 3. La Bacheca (Collection) */}
        <View style={styles.collectionCard}>
          <Text style={styles.sectionTitle}>🏅 LA BACHECA</Text>
          <Text style={styles.collectionSubtitle}>
            Tocca una medaglia per vedere i dettagli e come sbloccarla.
          </Text>

          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => {
              const isUnlocked = badge.checkUnlocked(unlockedTheaterIds);
              const config = RARITY_CONFIGS[badge.rarity];

              return (
                <TouchableOpacity
                  key={badge.id}
                  style={[
                    styles.badgeItemBox,
                    isUnlocked ? styles.badgeItemUnlocked : styles.badgeItemLocked,
                    isUnlocked && { borderColor: config.color }
                  ]}
                  onPress={() => setSelectedBadge({ ...badge, isUnlocked, config })}
                >
                  <View style={[
                    styles.badgeIconBg,
                    isUnlocked 
                      ? { backgroundColor: `${config.color}15` }
                      : { backgroundColor: '#ECEFF1' }
                  ]}>
                    {badge.iconFamily === 'FontAwesome5' ? (
                      <FontAwesome5
                        name={badge.icon}
                        size={20}
                        color={isUnlocked ? config.color : '#90A4AE'}
                      />
                    ) : (
                      <Ionicons
                        name={badge.icon as any}
                        size={22}
                        color={isUnlocked ? config.color : '#90A4AE'}
                      />
                    )}

                    {!isUnlocked && (
                      <View style={styles.badgeLockOverlayCircle}>
                        <FontAwesome5 name="lock" size={8} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={[styles.badgeItemTitle, !isUnlocked && styles.textLocked]}>
                    {badge.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. Azioni di Base */}
        <View style={styles.footerButtonsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleOpenEdit}>
            <FontAwesome5 name="user-edit" size={16} color="#333333" style={{ marginRight: 10 }} />
            <Text style={styles.editButtonText}>MODIFICA PROFILO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <FontAwesome5 name="sign-out-alt" size={16} color="#FFFFFF" style={{ marginRight: 10 }} />
            <Text style={styles.logoutButtonText}>ESCI (LOGOUT)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Badge Details Overlay Modal */}
      {selectedBadge && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedBadge}
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.badgeDetailModal}>
              {/* Header */}
              <View style={styles.badgeModalHeader}>
                <View style={[
                  styles.badgeModalIconContainer,
                  { 
                    borderColor: selectedBadge.isUnlocked ? selectedBadge.config.color : '#B0BEC5',
                    backgroundColor: selectedBadge.isUnlocked ? `${selectedBadge.config.color}15` : '#ECEFF1'
                  }
                ]}>
                  {selectedBadge.iconFamily === 'FontAwesome5' ? (
                    <FontAwesome5 
                      name={selectedBadge.icon} 
                      size={36} 
                      color={selectedBadge.isUnlocked ? selectedBadge.config.color : '#90A4AE'} 
                    />
                  ) : (
                    <Ionicons 
                      name={selectedBadge.icon} 
                      size={40} 
                      color={selectedBadge.isUnlocked ? selectedBadge.config.color : '#90A4AE'} 
                    />
                  )}
                </View>
                <Text style={styles.badgeModalTitle}>{selectedBadge.title}</Text>
                <View style={[
                  styles.rarityBadgeContainer,
                  { 
                    backgroundColor: selectedBadge.config.bgColor, 
                    borderColor: selectedBadge.config.borderColor 
                  }
                ]}>
                  <Text style={[styles.rarityText, { color: selectedBadge.config.color }]}>
                    {selectedBadge.config.label}
                  </Text>
                </View>
              </View>

              {/* Body */}
              <View style={styles.badgeModalBody}>
                <Text style={styles.badgeModalStatusTitle}>
                  Stato: {selectedBadge.isUnlocked ? '🔓 SBLOCCATO' : '🔒 BLOCCATO'}
                </Text>
                <Text style={styles.badgeModalDesc}>
                  {selectedBadge.isUnlocked ? selectedBadge.description : selectedBadge.requirementText}
                </Text>
              </View>

              {/* Close */}
              <TouchableOpacity 
                style={[
                  styles.badgeModalCloseButton,
                  { backgroundColor: selectedBadge.isUnlocked ? selectedBadge.config.color : '#546E7A' }
                ]} 
                onPress={() => setSelectedBadge(null)}
              >
                <Text style={styles.badgeModalCloseText}>CHIUDI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.editProfileModal}>
            <View style={styles.modalTopBar}>
              <Text style={styles.modalTopTitle}>MODIFICA PROFILO</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#FF7043" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              {/* Field 1: Username */}
              <Text style={styles.inputLabel}>Nome Utente</Text>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="user" size={16} color="#90A4AE" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={tempUsername}
                  onChangeText={setTempUsername}
                  placeholder="Inserisci il tuo nome"
                  placeholderTextColor="#B0BEC5"
                />
              </View>

              {/* Field 2: Password */}
              <Text style={styles.inputLabel}>Nuova Password</Text>
              <View style={styles.inputContainer}>
                <FontAwesome5 name="lock" size={16} color="#90A4AE" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  value={tempPassword}
                  onChangeText={setTempPassword}
                  placeholder="Inserisci nuova password"
                  placeholderTextColor="#B0BEC5"
                  secureTextEntry
                />
              </View>

              {/* Field 3: Avatar Preset Selector */}
              <Text style={styles.inputLabel}>Scegli Avatar Teatrale</Text>
              <View style={styles.avatarSelectionGrid}>
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = tempAvatar === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.avatarPresetOption,
                        { backgroundColor: preset.bgColor, borderColor: preset.iconColor },
                        isSelected && styles.avatarPresetOptionSelected
                      ]}
                      onPress={() => setTempAvatar(preset.id)}
                    >
                      <FontAwesome5 name={preset.icon} size={24} color={preset.iconColor} />
                      <Text numberOfLines={1} style={[styles.avatarPresetName, { color: preset.iconColor }]}>
                        {preset.label}
                      </Text>
                      {isSelected && (
                        <View style={styles.avatarCheckedDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setIsEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>ANNULLA</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveProfile}>
                <Text style={styles.modalSaveText}>SALVA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  customHeader: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
  },
  editHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  identityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  identityAvatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  avatarEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF7043',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  identityUsername: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  rankBadge: {
    backgroundColor: '#FF7043',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 6,
    marginBottom: 20,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  xpWrapper: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#ECEFF1',
    paddingTop: 16,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#757575',
  },
  xpValues: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  xpBarBackground: {
    height: 16,
    backgroundColor: '#EEEEEE',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333333',
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 6,
  },
  xpRemaining: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF7043',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#757575',
    marginTop: 2,
  },
  verticalDivider: {
    width: 2,
    height: 36,
    backgroundColor: '#CFD8DC',
  },
  theatersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  theaterIconOuter: {
    alignItems: 'center',
    width: '22%',
  },
  theaterIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  theaterIconImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  lockedTheaterImage: {
    opacity: 0.25,
  },
  theaterLockOverlay: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
  },
  theaterIconName: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
    color: '#333333',
  },
  textLight: {
    fontWeight: '500',
    color: '#B0BEC5',
  },
  collectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    padding: 16,
    marginBottom: 28,
  },
  collectionSubtitle: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  badgeItemBox: {
    width: '47%',
    borderWidth: 2,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeItemUnlocked: {
    backgroundColor: '#FFFFFF',
    borderColor: '#333333',
  },
  badgeItemLocked: {
    backgroundColor: '#ECEFF1',
    borderColor: '#CFD8DC',
    opacity: 0.7,
  },
  badgeIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 6,
  },
  badgeLockOverlayCircle: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: '#78909C',
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeItemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
  textLocked: {
    color: '#90A4AE',
  },
  footerButtonsContainer: {
    gap: 16,
  },
  editButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    backgroundColor: '#FFF8E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoutButton: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  badgeDetailModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#333333',
    width: '90%',
    padding: 24,
    alignItems: 'center',
  },
  badgeModalHeader: {
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#ECEFF1',
    paddingBottom: 16,
    marginBottom: 16,
  },
  badgeModalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  badgeModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 6,
  },
  rarityBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  rarityText: {
    fontSize: 9,
    fontWeight: '900',
  },
  badgeModalBody: {
    width: '100%',
    marginBottom: 24,
  },
  badgeModalStatusTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
    textAlign: 'center',
  },
  badgeModalDesc: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  badgeModalCloseButton: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeModalCloseText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editProfileModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#333333',
    width: '95%',
    maxHeight: '85%',
    padding: 20,
  },
  modalTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderColor: '#ECEFF1',
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalTopTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#333333',
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#333333',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  avatarSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginTop: 6,
  },
  avatarPresetOption: {
    width: '48%',
    borderWidth: 2,
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarPresetOptionSelected: {
    borderWidth: 3.5,
    transform: [{ scale: 1.02 }],
  },
  avatarPresetName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  avatarCheckedDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#333333',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1.5,
    borderColor: '#ECEFF1',
    paddingTop: 16,
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    backgroundColor: '#ECEFF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#546E7A',
  },
  modalSaveButton: {
    flex: 1.3,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    backgroundColor: '#FF7043',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
