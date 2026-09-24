// app/(tabs)/history.tsx
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
export default function HistoryScreen() {
    const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>History — coming soon</Text>
    </View>
  );
}