import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { TheaterProvider } from '../components/TheaterContext';

import { LevelUpModal } from '../components/LevelUpModal';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TheaterProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="minigiochi/puzzle-margherita" options={{ headerShown: false }} />
          <Stack.Screen name="minigiochi/puzzle-kursaal" options={{ headerShown: false }} />
          <Stack.Screen name="minigiochi/quiz-kursaal" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Bacheca dei Trofei' }} />
        </Stack>
        <LevelUpModal />
        <StatusBar style="auto" />
      </ThemeProvider>
    </TheaterProvider>
  );
}

