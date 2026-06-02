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
  logo: any;
}

export const THEATERS: Theater[] = [
  {
    id: 'petruzzelli',
    name: 'Teatro Petruzzelli',
    coordinate: { latitude: 41.123479, longitude: 16.872544 },
    color: '#FF5252',
    logo: require('../assets/images/logos/petruzzelli.png'),
  },
  {
    id: 'margherita',
    name: 'Teatro Margherita',
    coordinate: { latitude: 41.12636, longitude: 16.87271 },
    color: '#448AFF',
    logo: require('../assets/images/logos/margherita.png'),
  },
  {
    id: 'piccinni',
    name: 'Teatro Piccinni',
    coordinate: { latitude: 41.12578, longitude: 16.86747 },
    color: '#7C4DFF',
    logo: require('../assets/images/logos/piccinni.png'),
  },
  {
    id: 'kursaal',
    name: 'Teatro Kursaal Santalucia',
    coordinate: { latitude: 41.123776, longitude: 16.87575 },
    color: '#66BB6A',
    logo: require('../assets/images/logos/kursaal.png'),
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
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  unlockedBadges: string[];
  completedMinigames: number[];
  claimedMissions: string[];
  claimMissionReward: (missionId: string, exp: number) => void;
  completeMission: (gameId?: number) => void;
  levelUpData: { level: number; badges: string[] } | null;
  clearLevelUpData: () => void;
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

  // Gamification States
  const [level, setLevel] = useState<number>(1);
  const [currentXP, setCurrentXP] = useState<number>(0);
  const [xpForNextLevel, setXpForNextLevel] = useState<number>(100);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [completedMinigames, setCompletedMinigames] = useState<number[]>([]);
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  
  // Overlay state
  const [levelUpData, setLevelUpData] = useState<{ level: number; badges: string[] } | null>(null);

  // Monitor theater unlocks to award XP robustly without side-effects in state updaters
  const [lastUnlockedCount, setLastUnlockedCount] = useState<number>(0);

  useEffect(() => {
    if (unlockedTheaterIds.length > lastUnlockedCount) {
      const diff = unlockedTheaterIds.length - lastUnlockedCount;
      addXP(100 * diff);
      setLastUnlockedCount(unlockedTheaterIds.length);
    }
  }, [unlockedTheaterIds, lastUnlockedCount]);

  // Function to add XP
  const addXP = (amount: number) => {
    setCurrentXP((prev) => prev + amount);
  };

  // Claim Mission Reward
  const claimMissionReward = (missionId: string, exp: number) => {
    if (!claimedMissions.includes(missionId)) {
      setClaimedMissions((prev) => [...prev, missionId]);
      addXP(exp);
    }
  };

  // Complete mission
  const completeMission = (gameId?: number) => {
    if (gameId !== undefined) {
      setCompletedMinigames((prev) => {
        if (!prev.includes(gameId)) {
          return [...prev, gameId];
        }
        return prev;
      });
    }
    addXP(20);
  };

  const clearLevelUpData = () => {
    setLevelUpData(null);
  };

  // Check Badges
  const checkBadges = () => {
    const newBadges: string[] = [];
    if (unlockedTheaterIds.length === 1 && !unlockedBadges.includes('Esploratore Principiante')) {
      newBadges.push('Esploratore Principiante');
      setUnlockedBadges((prev) => [...prev, 'Esploratore Principiante']);
    }
    return newBadges;
  };

  // Level up logic
  useEffect(() => {
    if (currentXP >= xpForNextLevel) {
      let remainingXp = currentXP;
      let newLevel = level;
      let newTarget = xpForNextLevel;

      // Handle massive XP gains that could trigger multiple level ups
      while (remainingXp >= newTarget) {
        remainingXp -= newTarget;
        newLevel += 1;
        newTarget = Math.floor(newTarget * 1.5);
      }
      
      setLevel(newLevel);
      setCurrentXP(remainingXp);
      setXpForNextLevel(newTarget);

      // Verify badges concurrently
      const newlyUnlockedBadges = checkBadges();

      // Trigger the modal
      setLevelUpData((prev) => ({
        level: newLevel,
        badges: prev?.badges ? Array.from(new Set([...prev.badges, ...newlyUnlockedBadges])) : newlyUnlockedBadges,
      }));
    }
  }, [currentXP, xpForNextLevel, level]);

  // Check badges when theaters unlock, in case it happens without leveling up
  useEffect(() => {
    const newBadges = checkBadges();
    if (newBadges.length > 0) {
      setLevelUpData((prev) => ({
        level: prev?.level || level,
        badges: prev?.badges ? Array.from(new Set([...prev.badges, ...newBadges])) : newBadges,
      }));
    }
  }, [unlockedTheaterIds]);

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
    if (unlockedTheaterIds.includes(theaterId)) {
      return false;
    }

    const theater = THEATERS.find((t) => t.id === theaterId);
    if (!theater) return true;

    const distance = getDistanceToTheater(theater);
    if (distance === null) return true;

    return distance > UNLOCK_DISTANCE_METERS;
  };

  // Function to unlock a theater manually (e.g. session-persistent once unlocked)
  const unlockTheater = (id: string) => {
    setUnlockedTheaterIds((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  // Automatically unlock theaters when proximity check passes
  useEffect(() => {
    THEATERS.forEach((theater) => {
      const distance = getDistanceToTheater(theater);
      if (distance !== null && distance <= UNLOCK_DISTANCE_METERS) {
        // Use the unlockTheater function so we get XP properly when auto-unlocking
        unlockTheater(theater.id);
      }
    });
  }, [location, simulatedCoordinate]);

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
        level,
        currentXP,
        xpForNextLevel,
        unlockedBadges,
        completedMinigames,
        claimedMissions,
        claimMissionReward,
        completeMission,
        levelUpData,
        clearLevelUpData,
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
