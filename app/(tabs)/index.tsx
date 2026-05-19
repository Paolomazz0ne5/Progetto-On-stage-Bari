import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity, Animated, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheater, THEATERS, Theater, UNLOCK_DISTANCE_METERS } from '../../components/TheaterContext';

const { width, height } = Dimensions.get('window');

const INITIAL_REGION = {
  latitude: 41.1250,
  longitude: 16.8720,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ highlightTheaterId?: string }>();
  const mapRef = useRef<MapView | null>(null);

  const {
    location,
    simulatedCoordinate,
    setSimulatedCoordinate,
    getDistanceToTheater,
    isTheaterLocked,
    unlockedTheaterIds,
    errorMsg,
    level,
    currentXP,
    xpForNextLevel,
    completeMission,
    unlockTheater,
  } = useTheater();

  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [lastUnlockedIds, setLastUnlockedIds] = useState<string[]>(unlockedTheaterIds);
  const [newlyUnlockedTheater, setNewlyUnlockedTheater] = useState<Theater | null>(null);

  // Watch for new unlocks
  useEffect(() => {
    const newId = unlockedTheaterIds.find(id => !lastUnlockedIds.includes(id));
    if (newId) {
      const theater = THEATERS.find(t => t.id === newId);
      if (theater) {
        setNewlyUnlockedTheater(theater);
      }
    }
    setLastUnlockedIds(unlockedTheaterIds);
  }, [unlockedTheaterIds, lastUnlockedIds]);

  // Pan to highlighted theater when accessed via mission link
  useEffect(() => {
    if (params.highlightTheaterId) {
      const theater = THEATERS.find((t) => t.id === params.highlightTheaterId);
      if (theater) {
        setSelectedTheater(theater);
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            ...theater.coordinate,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }, 1000);
        }
      }
    }
  }, [params.highlightTheaterId]);

  // Pan to simulated location when it becomes active
  useEffect(() => {
    if (simulatedCoordinate && mapRef.current) {
      mapRef.current.animateToRegion({
        ...simulatedCoordinate,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      }, 1000);
    }
  }, [simulatedCoordinate]);

  const CustomMarker = ({ theater }: { theater: Theater }) => {
    const isLocked = isTheaterLocked(theater.id);
    const displayColor = isLocked ? '#78909C' : theater.color;
    const doorColor = isLocked ? '#90A4AE' : '#795548';

    return (
      <Marker 
        coordinate={theater.coordinate}
        onPress={() => setSelectedTheater(theater)}
      >
        <View style={styles.markerContainer}>
          <View style={styles.theaterIconContainer}>
            {/* Roof */}
            <View style={[styles.roof, { borderBottomColor: displayColor }]} />
            {/* Base */}
            <View style={[styles.theaterBase, isLocked && styles.lockedTheaterBase]}>
              <View style={styles.columnsContainer}>
                <View style={[styles.column, { backgroundColor: displayColor }]} />
                <View style={[styles.column, { backgroundColor: displayColor }]} />
                <View style={[styles.column, { backgroundColor: displayColor }]} />
              </View>
              <View style={[styles.door, { backgroundColor: doorColor }]} />

              {/* Padlock Icon overlay inside the base if locked */}
              {isLocked && (
                <View style={styles.lockOverlay}>
                  <FontAwesome5 name="lock" size={11} color="#E53935" />
                </View>
              )}
            </View>
          </View>
          <View style={[styles.markerLabelContainer, isLocked && styles.lockedLabelContainer]}>
            <View style={styles.labelRow}>
              {isLocked && <FontAwesome5 name="lock" size={8} color="#78909C" style={{ marginRight: 4 }} />}
              <Text style={[styles.markerLabel, { color: displayColor }]}>
                {theater.name}
              </Text>
            </View>
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.userInfoRow}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <FontAwesome5 name="user-alt" size={24} color="#FF7043" />
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>Mario Rossi</Text>
              <Text style={styles.userLevel}>Livello {level}</Text>
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
            <Text style={styles.expValue}>{currentXP} / {xpForNextLevel}</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${Math.min((currentXP / xpForNextLevel) * 100, 100)}%` }]} />
          </View>
        </View>
      </View>

      {/* Location Simulation Banner */}
      {simulatedCoordinate && (
        <View style={styles.simulationBanner}>
          <View style={styles.simulationTextContainer}>
            <FontAwesome5 name="exclamation-triangle" size={14} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.simulationBannerText}>
              Simulazione di posizione attiva per il test!
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSimulatedCoordinate(null)} style={styles.resetSimButton}>
            <Text style={styles.resetSimButtonText}>Disattiva</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Map Section */}
      <View style={styles.mapWrapper}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={!simulatedCoordinate}
          showsMyLocationButton={!simulatedCoordinate}
          customMapStyle={mapStyle}
        >
          {/* Custom Simulated User Marker */}
          {simulatedCoordinate && (
            <Marker coordinate={simulatedCoordinate} title="Tu (Simulato)">
              <View style={styles.userMarkerOuter}>
                <View style={styles.userMarkerInner} />
              </View>
            </Marker>
          )}

          {THEATERS.map((theater) => (
            <CustomMarker key={theater.id} theater={theater} />
          ))}
        </MapView>

        {/* Bottom Details Card */}
        {selectedTheater && (
          <View style={[styles.detailsCard, { paddingBottom: insets.bottom + 15 }]}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>{selectedTheater.name}</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedTheater(null)}
              >
                <FontAwesome5 name="times" size={16} color="#78909C" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsBody}>
              {(() => {
                const locked = isTheaterLocked(selectedTheater.id);
                const distance = getDistanceToTheater(selectedTheater);
                
                return (
                  <>
                    <View style={styles.statusRow}>
                      <View style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: locked ? '#FFEBEE' : '#E8F5E9', 
                          borderColor: locked ? '#FFCDD2' : '#C8E6C9' 
                        }
                      ]}>
                        <FontAwesome5 
                          name={locked ? "lock" : "lock-open"} 
                          size={12} 
                          color={locked ? "#E53935" : "#43A047"} 
                        />
                        <Text style={[styles.statusText, { color: locked ? "#E53935" : "#43A047" }]}>
                          {locked ? "Teatro Bloccato" : "Teatro Sbloccato"}
                        </Text>
                      </View>
                      
                      <Text style={styles.distanceText}>
                        {distance !== null 
                          ? `Distanza: ${distance < 1000 ? `${distance.toFixed(0)} m` : `${(distance/1000).toFixed(2)} km`}`
                          : "Calcolo distanza..."}
                      </Text>
                    </View>

                    <Text style={styles.detailsDesc}>
                      {locked 
                        ? `Questo teatro è protetto perché ti trovi troppo lontano. Avvicinati a meno di ${UNLOCK_DISTANCE_METERS} metri per sbloccare i suoi minigiochi!`
                        : "Complimenti! Sei abbastanza vicino a questo teatro. Ora puoi accedere ai minigiochi dedicati!"}
                    </Text>

                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, locked && styles.disabledButton]}
                        disabled={locked}
                        onPress={() => {
                          // Close card and navigate to minigames tab
                          setSelectedTheater(null);
                          router.push({
                            pathname: '/minigiochi',
                            params: { theaterId: selectedTheater.id }
                          });
                        }}
                      >
                        <FontAwesome5 name="gamepad" size={16} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.actionButtonText}>Gioca ai Minigiochi</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.simButton,
                          simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude
                            ? styles.simActiveButton
                            : null
                        ]}
                        onPress={() => {
                          if (simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude) {
                            setSimulatedCoordinate(null);
                          } else {
                            // Simulate coordinates exactly at this theater
                            setSimulatedCoordinate(selectedTheater.coordinate);
                          }
                        }}
                      >
                        <FontAwesome5 
                          name={simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude ? "street-view" : "map-marker-alt"} 
                          size={16} 
                          color={simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude ? "#FFF" : "#FF7043"} 
                        />
                        <Text style={[
                          styles.simButtonText,
                          simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude
                            ? { color: '#FFF' }
                            : null
                        ]}>
                          {simulatedCoordinate && simulatedCoordinate.latitude === selectedTheater.coordinate.latitude
                            ? "Rimuovi Sim"
                            : "Simula Vicinanza"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        )}
      </View>

      {newlyUnlockedTheater && (
        <ScrollPopup 
          theater={newlyUnlockedTheater} 
          onClose={() => setNewlyUnlockedTheater(null)} 
        />
      )}
    </View>
  );
}

const THEATER_HISTORY_DATA: Record<string, {
  where: string;
  when: string;
  style: string;
  funFact: string;
}> = {
  kursaal: {
    where: "Bari, Largo Adua (sul lungomare).",
    when: "Inaugurato nel 1925 (riaperto nel 2021 dopo lunghi restauri).",
    style: "Mix elegante di Liberty (Art Nouveau) e Art Déco.",
    funFact: "\"Kursaal\" in tedesco significa \"Sala di cura\", un termine usato per i lussuosi saloni di ritrovo balneari del Novecento. Inoltre, all'ultimo piano nasconde la Sala Giuseppina, originariamente un appartamento privato con una spettacolare vetrata sul mare!"
  },
  petruzzelli: {
    where: "Bari, Corso Cavour (nel cuore del centro murattiano).",
    when: "Inaugurato nel 1903 (distrutto da un tragico incendio nel 1991 e riaperto nel 2009).",
    style: "Umbertino (uno stile eclettico e monumentale di fine Ottocento), inconfondibile per la sua facciata color \"rosso pompeiano\".",
    funFact: "È il quarto teatro più grande d'Italia! L'evento che ha segnato la sua storia è il devastante incendio doloso del 1991 che ne fece crollare la cupola. È stato poi fedelmente ricostruito seguendo il principio del \"com'era e dov'era\", restituendo alla città il suo simbolo dopo ben 18 anni di chiusura."
  },
  margherita: {
    where: "Bari, nel vecchio porto (Piazza IV Novembre), letteralmente circondato dal mare.",
    when: "Inaugurato nel 1914 (oggi, dopo lunghi restauri, è un polo per mostre d'arte contemporanea).",
    style: "Liberty (Art Nouveau) con influenze eclettiche e torri laterali maestose.",
    funFact: "È stato costruito interamente su pilastri immersi nell'acqua! Questo stratagemma geniale fu ideato per aggirare un accordo tra il Comune e la famiglia Petruzzelli, che vietava la costruzione di teatri concorrenti sul \"suolo\" pubblico barese. È uno dei pochissimi edifici in Europa costruiti in questo modo."
  },
  piccinni: {
    where: "Bari, Corso Vittorio Emanuele II (una delle vie più importanti del centro).",
    when: "Inaugurato nel 1854 (è in assoluto il teatro più antico di Bari!).",
    style: "Neoclassico, con la tradizionale e sfarzosa struttura a ferro di cavallo tipica del teatro \"all'italiana\".",
    funFact: "È intitolato al celebre compositore barese Niccolò Piccinni. Ma la vera chicca storica, perfetta come domanda per un quiz o un segreto da sbloccare, risale al 1944: durante la Seconda Guerra Mondiale il palcoscenico non ha ospitato artisti, ma ha accolto il primo Congresso dei Comitati di Liberazione Nazionale. Per qualche giorno, il Piccinni è stato di fatto il primo \"Parlamento\" dell'Italia libera!"
  }
};

interface ScrollPopupProps {
  theater: Theater;
  onClose: () => void;
}

const ScrollPopup: React.FC<ScrollPopupProps> = ({ theater, onClose }) => {
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const history = THEATER_HISTORY_DATA[theater.id] || {
    where: "Bari",
    when: "Storico",
    style: "Classico",
    funFact: "Un meraviglioso teatro barese."
  };

  useEffect(() => {
    Animated.spring(scrollAnim, {
      toValue: 1,
      tension: 15,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(scrollAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const scaleY = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 1],
  });

  const opacity = scrollAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.scrollOverlay}>
      <Animated.View style={[styles.scrollContainer, { transform: [{ scaleY }] }]}>
        {/* Top Roller */}
        <View style={styles.roller}>
          <View style={styles.rollerKnob} />
          <View style={styles.rollerBar} />
          <View style={styles.rollerKnob} />
        </View>

        <View style={styles.scrollPaper}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.scrollHeader}>
              <FontAwesome5 name="theater-masks" size={32} color="#D84315" />
              <Text style={styles.scrollSubtitle}>TEATRO SBLOCCATO!</Text>
              <Text style={styles.scrollTitle}>{theater.name}</Text>
            </View>

            <Animated.View style={{ opacity }}>
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
            </Animated.View>

            <TouchableOpacity style={styles.scrollButton} onPress={handleClose}>
              <Text style={styles.scrollButtonText}>Continua l'Avventura</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Bottom Roller */}
        <View style={styles.roller}>
          <View style={styles.rollerKnob} />
          <View style={styles.rollerBar} />
          <View style={styles.rollerKnob} />
        </View>
      </Animated.View>
    </View>
  );
};

const mapStyle = [
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
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
    height: 18,
    backgroundColor: '#EEEEEE',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333333',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 8,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  theaterIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 35,
    borderRightWidth: 35,
    borderBottomWidth: 25,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  theaterBase: {
    width: 60,
    height: 35,
    backgroundColor: '#FFE0B2',
    borderWidth: 2,
    borderColor: '#333',
    position: 'relative',
    marginTop: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedTheaterBase: {
    backgroundColor: '#ECEFF1',
    borderColor: '#78909C',
  },
  columnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 5,
    position: 'absolute',
    top: 5,
    bottom: 5,
  },
  column: {
    width: 6,
    height: '100%',
    borderRadius: 2,
  },
  door: {
    width: 14,
    height: 18,
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  lockOverlay: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  markerLabelContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  lockedLabelContainer: {
    borderColor: '#78909C',
    backgroundColor: '#F5F7F8',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  simulationBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF7043',
    paddingHorizontal: 15,
    paddingVertical: 8,
    zIndex: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  simulationTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  simulationBannerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resetSimButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetSimButtonText: {
    color: '#FF7043',
    fontWeight: 'bold',
    fontSize: 11,
  },
  // Custom Simulated User Location marker styles
  userMarkerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(33, 150, 243, 0.25)',
    borderWidth: 1.5,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2196F3',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  // Bottom sheet details card
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333333',
  },
  closeButton: {
    padding: 6,
    backgroundColor: '#ECEFF1',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsBody: {
    width: '100%',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#607D8B',
    fontWeight: '600',
  },
  detailsDesc: {
    fontSize: 14,
    color: '#546E7A',
    lineHeight: 20,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1.3,
    flexDirection: 'row',
    backgroundColor: '#FF7043',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    borderBottomWidth: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#B0BEC5',
    borderColor: '#78909C',
    borderBottomWidth: 5,
    opacity: 0.8,
  },
  simButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FF7043',
    borderBottomWidth: 5,
  },
  simActiveButton: {
    backgroundColor: '#26A69A',
    borderColor: '#333333',
    borderBottomWidth: 5,
  },
  simButtonText: {
    color: '#FF7043',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  scrollOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  roller: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '105%',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  rollerBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#3E2723',
    borderRadius: 6,
  },
  rollerKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#8D6E63',
    borderWidth: 2,
    borderColor: '#3E2723',
  },
  scrollPaper: {
    width: '98%',
    backgroundColor: '#F7E7CE',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3E2723',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginTop: -2,
    marginBottom: -2,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'stretch',
  },
  scrollHeader: {
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D7CCC8',
    paddingBottom: 16,
  },
  scrollSubtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#D84315',
    letterSpacing: 2,
    marginTop: 8,
  },
  scrollTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3E2723',
    textAlign: 'center',
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D84315',
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 13,
    color: '#4E342E',
    lineHeight: 18,
    fontWeight: '500',
  },
  scrollButton: {
    backgroundColor: '#8D6E63',
    borderWidth: 2,
    borderColor: '#3E2723',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  scrollButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

