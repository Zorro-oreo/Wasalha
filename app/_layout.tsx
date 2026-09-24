import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { SplashScreen, Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { init_Location_Tables } from "../db/locations";
import { init_Payment_Tables } from "../db/payments";
import { init_User_Tables } from "../db/user_data";
SplashScreen.preventAutoHideAsync();

async function migrateDbIfNeeded(db: any) {
  await init_User_Tables(db);
  await init_Location_Tables(db);
  await init_Payment_Tables(db);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Jakarta-Regular": PlusJakartaSans_400Regular,
    "Jakarta-Bold": PlusJakartaSans_700Bold,
    "Jakarta-ExtraBold": PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (!loaded && !error) return;
    SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ActionSheetProvider>
      <Suspense
        fallback={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#B85A9A" />
          </View>
        }
      >
        <SQLiteProvider
          databaseName="Wasalha.db"
          onInit={migrateDbIfNeeded}
          useSuspense
        >
          <Stack screenOptions={{ headerShown: false, animation: "none" }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </ActionSheetProvider>
  );
}
