import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Alert, Animated, LayoutChangeEvent, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SignUpBox from '../components/SignUpBox.svg';

export default function SignUp(){
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
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');

    const [signInLayout, setSignInLayout] = useState({ x: 0, width: 0 });
    const [signUpLayout, setSignUpLayout] = useState({ x: 0, width: 0 });

    const slideX = useRef(new Animated.Value(0)).current;
    const slideWidth = useRef(new Animated.Value(0)).current;

    const db = useSQLiteContext();

    const pickImage = async() => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(permissionResult.granted === false){
            Alert.alert('Permission Denied!', 'Allow Permission to continue.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if(!result.canceled){
            setOfficialIdUri(result.assets[0].uri);
        }
    };
    const handleDateChange = (event: any, selectedDate?: Date) => {
    if(event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    
    if (selectedDate) {
      setDate(selectedDate);
      if(Platform.OS === 'android') {
        setBirthdate(selectedDate.toLocaleDateString());
        setShowPicker(false);
      }
    }
  };
    const handleSignUp = async () => {
        if (!fname || !lname || !email || !password || !pnumber || !birthdate || !officialIdUri) {
            Alert.alert('Error', 'Please fill out all fields and upload an ID picture.');
            return;
        }
        try {
            await db.runAsync(
                `INSERT INTO users 
                (fname, lname, email, password, pnumber, birthdate, official_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?);`, 
                [fname, lname, email, password, pnumber, birthdate, officialIdUri]
            );
      
            Alert.alert('Success', 'Account created successfully!');
      
        } 
        catch (err: any) {
            Alert.alert('Database Error', err.message);
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
        animateTo(tab === 'signup' ? signUpLayout : signInLayout);

        if (tab === 'signin') {
            router.back();
        }
    };

    const onSignInLayout = (e: LayoutChangeEvent) => {
        const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
        setSignInLayout(layout);
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
        <View style={{flex: 1, backgroundColor: '#F5F3FB'}}>
            <View style={StyleSheet.absoluteFillObject}>
                <SignUpBox style={{ alignSelf: 'center' }} />
            </View>
            <SafeAreaView style={styles.titleContainer}>
                <Stack.Screen options={{gestureEnabled: false}}/>
                <Text style={styles.text}>Sign Up</Text>
                <Text style={{ color: '#F1BCDD', fontFamily: 'Jakarta-Bold', fontSize: 18, marginLeft: 30, marginTop: 10 }}>Create a new account!</Text>

                <View style={{...styles.outerPill, marginTop: 20}}>
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

                <View style={styles.gap}/>
            
                <TextInput 
                    placeholder="First Name" 
                    style={{...styles.input, marginTop: 30}} 
                    placeholderTextColor="#8A84CE" 
                    value={fname} 
                    onChangeText={setFname} 
                    autoCorrect={false}/>
            
                <TextInput 
                    placeholder="Last Name" 
                    style={styles.input} 
                    placeholderTextColor="#8A84CE" 
                    value={lname} 
                    onChangeText={setLname} 
                    autoCorrect={false}/>
            
                <TextInput 
                    placeholder="Email" 
                    style={styles.input} 
                    placeholderTextColor="#8A84CE" 
                    value={email} 
                    onChangeText={setEmail} 
                    autoCapitalize="none" 
                    autoCorrect={false}/>
                
                <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center', marginRight: 80}}>
                    <TouchableOpacity onPress={() => setShowPicker(true) } style={{width: '50%', marginRight: 2}}>
                        <View style={[styles.pickers, {justifyContent: 'space-between'}, {width: '97%'}, {flexDirection: 'row'}, {borderColor:'#CECCD6'}, {borderWidth: 1}]}>
                            <Text 
                                style={{
                                    color: birthdate ? '#372F42' : '#8A84CE', 
                                    fontFamily: birthdate ? 'Jakarta-Bold' : 'Jakarta-Bold', 
                                    fontSize: 16, alignSelf: 'center'}}>
                                {birthdate ? birthdate : "Birth Date"}
                            </Text>
                            <Ionicons name="calendar" size={20} color={birthdate ? '#8A84CE' : '#8A84CE'} style={{marginLeft: 10, alignSelf: 'center'}}/>
                        </View>

                        {showPicker && (Platform.OS === 'ios' ? (
                                <Modal transparent={true} animationType="fade">
                                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                                            <View style={styles.pickerBox}>
                                                <DateTimePicker 
                                                    value={date} 
                                                    mode="date" 
                                                    display="spinner" 
                                                    onChange={handleDateChange} 
                                                    maximumDate={new Date()} 
                                                    textColor="#8A84CE"/>
                                                <TouchableOpacity style={styles.doneButton} onPress={() => {setBirthdate(date.toLocaleDateString()); setShowPicker(false);}}>
                                                    <Text style={{ color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 16 }}>Done</Text>
                                                </TouchableOpacity>
                                            </View>
                                    </TouchableOpacity>
                                </Modal>) : (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        maximumDate={new Date()}/>))}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={pickImage} style={{width: '50%', marginLeft: 5}}>
                        <View style={[styles.pickers, {justifyContent: 'space-between'}, {width: '97%'}, {flexDirection: 'row'}, {borderColor:'#CECCD6'}, {borderWidth: 1}]}>
                            <Text
                                style={{
                                    color: officialIdUri ? '#372F42' : '#8A84CE',
                                    fontFamily: officialIdUri ? 'Jakarta-Bold' : 'Jakarta-Bold',
                                    fontSize: 16, alignSelf: 'center'
                                }}>
                                {officialIdUri ? 'ID Uploaded' : 'National ID'}
                            </Text>
                            <Ionicons name="image" size={20} color={officialIdUri ? '#8A84CE' : '#8A84CE'} style={{marginLeft: 10, alignSelf: 'center'}}/>
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
                    autoCorrect={false}/>
                <TextInput 
                    placeholder="Password" 
                    style={styles.input} 
                    placeholderTextColor="#8A84CE" 
                    value={password} 
                    onChangeText={setPassword} 
                    secureTextEntry 
                    autoCorrect={false}/>
                <TouchableOpacity style={styles.ButtonBox} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                    <Text style={{ color: '#372F42', fontFamily: 'Jakarta-Bold', fontSize: 13, alignSelf: 'center', marginTop: 15 }}>Already have an account?</Text>
                    <TouchableOpacity style={{ alignSelf: 'center', marginTop: 15, marginLeft: 3, borderBottomWidth: 2,borderBottomColor: '#3E63D8' }} onPress={() => router.back()}>
                        <Text style={{ color: '#3E63D8', fontFamily: 'Jakarta-Bold', fontSize: 13}}>Log in</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}


const styles = StyleSheet.create({
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
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center'
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
});