import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

const THEATERS = [
  {
    id: '1',
    name: 'Teatro Petruzzelli',
    coordinate: { latitude: 41.1235, longitude: 16.8732 },
    color: '#FF5252',
  },
  {
    id: '2',
    name: 'Teatro Margherita',
    coordinate: { latitude: 41.1264, longitude: 16.8728 },
    color: '#448AFF',
  },
  {
    id: '3',
    name: 'Teatro Piccinni',
    coordinate: { latitude: 41.1284, longitude: 16.8687 },
    color: '#7C4DFF',
  },
  {
    id: '4',
    name: 'Teatro Kursaal',
    coordinate: { latitude: 41.1238, longitude: 16.8757 },
    color: '#66BB6A',
  },
];

const INITIAL_REGION = {
  latitude: 41.1250,
  longitude: 16.8720,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const CustomMarker = ({ theater }: { theater: typeof THEATERS[0] }) => (
    <Marker coordinate={theater.coordinate}>
      <View style={styles.markerContainer}>
        <View style={styles.theaterIconContainer}>
          {/* Roof */}
          <View style={[styles.roof, { borderBottomColor: theater.color }]} />
          {/* Base */}
          <View style={styles.theaterBase}>
            <View style={styles.columnsContainer}>
              <View style={[styles.column, { backgroundColor: theater.color }]} />
              <View style={[styles.column, { backgroundColor: theater.color }]} />
              <View style={[styles.column, { backgroundColor: theater.color }]} />
            </View>
            <View style={[styles.door, { backgroundColor: '#795548' }]} />
          </View>
        </View>
        <View style={styles.markerLabelContainer}>
          <Text style={[styles.markerLabel, { color: theater.color }]}>{theater.name}</Text>
        </View>
      </View>
    </Marker>
  );

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
              <Text style={styles.userLevel}>Livello 4</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.medalButton}>
            <View style={styles.medalCircle}>
              <FontAwesome5 name="medal" size={20} color="#FFC107" />
              <View style={styles.notificationDot} />
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

      {/* Map Section */}
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={true}
          showsMyLocationButton={true}
          customMapStyle={mapStyle}
        >
          {THEATERS.map((theater) => (
            <CustomMarker key={theater.id} theater={theater} />
          ))}
        </MapView>
      </View>
    </View>
  );
}

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
    backgroundColor: '#FFF8E1', // Light yellowish background from prototype
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
  mapWrapper: {
    flex: 1,
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
    width: 60,
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
  markerLabelContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 4,
  },
  markerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});
