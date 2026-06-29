import Checkbox from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert, Animated, LayoutChangeEvent, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SignInBox from '../components/Sign_in_box.svg';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isChecked, setChecked] = useState(false);
  const db = useSQLiteContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  const [signInLayout, setSignInLayout] = useState({ x: 0, width: 0 });
  const [signUpLayout, setSignUpLayout] = useState({ x: 0, width: 0 });

  const slideX = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;

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

  const animateTo = (layout: { x: number; width: number }) => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: layout.x, duration: 250, useNativeDriver: false }),
      Animated.timing(slideWidth, { toValue: layout.width, duration: 250, useNativeDriver: false }),
    ]).start();
  };

  const handleSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    animateTo(tab === 'signin' ? signInLayout : signUpLayout);

    if (tab === 'signup') {
      router.push('/Signup');
    }
  };

  const onSignInLayout = (e: LayoutChangeEvent) => {
    const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    setSignInLayout(layout);
    if (activeTab === 'signin') {
      slideX.setValue(layout.x);
      slideWidth.setValue(layout.width);
    }
  };

  const onSignUpLayout = (e: LayoutChangeEvent) => {
    const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    setSignUpLayout(layout);
  };

  return (
  <View style={{ flex: 1, backgroundColor: '#F5F3FB' }}>

    <View style={StyleSheet.absoluteFillObject}>
      <SignInBox style={{ alignSelf: 'center' }} />
    </View>

    <SafeAreaView style={[styles.titleContainer]}>
      <Text style={styles.text}>Sign In</Text>
      <Text style={{ color: '#F1BCDD', fontFamily: 'Jakarta-Bold', fontSize: 18, marginLeft: 30, marginTop: 10 }}>Sign in and start moving {"\n"}around!</Text>
      <View style={{...styles.outerPill, marginTop: 40}}>
        <Animated.View
          style={[
            styles.slidingPill,
            {
              left: slideX,
              width: slideWidth,
            },
          ]}
        />

        <TouchableOpacity style={styles.tab} onPress={() => handleSwitch('signin')} onLayout={onSignInLayout}>
          <Text style={[styles.tabText, activeTab === 'signin' ? styles.activeText : styles.inactiveText]}>
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab} onPress={() => handleSwitch('signup')} onLayout={onSignUpLayout}>
          <Text style={[styles.tabText, activeTab === 'signup' ? styles.activeText : styles.inactiveText]}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput placeholder="Email" style={{...styles.input, marginTop: 80}} placeholderTextColor="#8A84CE" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} />
      <TextInput placeholder="Password" style={styles.input} secureTextEntry placeholderTextColor="#8A84CE" value={password} onChangeText={setPassword} autoCapitalize="none" autoCorrect={false} />

      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkboxBox} value={isChecked} onValueChange={setChecked} color={isChecked ? '#5C5C6E' : '#5C5C6E'} />
        <Text style={{ marginLeft: 8, fontFamily: 'Jakarta-bold', color: '#5C5C6E', fontSize: 16 }}>Remember me</Text>
      </View>

      <View>
        <TouchableOpacity style={styles.ButtonBox} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </View>
);
}

const styles = StyleSheet.create({
  back:{
    position: 'absolute',
    backgroundColor: '#7600d7',
  },
  titleContainer: {
    flex: 1
  },
  text: {
    fontSize: 68,
    color: '#ffffff',
    marginLeft: 30,
    marginTop: 15,
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
    borderColor: '#CECCD6'
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
    backgroundColor: '#B85A9A',
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
  },
  outerPill: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    height: 65,
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 6,
    boxShadow: '0px 0px 0px 1px rgba(58, 49, 77, 0.2)',
  },
  slidingPill: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    backgroundColor: '#B85A9A',
    borderRadius: 36,
  },
  tab: {
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 18,
    fontFamily: 'Jakarta-Bold',
  },
  activeText: {
    color: '#ffffff',
  },
  inactiveText: {
    color: '#A8519E',
  },
});