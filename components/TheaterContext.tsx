import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface Theater {
  id: string;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  color: string;
  icon?: string;
}

export const THEATERS: Theater[] = [
  {
    id: 'petruzzelli',
    name: 'Teatro Petruzzelli',
    coordinate: { latitude: 41.123479, longitude: 16.872544 },
    color: '#FF5252',
  },
  {
    id: 'margherita',
    name: 'Teatro Margherita',
    coordinate: { latitude: 41.12636, longitude: 16.87271 },
    color: '#448AFF',
  },
  {
    id: 'piccinni',
    name: 'Teatro Piccinni',
    coordinate: { latitude: 41.12578, longitude: 16.86747 },
    color: '#7C4DFF',
  },
  {
    id: 'kursaal',
    name: 'Teatro Kursaal Santalucia',
    coordinate: { latitude: 41.123776, longitude: 16.87575 },
    color: '#66BB6A',
  },
];

// Distance threshold for unlocking in meters (150 meters)
export const UNLOCK_DISTANCE_METERS = 150;

interface TheaterContextType {
  location: Location.LocationObject | null;
  simulatedCoordinate: { latitude: number; longitude: number } | null;
  setSimulatedCoordinate: (coord: { latitude: number; longitude: number } | null) => void;
  unlockedTheaterIds: string[];
  unlockTheater: (id: string) => void;
  getDistanceToTheater: (theater: Theater) => number | null;
  isTheaterLocked: (theaterId: string) => boolean;
  errorMsg: string | null;
}

const TheaterContext = createContext<TheaterContextType | undefined>(undefined);

export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // In meters
}

export const TheaterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [simulatedCoordinate, setSimulatedCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [unlockedTheaterIds, setUnlockedTheaterIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Monitor location in real time
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Initial position
      try {
        let initialLoc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(initialLoc);
      } catch (err) {
        console.log('Error getting initial location:', err);
      }

      // Realtime watch
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setLocation(newLocation);
          }
        );
      } catch (err) {
        console.log('Error starting location watch:', err);
      }
    })();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Determine current active coordinate (simulated or real GPS)
  const getActiveCoordinate = () => {
    if (simulatedCoordinate) {
      return simulatedCoordinate;
    }
    if (location?.coords) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    }
    return null;
  };

  // Get distance from user/simulated position to theater
  const getDistanceToTheater = (theater: Theater): number | null => {
    const activeCoord = getActiveCoordinate();
    if (!activeCoord) return null;

    return getDistanceInMeters(
      activeCoord.latitude,
      activeCoord.longitude,
      theater.coordinate.latitude,
      theater.coordinate.longitude
    );
  };

  // Check if theater is locked
  const isTheaterLocked = (theaterId: string): boolean => {
    // If it is in the session unlocked list, it's permanently unlocked
    if (unlockedTheaterIds.includes(theaterId)) {
      return false;
    }

    const theater = THEATERS.find((t) => t.id === theaterId);
    if (!theater) return true;

    const distance = getDistanceToTheater(theater);
    if (distance === null) return true;

    // If within unlock threshold, unlock it dynamically
    return distance > UNLOCK_DISTANCE_METERS;
  };

  // Function to unlock a theater manually (e.g. session-persistent once unlocked)
  const unlockTheater = (id: string) => {
    if (!unlockedTheaterIds.includes(id)) {
      setUnlockedTheaterIds((prev) => [...prev, id]);
    }
  };

  // Automatically unlock theaters when proximity check passes
  useEffect(() => {
    THEATERS.forEach((theater) => {
      const distance = getDistanceToTheater(theater);
      if (distance !== null && distance <= UNLOCK_DISTANCE_METERS) {
        if (!unlockedTheaterIds.includes(theater.id)) {
          setUnlockedTheaterIds((prev) => [...prev, theater.id]);
        }
      }
    });
  }, [location, simulatedCoordinate, unlockedTheaterIds]);

  return (
    <TheaterContext.Provider
      value={{
        location,
        simulatedCoordinate,
        setSimulatedCoordinate,
        unlockedTheaterIds,
        unlockTheater,
        getDistanceToTheater,
        isTheaterLocked,
        errorMsg,
      }}
    >
      {children}
    </TheaterContext.Provider>
  );
};

export const useTheater = () => {
  const context = useContext(TheaterContext);
  if (context === undefined) {
    throw new Error('useTheater must be used within a TheaterProvider');
  }
  return context;
};
