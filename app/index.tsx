import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert, Animated, Easing, LayoutChangeEvent, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SignInBox from '../components/Sign_in_box.svg';
import SignUpBox from '../components/SignUpBox.svg';

export default function UserAuthScreen() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pnumber, setPnumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [date, setDate] = useState(new Date()); 
  const [showPicker, setShowPicker] = useState(false);
  const [officialIdUri, setOfficialIdUri] = useState('');
  const router = useRouter();
  const db = useSQLiteContext();

  const slideX = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;

  const formAnim = useRef(new Animated.Value(0)).current;

  const signInOpacity = formAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const signUpOpacity = formAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  const isSignInActive = activeTab === 'signin';
  const isSignUpActive = activeTab === 'signup';

  const [signInLayout, setSignInLayout] = useState({ x: 0, width: 0 });
  const [signUpLayout, setSignUpLayout] = useState({ x: 0, width: 0 });

  const [isChecked, setChecked] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    try {
      const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,password);

      const user: any = await db.getFirstAsync(
        'SELECT * FROM Users WHERE email = ? AND password = ?;',
        [email, hashedPassword]
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

  const handleSignUp = async () => {
    if (!fname || !lname || !email || !password || !pnumber || !birthdate || !officialIdUri) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    try {
      const id = Crypto.randomUUID();
      const hashedPassword = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

      await db.runAsync(
        `INSERT INTO Users 
          (id, Fname, Lname, email, password, Pnum, DOB, nat_id_pic_url) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`, 
        [id, fname, lname, email, hashedPassword, pnumber, birthdate, officialIdUri]
      );
      Alert.alert('Success', 'Account created successfully!');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while signing up.');
    }
  };

  const imagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if(!pickerResult.canceled){
            setOfficialIdUri(pickerResult.assets[0].uri);
    }
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const datePicker = (event: any, selectedDate?: Date) => {
    if(event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setBirthdate(formatDate(currentDate));
  };

  const animateTo = (layout: { x: number; width: number }) => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: layout.x, duration: 250, useNativeDriver: false }),
      Animated.timing(slideWidth, { toValue: layout.width, duration: 250, useNativeDriver: false }),
    ]).start();
  };

  const handleSwitch = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    Animated.timing(formAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
    animateTo(tab === 'signin' ? signInLayout : signUpLayout);
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
    if (activeTab === 'signup') {
      slideX.setValue(layout.x);
      slideWidth.setValue(layout.width);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FB' }}>
      <View style={StyleSheet.absoluteFillObject}>
        {activeTab === 'signin' ? <SignInBox style={{ alignSelf: 'center' }} /> : <SignUpBox style={{ alignSelf: 'center' }} />}
      </View>
      <SafeAreaView style={[styles.titleContainer]}>
        <Text style={styles.text}>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
        <Text style={{ color: '#F1BCDD', fontFamily: 'Jakarta-Bold', fontSize: 18, marginLeft: 30, marginTop: 10 }}>{activeTab === 'signin' ? 'Sign in and start moving \naround!' : 'Create a new account!'}</Text>
        
        {activeTab === 'signin' ? (
          <View style={{ ...styles.outerPill, marginTop: 40 }}>
            <Animated.View style={[styles.slidingPill, { left: slideX, width: slideWidth }]} />
            <TouchableOpacity style={styles.tab} onLayout={onSignInLayout} onPress={() => handleSwitch('signin')}>
              <Text style={[styles.tabText, isSignInActive ? styles.activeText : styles.inactiveText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onLayout={onSignUpLayout} onPress={() => handleSwitch('signup')}>
              <Text style={[styles.tabText, isSignUpActive ? styles.activeText : styles.inactiveText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ ...styles.outerPill, marginTop: 20 }}>
            <Animated.View style={[styles.slidingPill, { left: slideX, width: slideWidth }]} />
            <TouchableOpacity style={styles.tab} onLayout={onSignInLayout} onPress={() => handleSwitch('signin')}>
              <Text style={[styles.tabText, isSignInActive ? styles.activeText : styles.inactiveText]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onLayout={onSignUpLayout} onPress={() => handleSwitch('signup')}>
              <Text style={[styles.tabText, isSignUpActive ? styles.activeText : styles.inactiveText]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ flex: 1 }}>
          <Animated.View pointerEvents={activeTab === 'signin' ? 'auto' : 'none'} style={[styles.formLayer, { opacity: signInOpacity }]}>
            <TextInput
              placeholder="Email"
              style={{ ...styles.input, marginTop: 80 }}
              placeholderTextColor="#8A84CE"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />
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
          </Animated.View>

          <Animated.View pointerEvents={activeTab === 'signup' ? 'auto' : 'none'} style={[styles.formLayer, { opacity: signUpOpacity }]}>
            <TextInput
              placeholder="First Name"
              style={{ ...styles.input, marginTop: 65 }}
              placeholderTextColor="#8A84CE"
              value={fname}
              onChangeText={setFname}
              autoCorrect={false}
            />

            <TextInput
              placeholder="Last Name"
              style={styles.input}
              placeholderTextColor="#8A84CE"
              value={lname}
              onChangeText={setLname}
              autoCorrect={false}
            />

            <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor="#8A84CE"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center', marginRight: 80 }}>
              <TouchableOpacity onPress={() => setShowPicker(true)} style={{ width: '50%', marginRight: 2 }}>
                <View style={[styles.pickers, { justifyContent: 'space-between' }, { width: '97%' }, { flexDirection: 'row' }, { borderColor: '#CECCD6' }, { borderWidth: 1 }]}>
                  <Text
                    style={{
                      color: birthdate ? '#372F42' : '#8A84CE',
                      fontFamily: birthdate ? 'Jakarta-Bold' : 'Jakarta-Bold',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}
                  >
                    {birthdate ? birthdate : 'Birth Date'}
                  </Text>
                  <Ionicons name="calendar" size={20} color={birthdate ? '#8A84CE' : '#8A84CE'} style={{ marginLeft: 10, alignSelf: 'center' }} />
                </View>

                {showPicker &&
                  (Platform.OS === 'ios' ? (
                    <Modal transparent animationType="fade">
                      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                        <View style={styles.pickerBox}>
                          <DateTimePicker
                            value={date}
                            mode="date"
                            display="inline"
                            onChange={datePicker}
                            maximumDate={new Date()}
                            textColor="#8A84CE"
                          />
                          <TouchableOpacity
                            style={styles.doneButton}
                            onPress={() => {
                              setBirthdate(date.toLocaleDateString());
                              setShowPicker(false);
                            }}
                          >
                            <Text style={{ color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 16 }}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    </Modal>
                  ) : (
                    <DateTimePicker value={date} mode="date" display="default" onChange={datePicker} maximumDate={new Date()} />
                  ))}
              </TouchableOpacity>

              <TouchableOpacity onPress={imagePicker} style={{ width: '50%', marginLeft: 5 }}>
                <View style={[styles.pickers, { justifyContent: 'space-between' }, { width: '97%' }, { flexDirection: 'row' }, { borderColor: '#CECCD6' }, { borderWidth: 1 }]}>
                  <Text
                    style={{
                      color: officialIdUri ? '#372F42' : '#8A84CE',
                      fontFamily: officialIdUri ? 'Jakarta-Bold' : 'Jakarta-Bold',
                      fontSize: 16,
                      alignSelf: 'center',
                    }}
                  >
                    {officialIdUri ? 'ID Uploaded' : 'National ID'}
                  </Text>
                  <Ionicons name="image" size={20} color={officialIdUri ? '#8A84CE' : '#8A84CE'} style={{ marginLeft: 10, alignSelf: 'center' }} />
                </View>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Phone Number"
              style={styles.input}
              placeholderTextColor="#8A84CE"
              value={pnumber}
              onChangeText={setPnumber}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              placeholderTextColor="#8A84CE"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.ButtonBox} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
              <Text style={{ color: '#372F42', fontFamily: 'Jakarta-Bold', fontSize: 13, alignSelf: 'center', marginTop: 15 }}>Already have an account?</Text>
              <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15, marginLeft: 3, borderBottomWidth: 2, borderBottomColor: '#3E63D8' }} onPress={() => router.back()}>
                <Text style={{ color: '#3E63D8', fontFamily: 'Jakarta-Bold', fontSize: 13 }}>Log in</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
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
    color: '#372F42',
    borderWidth: 1,
    borderColor: '#CECCD6'
  },
  gap: {
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    marginLeft: 44,
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
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Jakarta-ExtraBold'
  },
  pickers: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    width: '40%',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
    marginLeft: 40,
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Jakarta-Bold',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  pickerBox: {
      backgroundColor: '#fff',
      borderRadius: 55,
      padding: 20,
      alignItems: 'center',
      width: '90%',
  },
  doneButton: {
    backgroundColor: '#B85A9A',
    paddingVertical: 13,
    paddingHorizontal: 50,
    borderRadius: 15,
  },
  outerPill: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    height: 64,
    borderRadius: 36,
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 5,
    boxShadow: '0px 0px 0px 1px rgba(58, 49, 77, 0.2)',
  },
  slidingPill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    backgroundColor: '#B85A9A',
    borderRadius: 32,
  },
  tab: {
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 19,
    fontFamily: 'Jakarta-Bold',
  },
  activeText: {
    color: '#ffffff',
  },
  inactiveText: {
    color: '#A8519E',
  },
  formLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});