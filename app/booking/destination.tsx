import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F3FB', alignItems: 'center', justifyContent: 'center' }}>
            <Text>Destination — Coming Soon</Text>
            <TouchableOpacity onPress={() => router.back()}>
                <Text>Back</Text>
            </TouchableOpacity>
        </View>
    );
}