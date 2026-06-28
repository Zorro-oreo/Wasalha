import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts
} from '@expo-google-fonts/plus-jakarta-sans';
import { SplashScreen, Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useEffect } from 'react';
import 'react-native-reanimated';

async function migrateDbIfNeeded(db: any) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fname TEXT NOT NULL,
      lname TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      pnumber TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      official_id TEXT NOT NULL UNIQUE
    );
  `);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Jakarta-ExtraBold': PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
  <SQLiteProvider databaseName="mydb_v2.db" onInit={migrateDbIfNeeded}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </SQLiteProvider>
  );
}
