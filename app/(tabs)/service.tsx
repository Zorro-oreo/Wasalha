// app/(tabs)/service.tsx
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
export default function ServiceScreen() {
    const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Service — coming soon</Text>
        <TouchableOpacity onPress={() => router.back()}>
            <Text>Back</Text>
        </TouchableOpacity>
    </View>
  );
}