// app/(tabs)/settings.tsx
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings — coming soon</Text>
      <TouchableOpacity onPress={() => router.back()}>
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  );
}