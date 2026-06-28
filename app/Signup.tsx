import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
    return (
        <SafeAreaView style={styles.titleContainer}>
            <Stack.Screen options={{gestureEnabled: false}}/>
            <Text style={styles.text}>Sign Up</Text>
        
            <View style={styles.gap}/>
        
            <TextInput 
                placeholder="First Name" 
                style={styles.input} 
                placeholderTextColor="#937AA3" 
                value={fname} 
                onChangeText={setFname} 
                autoCorrect={false}/>
        
            <TextInput 
                placeholder="Last Name" 
                style={styles.input} 
                placeholderTextColor="#937AA3" 
                value={lname} 
                onChangeText={setLname} 
                autoCorrect={false}/>
        
            <TextInput 
                placeholder="Email" 
                style={styles.input} 
                placeholderTextColor="#937AA3" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none" 
                autoCorrect={false}/>
            
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center', marginRight: 80}}>
                <TouchableOpacity onPress={() => setShowPicker(true) } style={{width: '50%', marginRight: 2}}>
                    <View style={[styles.pickers, {justifyContent: 'space-between'}, {width: '97%'}, {flexDirection: 'row'}, {borderColor:'#A691B7'}, {borderWidth: 1}]}>
                        <Text 
                            style={{
                                color: birthdate ? '#372F42' : '#937AA3', 
                                fontFamily: birthdate ? 'Jakarta-Bold' : 'Jakarta-Bold', 
                                fontSize: 16, alignSelf: 'center'}}>
                            {birthdate ? birthdate : "Birth Date"}
                        </Text>
                        <Ionicons name="calendar" size={20} color={birthdate ? '#937AA3' : '#937AA3'} style={{marginLeft: 10, alignSelf: 'center'}}/>
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
                                                textColor="#76508D"/>
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
                    <View style={[styles.pickers, {justifyContent: 'space-between'}, {width: '97%'}, {flexDirection: 'row'}, {borderColor:'#A691B7'}, {borderWidth: 1}]}>
                        <Text
                            style={{
                                color: officialIdUri ? '#372F42' : '#937AA3',
                                fontFamily: officialIdUri ? 'Jakarta-Bold' : 'Jakarta-Bold',
                                fontSize: 16, alignSelf: 'center'
                            }}>
                            {officialIdUri ? 'ID Uploaded' : 'National ID'}
                        </Text>
                        <Ionicons name="image" size={20} color={officialIdUri ? '#937AA3' : '#937AA3'} style={{marginLeft: 10, alignSelf: 'center'}}/>
                    </View>
                </TouchableOpacity>
            </View>

            <TextInput 
                placeholder="Phone Number" 
                style={styles.input} 
                placeholderTextColor="#937AA3" 
                value={pnumber} 
                onChangeText={setPnumber} 
                keyboardType="phone-pad" 
                autoCorrect={false}/>
            <TextInput 
                placeholder="Password" 
                style={styles.input} 
                placeholderTextColor="#937AA3" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                autoCorrect={false}/>
            <TouchableOpacity style={styles.ButtonBox} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                <Text style={{ color: '#372F42', fontFamily: 'Jakarta-Bold', fontSize: 13, alignSelf: 'center', marginTop: 10 }}>Already have an account?</Text>
                <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10, marginLeft: 3, borderBottomWidth: 2,borderBottomColor: '#3E63D8' }} onPress={() => router.back()}>
                    <Text style={{ color: '#3E63D8', fontFamily: 'Jakarta-Bold', fontSize: 13}}>Log in</Text>
                </TouchableOpacity>
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
    color: '#372F42',
    borderWidth: 1,
    borderColor: '#A691B7'
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
    backgroundColor: '#A691B7',
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
        backgroundColor: '#A691B7',
        paddingVertical: 13,
        paddingHorizontal: 50,
        borderRadius: 15,
    }
});