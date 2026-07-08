import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts
} from '@expo-google-fonts/plus-jakarta-sans';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { init_User_Tables } from './db/user_data';
import { getSession } from './utils/session';


async function migrateDbIfNeeded(db: any) {
  await init_User_Tables();
}

export default function RootLayout() {
  const router = useRouter();
  const [loaded, error] = useFonts({
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Jakarta-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (!loaded || !error) return;
    SplashScreen.hideAsync();

    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.replace('/(tabs)/explore');
      }
    };
    checkSession();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <ActionSheetProvider>
      <SQLiteProvider databaseName="Wasalha.db" onInit={migrateDbIfNeeded}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </SQLiteProvider>
    </ActionSheetProvider>
  );
}
