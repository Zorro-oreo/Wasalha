import Checkbox from 'expo-checkbox';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const db = useSQLiteContext();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    try {
      const user: any = await db.getFirstAsync(
        'SELECT * FROM users WHERE email = ? AND password = ?;', 
        [email, password]
      );
      if (user) {
        Alert.alert('Success', 'You have successfully signed in!');
      } else {
        Alert.alert('Error', 'Invalid email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing in.');
    }
  };

  return (
    <SafeAreaView style={[styles.titleContainer]}>
      <Text style={styles.text}>Sign In</Text>
      <View style={styles.gap} />

      <TextInput placeholder="Email" style={styles.input} placeholderTextColor="#937AA3" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#937AA3" value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} />

      <View style={styles.checkboxContainer}> 
        <Checkbox style={styles.checkboxBox} value={isChecked} onValueChange={setChecked} color={isChecked ? '#372F42' : '#372F42'} />
        <Text style={{ marginLeft: 8, fontFamily: 'Jakarta-bold', color: '#372F42', fontSize: 16 }}>Remember me</Text>
      </View>
      <View>
        <TouchableOpacity style={styles.ButtonBox} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <View style={{flexDirection: 'row', alignSelf: 'center'}}>
          <Text style={{ color: '#372F42', fontFamily: 'Jakarta-Bold', fontSize: 13, alignSelf: 'center', marginTop: 15 }}>Don't have an account?</Text>
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15, marginLeft: 3, borderBottomWidth: 2,borderBottomColor: '#3E63D8' }} onPress={() => router.push('/Signup')}>
            <Text style={{ color: '#3E63D8', fontFamily: 'Jakarta-Bold', fontSize: 13}}>Create one</Text>
          </TouchableOpacity>
          </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  text: {
    fontSize: 68,
    color: '#372F42',
    alignSelf: 'center',
    marginTop: 60,
    fontFamily: 'Jakarta-Bold'
  },
  input: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'center',
    width: '80%',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Jakarta-Bold',
    borderWidth: 1,
    borderColor: '#A691B7'
  },
  gap: {
    marginBottom: 80,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 44
  },
  checkboxBox: {
    borderRadius: 6,
  },
  ButtonBox: {
    backgroundColor: '#A691B7',
    width: '85%',
    height: 65,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Jakarta-ExtraBold'
  }
});