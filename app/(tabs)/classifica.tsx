import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheater } from '../../components/TheaterContext';

interface UserRank {
  rank: number;
  name: string;
  level: number;
  exp: number;
  isCurrentUser: boolean;
  avatar: string;
  color: string;
}

const LEADERBOARD_DATA: UserRank[] = [
  { rank: 4, name: 'Marco Colombo', level: 6, exp: 2340, isCurrentUser: false, avatar: '👦', color: '#FFE0B2' },
  { rank: 5, name: 'Mario Rossi', level: 4, exp: 1850, isCurrentUser: true, avatar: '👤', color: '#ECEFF1' },
  { rank: 6, name: 'Francesca Ricci', level: 5, exp: 1750, isCurrentUser: false, avatar: '👧', color: '#F3E5F5' },
  { rank: 7, name: 'Alessandro Neri', level: 4, exp: 1620, isCurrentUser: false, avatar: '👨', color: '#E8F5E9' },
  { rank: 8, name: 'Valeria Bruno', level: 3, exp: 1450, isCurrentUser: false, avatar: '👩', color: '#E3F2FD' },
];

export default function ClassificaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { unlockedTheaterIds } = useTheater();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.userInfoRow}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <FontAwesome5 name="user-alt" size={24} color="#FF7043" />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>Mario Rossi</Text>
              <Text style={styles.userLevel}>Livello 4</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.medalButton}
            onPress={() => router.push('/modal')}
          >
            <View style={styles.medalCircle}>
              <FontAwesome5 name="medal" size={20} color="#FFC107" />
              {unlockedTheaterIds.length > 0 && <View style={styles.notificationDot} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.expSection}>
          <View style={styles.expLabels}>
            <Text style={styles.expText}>EXP</Text>
            <Text style={styles.expValue}>1850 / 2000</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '92.5%' }]} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>CLASSIFICA</Text>
        <Text style={styles.headerSubtitle}>Compete con gli altri esploratori di Bari!</Text>

        {/* Podiums Row */}
        <View style={styles.podiumContainer}>
          {/* 2nd Place: Luca */}
          <View style={styles.podiumColumn}>
            <View style={[styles.podiumAvatarContainer, { borderColor: '#B0BEC5' }]}>
              <Text style={styles.podiumAvatarEmoji}>👦</Text>
            </View>
            <View style={[styles.podiumCard, styles.podiumSilver]}>
              <FontAwesome5 name="trophy" size={20} color="#FFFFFF" style={styles.trophyIcon} />
              <Text style={styles.podiumRankText}>2°</Text>
              <Text style={styles.podiumNameText}>Luca</Text>
              <Text style={styles.podiumExpText}>2890 EXP</Text>
            </View>
          </View>

          {/* 1st Place: Giulia */}
          <View style={[styles.podiumColumn, styles.podiumColumnGold]}>
            <Text style={styles.crownEmoji}>👑</Text>
            <View style={[styles.podiumAvatarContainer, { borderColor: '#FFCA28', width: 72, height: 72, borderRadius: 36 }]}>
              <Text style={[styles.podiumAvatarEmoji, { fontSize: 32 }]}>👩</Text>
            </View>
            <View style={[styles.podiumCard, styles.podiumGold]}>
              <FontAwesome5 name="trophy" size={24} color="#FFFFFF" style={styles.trophyIcon} />
              <Text style={[styles.podiumRankText, { fontSize: 20 }]}>1°</Text>
              <Text style={[styles.podiumNameText, { fontSize: 16 }]}>Giulia</Text>
              <Text style={[styles.podiumExpText, { fontSize: 13 }]}>3250 EXP</Text>
            </View>
          </View>

          {/* 3rd Place: Sofia */}
          <View style={styles.podiumColumn}>
            <View style={[styles.podiumAvatarContainer, { borderColor: '#8D6E63' }]}>
              <Text style={styles.podiumAvatarEmoji}>👧</Text>
            </View>
            <View style={[styles.podiumCard, styles.podiumBronze]}>
              <FontAwesome5 name="trophy" size={20} color="#FFFFFF" style={styles.trophyIcon} />
              <Text style={styles.podiumRankText}>3°</Text>
              <Text style={styles.podiumNameText}>Sofia</Text>
              <Text style={styles.podiumExpText}>2750 EXP</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardList}>
          {LEADERBOARD_DATA.map((item) => {
            return (
              <View 
                key={item.rank} 
                style={[
                  styles.listCard, 
                  item.isCurrentUser ? styles.listCardCurrentUser : styles.listCardNormal
                ]}
              >
                {/* Rank badge */}
                <View style={styles.rankBadge}>
                  <Text style={styles.rankBadgeText}>{item.rank}°</Text>
                </View>

                {/* Avatar */}
                <View style={[
                  styles.listAvatarContainer, 
                  item.isCurrentUser ? { backgroundColor: '#FFFFFF' } : { backgroundColor: item.color }
                ]}>
                  {item.isCurrentUser ? (
                    <FontAwesome5 name="user-alt" size={18} color="#FF7043" />
                  ) : (
                    <Text style={styles.listAvatarEmoji}>{item.avatar}</Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.listInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[
                      styles.listNameText, 
                      item.isCurrentUser ? styles.textWhite : styles.textDark
                    ]}>
                      {item.name}
                    </Text>
                    {item.isCurrentUser && (
                      <View style={styles.tuBadge}>
                        <Text style={styles.tuBadgeText}>TU</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[
                    styles.listLevelText, 
                    item.isCurrentUser ? styles.textWhiteOpaque : styles.textOrange
                  ]}>
                    Livello {item.level}
                  </Text>
                </View>

                {/* EXP */}
                <View style={styles.listExpContainer}>
                  <Text style={[
                    styles.listExpValue, 
                    item.isCurrentUser ? styles.textWhite : styles.textDark
                  ]}>
                    {item.exp}
                  </Text>
                  <Text style={[
                    styles.listExpLabel, 
                    item.isCurrentUser ? styles.textWhiteOpaque : styles.textGray
                  ]}>
                    EXP
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    zIndex: 10,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE0B2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF7043',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userLevel: {
    fontSize: 14,
    color: '#FF7043',
    fontWeight: '600',
  },
  medalButton: {
    padding: 2,
  },
  medalCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFF9C4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD54F',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5252',
    borderWidth: 1,
    borderColor: 'white',
  },
  expSection: {
    marginTop: 5,
  },
  expLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  expText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  expValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#EEEEEE',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7043',
    borderRadius: 6,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333333',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 30,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 32,
    width: '100%',
  },
  podiumColumn: {
    alignItems: 'center',
    width: '30%',
    marginHorizontal: '1.5%',
  },
  podiumColumnGold: {
    width: '34%',
    marginHorizontal: '1%',
  },
  crownEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  podiumAvatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    marginBottom: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  podiumAvatarEmoji: {
    fontSize: 26,
  },
  podiumCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 6,
    alignItems: 'center',
    paddingVertical: 14,
  },
  podiumGold: {
    backgroundColor: '#FFCA28',
    height: 140,
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  podiumSilver: {
    backgroundColor: '#B0BEC5',
    height: 110,
    justifyContent: 'flex-end',
    paddingBottom: 12,
  },
  podiumBronze: {
    backgroundColor: '#A1887F',
    height: 95,
    justifyContent: 'flex-end',
    paddingBottom: 10,
  },
  trophyIcon: {
    marginBottom: 6,
  },
  podiumRankText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  podiumNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  podiumExpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  leaderboardList: {
    gap: 12,
  },
  listCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
    padding: 12,
    alignItems: 'center',
  },
  listCardNormal: {
    backgroundColor: '#FFFFFF',
  },
  listCardCurrentUser: {
    backgroundColor: '#FF7043',
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#333333',
  },
  listAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 12,
  },
  listAvatarEmoji: {
    fontSize: 20,
  },
  listInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listNameText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  tuBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tuBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FF7043',
  },
  listLevelText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  listExpContainer: {
    alignItems: 'flex-end',
  },
  listExpValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  listExpLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  textWhite: {
    color: '#FFFFFF',
  },
  textDark: {
    color: '#333333',
  },
  textOrange: {
    color: '#FF7043',
  },
  textGray: {
    color: '#888888',
  },
  textWhiteOpaque: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
