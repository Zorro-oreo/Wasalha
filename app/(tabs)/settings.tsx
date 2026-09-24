// app/(tabs)/settings.tsx
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { clearSession } from '../../utils/session';
export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings — coming soon</Text>
      <TouchableOpacity onPress={() => {
        console.log('Signing out...');
        clearSession();
        router.push('/(auth)');
      }}>
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}