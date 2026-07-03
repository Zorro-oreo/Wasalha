import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Keyboard, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Google from '../assets/images/Google.svg';
import SignInBox from '../components/Sign_in_box.svg';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function UserAuthScreen() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // ── Sign In fields ──
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignInPasswordVisible, setIsSignInPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);

  // ── Sign In errors ──
  const [signInEmailError, setSignInEmailError] = useState('');
  const [signInPasswordError, setSignInPasswordError] = useState('');
  const [signInGeneralError, setSignInGeneralError] = useState('');

  // ── Sign Up fields ──
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [pnumber, setPnumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [officialIdUri, setOfficialIdUri] = useState('');

  // ── Sign Up errors ──
  const [fnameError, setFnameError] = useState('');
  const [lnameError, setLnameError] = useState('');
  const [signUpEmailError, setSignUpEmailError] = useState('');
  const [signUpPasswordError, setSignUpPasswordError] = useState('');
  const [conPasswordError, setConPasswordError] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [pnumberError, setPnumberError] = useState('');
  const [birthdateError, setBirthdateError] = useState('');
  const [officialIdError, setOfficialIdError] = useState('');
  const [signUpGeneralError, setSignUpGeneralError] = useState('');

  const router = useRouter();
  const db = useSQLiteContext();

  const MIN_PASSWORD_LENGTH = 8;
  const isEmailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  // ── Pill animation ──
  const slideX = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const hasInit = useRef(false);

  // ── Input refs ──
  const LnameInputRef = useRef<TextInput>(null);
  const SuEmailInputRef = useRef<TextInput>(null);
  const SuPasswordInputRef = useRef<TextInput>(null);
  const PnumInputRef = useRef<TextInput>(null);
  const ConfirmPasswordInputRef = useRef<TextInput>(null);
  const EmailInputRef = useRef<TextInput>(null);
  const PasswordInputRef = useRef<TextInput>(null);

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

  // ── Validation ──
  const validateSignIn = () => {
    let isValid = true;
    setSignInEmailError('');
    setSignInPasswordError('');
    setSignInGeneralError('');

    const allEmpty = !email.trim() && !password;

    if(allEmpty) {
      setSignInGeneralError('Please fill in all required fields');
      return false;
    }

    if (!email.trim()) {
      setSignInEmailError('Email is required');
      isValid = false;
    } else if (!isEmailValid(email)) {
      setSignInEmailError('Enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setSignInPasswordError('Password is required');
      isValid = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setSignInPasswordError(`Must be at least ${MIN_PASSWORD_LENGTH} characters`);
      isValid = false;
    }

    return isValid;
  };

  const validateSignUp = () => {
    let isValid = true;
    setFnameError('');
    setLnameError('');
    setSignUpEmailError('');
    setSignUpPasswordError('');
    setConPasswordError('');
    setPnumberError('');
    setBirthdateError('');
    setOfficialIdError('');
    setSignUpGeneralError('');

    const allEmpty = 
      !fname.trim() &&
      !lname.trim() &&
      !suEmail.trim() &&
      !pnumber.trim() &&
      !birthdate &&
      !officialIdUri &&
      !suPassword &&
      !confirmPassword;

    if(allEmpty) {
      setSignUpGeneralError('Please fill in all required fields');
      return false;
    }

    if (!fname.trim()) {
      setFnameError('First name is required');
      isValid = false;
    }
    if (!lname.trim()) {
      setLnameError('Last name is required');
      isValid = false;
    }
    if (!suEmail.trim()) {
      setSignUpEmailError('Email is required');
      isValid = false;
    } else if (!isEmailValid(suEmail)) {
      setSignUpEmailError('Enter a valid email address');
      isValid = false;
    }
    if (!pnumber.trim()) {
      setPnumberError('Phone number is required');
      isValid = false;
    } else if (!/^\+?[\d\s\-()]{7,15}$/.test(pnumber.trim())) {
      setPnumberError('Enter a valid phone number');
      isValid = false;
    }
    if (!birthdate) {
      setBirthdateError('Date of birth is required');
      isValid = false;
    }
    if (!officialIdUri) {
      setOfficialIdError('Please upload your National ID');
      isValid = false;
    }
    if (!suPassword) {
      setSignUpPasswordError('Password is required');
      isValid = false;
    } else if (suPassword.includes(' ')) {
      setSignUpPasswordError('Password cannot contain spaces');
      isValid = false;
    } else if (suPassword.length < MIN_PASSWORD_LENGTH) {
      setSignUpPasswordError(`Must be at least ${MIN_PASSWORD_LENGTH} characters`);
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordTouched(true);
      setConPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== suPassword) {
      setConfirmPasswordTouched(true);
      setConPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const passwordStrengthCheck = (pass: string): { score: number; label: string; color: string; hint: string } => {
    if(!pass) return { score: 0, label: '', color: 'transparent', hint: '' };
    if(pass.includes(' ') || pass.length < MIN_PASSWORD_LENGTH){
      return { score: 1, label: 'Weak', color: '#D64545', hint: 'Use at least 8 characters with no spaces' };
    } 

    const hasUpper = /[A-Z]/.test(pass);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

    if(hasUpper && hasSpecial) {
      return {score: 4, label: 'Strong', color: '#10B981', hint: ''};
    }
    if(hasUpper || hasSpecial) {
      return {score: 3, label: 'Good', color: '#3B82F6', hint: hasUpper ? 'Add a special character for stronger password' : 'Add an uppercase letter for stronger password'};
    }
    return {score: 2, label: 'Fair', color: '#F59E0B', hint: 'Add uppercase letters or special characters to strengthen it'};
  };

  const StrengthBar = ({ password }: { password: string }) => {
    const { score, label, color, hint } = passwordStrengthCheck(password);
    if (!password) return null;

    return (
      <View style={{ width: '80%', alignSelf: 'center', marginTop: 6 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i <= score ? color : '#E5E7EB',
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color, fontFamily: 'Jakarta-Bold', fontSize: 12 }}>
            {label}
          </Text>
          {hint ? (
            <Text style={{ color: '#9CA3AF', fontFamily: 'Jakarta-Bold', fontSize: 11, flex: 1, textAlign: 'right' }}>
              {hint}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  // ── Handlers ──
  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateSignIn()) return;
    try {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
      );
      const user: any = await db.getFirstAsync(
        'SELECT * FROM Users WHERE email = ? AND password = ?;',
        [email, hashedPassword]
      );
      if (user) {
        // TODO: navigate to home screen
        // router.replace('/(tabs)');
        setSignInGeneralError('');
      } else {
        setSignInGeneralError('Incorrect email or password');
      }
    } catch (error) {
      setSignInGeneralError('Something went wrong. Please try again.');
    }
  };

  const handleSignUp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!validateSignUp()) return;
    try {
      const id = Crypto.randomUUID();
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        suPassword
      );
      await db.runAsync(
        `INSERT INTO Users 
          (id, Fname, Lname, email, password, Pnum, DOB, nat_id_pic_url) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [id, fname, lname, suEmail, hashedPassword, pnumber, birthdate, officialIdUri]
      );
      // TODO: navigate to home screen or show success state
      // router.replace('/(tabs)');
      setSignUpGeneralError('');
    } catch (error: any) {
      if (error?.message?.includes('UNIQUE')) {
        setSignUpEmailError('An account with this email already exists');
      } else {
        setSignUpGeneralError('Something went wrong. Please try again.');
      }
    }
  };

  const imagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', "Allow photo access to upload your ID.");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!pickerResult.canceled) {
      setOfficialIdUri(pickerResult.assets[0].uri);
      setOfficialIdError('');
    }
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const datePicker = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setBirthdate(formatDate(currentDate));
    setBirthdateError('');
  };

  const ConPasswordHandler = (text: string) => {
    setConfirmPasswordTouched(true);
    setConfirmPassword(text);
    if (!text) {
      setConPasswordError('Please confirm your password');
    } else if (text !== suPassword) {
      setConPasswordError('Passwords do not match');
    } else {
      setConPasswordError('');
    }
  };

  // ── Pill animation logic ──
  const animateTo = (layout: { x: number; width: number }) => {
    Animated.parallel([
      Animated.timing(slideX, { toValue: layout.x, duration: 250, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
      Animated.timing(slideWidth, { toValue: layout.width, duration: 250, useNativeDriver: false, easing: Easing.out(Easing.ease) }),
    ]).start();
  };

  useEffect(() => {
    const targetLayout = activeTab === 'signin' ? signInLayout : signUpLayout;
    if (targetLayout.width === 0) return;
    if (!hasInit.current) {
      slideX.setValue(targetLayout.x);
      slideWidth.setValue(targetLayout.width);
      hasInit.current = true;
    } else {
      animateTo(targetLayout);
    }
  }, [activeTab, signInLayout, signUpLayout]);

  const onSignInLayout = (e: LayoutChangeEvent) => {
    const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    setSignInLayout(layout);
  };

  const onSignUpLayout = (e: LayoutChangeEvent) => {
    const layout = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width };
    setSignUpLayout(layout);
  };

  const handleSwitch = (tab: 'signin' | 'signup') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);

    // ── Reset Sign in form states ──
    setPassword('');
    setChecked(false);
    setSignInEmailError('');
    setSignInPasswordError('');
    setSignInGeneralError('');

    // ── Reset Sign up form (normal) states ──
    setSuPassword('');
    setConfirmPassword('');
    setConfirmPasswordTouched(false);
    setPnumber('');
    setBirthdate('');
    setDate(new Date());
    setOfficialIdUri('');

    // ── Reset Sign up form (error) states ──
    setFnameError('');
    setLnameError('');
    setSignUpEmailError('');
    setSignUpPasswordError('');
    setConPasswordError('');
    setPnumberError('');
    setBirthdateError('');
    setOfficialIdError('');
    setSignUpGeneralError('');

    // ── Animate Tab Transition ──
    Animated.timing(formAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F3FB' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={StyleSheet.absoluteFillObject}>
              <SignInBox style={{ alignSelf: 'center' }} />
            </View>

            <SafeAreaView style={styles.titleContainer} edges={['top']}>
              <View style={styles.headerContent}>
                <Text style={styles.text}>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}</Text>
                <Text style={styles.subtitle}>
                  {activeTab === 'signin' ? 'Sign in and start moving \naround!' : 'Create a new account!'}
                </Text>

                <View style={{ ...styles.outerPill, marginTop: activeTab === 'signin' ? 22 : 45 }}>
                  <Animated.View style={[styles.slidingPill, { left: slideX, width: slideWidth }]} />
                  <TouchableOpacity style={styles.tab} onLayout={onSignInLayout} onPress={() => handleSwitch('signin')}>
                    <Text style={[styles.tabText, isSignInActive ? styles.activeText : styles.inactiveText]}>Sign In</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.tab} onLayout={onSignUpLayout} onPress={() => handleSwitch('signup')}>
                    <Text style={[styles.tabText, isSignUpActive ? styles.activeText : styles.inactiveText]}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View pointerEvents="none" style={styles.svgShapeOverlay}>
                <SignInBox style={{ alignSelf: 'center' }} />
              </View>

              <View style={{ flex: 1 }}>

                {/* ── SIGN UP FORM ── */}
                <Animated.ScrollView
                  pointerEvents={activeTab === 'signup' ? 'auto' : 'none'}
                  style={[styles.signUpScrollLayer, { opacity: signUpOpacity }]}
                  contentContainerStyle={[styles.signUpScrollContent, {paddingTop: 65}]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces
                  alwaysBounceVertical
                >
                  <View>

                    {/* First Name */}
                    <View style={styles.fieldContainer}>

                        {/* General error */}
                      <Text style={styles.fieldErrorSlot}>{signUpGeneralError || fnameError || ' '}</Text>
                      <TextInput
                        placeholder="First Name"
                        style={[styles.input, styles.noTopMargin]}
                        placeholderTextColor="#8A84CE"
                        value={fname}
                        onChangeText={(text) => { setFname(text); if (fnameError) setFnameError(''); }}
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={() => LnameInputRef.current?.focus()}
                      />
                    </View>

                    {/* Last Name */}
                    <View style={styles.fieldContainer}>
                      {lnameError ? (
                          <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{lnameError}</Text>
                        ) : null}
                      <TextInput
                        placeholder="Last Name"
                        style={[styles.input, styles.noTopMargin]}
                        placeholderTextColor="#8A84CE"
                        value={lname}
                        onChangeText={(text) => { setLname(text); if (lnameError) setLnameError(''); }}
                        autoCorrect={false}
                        ref={LnameInputRef}
                        returnKeyType="next"
                        onSubmitEditing={() => SuEmailInputRef.current?.focus()}
                      />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                      {signUpEmailError ? (
                        <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{signUpEmailError}</Text>
                      ) : null}
                      <TextInput
                        placeholder="Email"
                        style={[styles.input, styles.noTopMargin]}
                        placeholderTextColor="#8A84CE"
                        value={suEmail}
                        onChangeText={(text) => { setSuEmail(text); if (signUpEmailError) setSignUpEmailError(''); }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        ref={SuEmailInputRef}
                        returnKeyType="next"
                        onSubmitEditing={() => PnumInputRef.current?.focus()}
                      />
                    </View>

                    {/* Birth Date + National ID row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center', marginTop: 12, alignItems: 'flex-end' }}>
  
                    {/* Birth Date Column */}
                    <View style={{ width: '48%' }}>
                      {birthdateError ? (
                        <Text style={[styles.fieldErrorSlot, { width: '100%', marginLeft: 0, minHeight: 0, marginBottom: 4 }]}>
                          {birthdateError}
                        </Text>
                      ) : null}
                      <TouchableOpacity onPress={() => setShowPicker(true)}>
                        <View style={[styles.pickers, { justifyContent: 'space-between', width: '100%', flexDirection: 'row', borderColor: birthdateError ? '#D64545' : '#CECCD6', borderWidth: 1 }]}>
                          <Text style={{ color: '#8A84CE', fontFamily: 'Jakarta-Bold', fontSize: 16, alignSelf: 'center' }}>
                            {birthdate ? birthdate : 'Birth Date'}
                          </Text>
                          <Ionicons name="calendar" size={20} color="#8A84CE" style={{ alignSelf: 'center' }} />
                        </View>
                      </TouchableOpacity>

                      {showPicker && (Platform.OS === 'ios' ? (
                        <Modal transparent animationType="fade">
                          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)}>
                            <View style={styles.pickerBox}>
                              <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={datePicker}
                                maximumDate={new Date()}
                                themeVariant="light"
                                textColor="#8A84CE"
                              />
                              <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => { setBirthdate(formatDate(date)); setShowPicker(false); setBirthdateError(''); }}
                              >
                                <Text style={{ color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 16 }}>Done</Text>
                              </TouchableOpacity>
                            </View>
                          </TouchableOpacity>
                        </Modal>
                      ) : (
                        <DateTimePicker value={date} mode="date" display="default" onChange={datePicker} maximumDate={new Date()} />
                      ))}
                    </View>

                    {/* National ID Column */}
                    <View style={{ width: '48%' }}>
                      {officialIdError ? (
                        <Text style={[styles.fieldErrorSlot, { width: '100%', marginLeft: 0, minHeight: 0, marginBottom: 4 }]}>
                          {officialIdError}
                        </Text>
                      ) : null}
                      <TouchableOpacity onPress={imagePicker}>
                        <View style={[styles.pickers, { justifyContent: 'space-between', width: '100%', flexDirection: 'row', borderColor: officialIdError ? '#D64545' : '#CECCD6', borderWidth: 1 }]}>
                          <Text style={{ color: '#8A84CE', fontFamily: 'Jakarta-Bold', fontSize: 16, alignSelf: 'center' }}>
                            {officialIdUri ? 'ID Uploaded ✓' : 'National ID'}
                          </Text>
                          <Ionicons name={officialIdUri ? 'checkmark-circle' : 'image'} size={20} color={officialIdUri ? '#B85A9A' : '#8A84CE'} style={{ alignSelf: 'center' }} />
                        </View>
                      </TouchableOpacity>
                    </View>

                  </View>

                    {/* Phone Number */}
                    <View style={styles.fieldContainer}>
                      {pnumberError ? (
                        <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{pnumberError}</Text>
                      ) : null}
                      <TextInput
                        placeholder="Phone Number"
                        style={[styles.input, styles.noTopMargin]}
                        placeholderTextColor="#8A84CE"
                        value={pnumber}
                        onChangeText={(text) => { setPnumber(text); if (pnumberError) setPnumberError(''); }}
                        keyboardType="phone-pad"
                        autoCorrect={false}
                        ref={PnumInputRef}
                        returnKeyType="next"
                        onSubmitEditing={() => SuPasswordInputRef.current?.focus()}
                      />
                    </View>

                    {/* Password */}
                    <View style={styles.fieldContainer}>
                      {signUpPasswordError ? (
                        <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{signUpPasswordError}</Text>
                      ) : null}
                      <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                        <TextInput
                          placeholder="Password"
                          style={[styles.input, styles.passwordInput, styles.noTopMargin]}
                          placeholderTextColor="#8A84CE"
                          value={suPassword}
                          onChangeText={(text) => {
                            setSuPassword(text);
                            if (signUpPasswordError) setSignUpPasswordError('');
                            if (confirmPasswordTouched && confirmPassword) {
                              setConPasswordError(confirmPassword === text ? '' : 'Passwords do not match');
                            }
                          }}
                          secureTextEntry={!isSignUpPasswordVisible}
                          autoCorrect={false}
                          ref={SuPasswordInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() => ConfirmPasswordInputRef.current?.focus()}
                        />
                        <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsSignUpPasswordVisible(!isSignUpPasswordVisible)} hitSlop={10}>
                          <Ionicons name={isSignUpPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Password Strength Bar */}
                    <StrengthBar password={suPassword} />
                    {/* Confirm Password */}
                    <View style={styles.fieldContainer}>
                      {confirmPasswordTouched && conPasswordError ? (
                        <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{conPasswordError}</Text>
                      ) : null}
                      <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                        <TextInput
                          placeholder="Confirm Password"
                          style={[styles.input, styles.passwordInput, styles.noTopMargin]}
                          placeholderTextColor="#8A84CE"
                          value={confirmPassword}
                          onChangeText={ConPasswordHandler}
                          secureTextEntry={!isConfirmPasswordVisible}
                          autoCorrect={false}
                          ref={ConfirmPasswordInputRef}
                          returnKeyType="done"
                          onSubmitEditing={handleSignUp}
                        />
                        <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} hitSlop={10}>
                          <Ionicons name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.ButtonBox} onPress={handleSignUp}>
                      <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                      <View style={styles.horizontalLineLeft} />
                      <Text style={styles.orText}>OR</Text>
                      <View style={styles.horizontalLineRight} />
                    </View>

                    <TouchableOpacity style={styles.AppleSignInButton} onPress={() => Alert.alert('Apple Sign In', 'This feature is not implemented yet.')}>
                      <AntDesign name="apple" size={30} color="#ffffff" />
                      <Text style={styles.ApButtonText}>Continue with Apple</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.GoogleSignInButton} onPress={() => Alert.alert('Google Sign In', 'This feature is not implemented yet.')}>
                      <Google width={30} height={30} />
                      <Text style={styles.GoButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.ScrollView>

                {/* ── SIGN IN FORM ── */}
                <Animated.View
                  pointerEvents={activeTab === 'signin' ? 'auto' : 'none'}
                  style={[styles.formLayer, { opacity: signInOpacity, paddingTop: 65 }]}
                >
                  {/* Email */}
                  <View style={styles.fieldContainer}>

                    {/* General error */}
                    <Text style={styles.fieldErrorSlot}>{signInGeneralError || signInEmailError || ' '}</Text>
                    <TextInput
                      placeholder="Email"
                      style={[styles.input, styles.noTopMargin]}
                      placeholderTextColor="#8A84CE"
                      value={email}
                      onChangeText={(text) => { setEmail(text); if (signInEmailError) setSignInEmailError(''); if (signInGeneralError) setSignInGeneralError(''); }}
                      autoCapitalize="none"
                      autoCorrect={false}
                      ref={EmailInputRef}
                      returnKeyType="next"
                      onSubmitEditing={() => PasswordInputRef.current?.focus()}
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.fieldContainer}>
                    {signInPasswordError ? (
                      <Text style={[styles.fieldErrorSlot, { marginTop: 10 }]}>{signInPasswordError}</Text>
                    ) : null}
                    <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                      <TextInput
                        placeholder="Password"
                        style={[styles.input, styles.passwordInput, styles.noTopMargin]}
                        placeholderTextColor="#8A84CE"
                        value={password}
                        onChangeText={(text) => { setPassword(text); if (signInPasswordError) setSignInPasswordError(''); if (signInGeneralError) setSignInGeneralError(''); }}
                        secureTextEntry={!isSignInPasswordVisible}
                        autoCorrect={false}
                        ref={PasswordInputRef}
                        returnKeyType="done"
                        onSubmitEditing={handleSignIn}
                      />
                      <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsSignInPasswordVisible(!isSignInPasswordVisible)} hitSlop={10}>
                        <Ionicons name={isSignInPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.checkboxContainer}>
                    <Checkbox style={styles.checkboxBox} value={isChecked} onValueChange={setChecked} color="#5C5C6E" />
                    <Text style={{ marginLeft: 8, fontFamily: 'Jakarta-Bold', color: '#5C5C6E', fontSize: 16 }}>Remember me</Text>
                  </View>

                  <TouchableOpacity style={styles.ButtonBox} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Log in</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    <View style={styles.horizontalLineLeft} />
                    <Text style={styles.orText}>OR</Text>
                    <View style={styles.horizontalLineRight} />
                  </View>

                  <TouchableOpacity style={styles.AppleSignInButton} onPress={() => Alert.alert('Apple Sign In', 'This feature is not implemented yet.')}>
                    <AntDesign name="apple" size={30} color="#ffffff" />
                    <Text style={styles.ApButtonText}>Continue with Apple</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.GoogleSignInButton} onPress={() => Alert.alert('Google Sign In', 'This feature is not implemented yet.')}>
                    <Google width={30} height={30} />
                    <Text style={styles.GoButtonText}>Continue with Google</Text>
                  </TouchableOpacity>
                </Animated.View>

              </View>
            </SafeAreaView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    fontFamily: 'Jakarta-Bold',
  },
  subtitle: {
    color: '#F1BCDD',
    fontFamily: 'Jakarta-Bold',
    fontSize: 18,
    marginLeft: 30,
    marginTop: 10,
  },
  fieldContainer: {
    width: '100%',
    marginTop: 12,
  },
  fieldErrorSlot: {
    width: '80%',
    alignSelf: 'center',
    minHeight: 18,
    marginBottom: 3,
    color: '#D64545',
    fontFamily: 'Jakarta-Bold',
    fontSize: 12,
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
    borderColor: '#CECCD6',
  },
  noTopMargin: {
    marginTop: 0,
  },
  passwordFieldContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 15,
    position: 'relative',
  },
  passwordInput: {
    width: '100%',
    marginTop: 0,
    paddingRight: 48,
  },
  passwordToggle: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
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
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'Jakarta-ExtraBold',
  },
  pickers: {
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 15,
    paddingHorizontal: 15,
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
  orText: {
    color: '#5C5C6E',
    fontFamily: 'Jakarta-Bold',
    fontSize: 14,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  horizontalLineLeft: {
    height: 1,
    backgroundColor: '#5C5C6E',
    marginVertical: 30,
    width: '38%',
    borderRadius: 10,
    borderColor: '#5C5C6E',
    borderWidth: 1,
    marginLeft: 25,
  },
  horizontalLineRight: {
    height: 1,
    backgroundColor: '#5C5C6E',
    marginVertical: 30,
    width: '38%',
    alignSelf: 'flex-end',
    borderRadius: 10,
    borderColor: '#5C5C6E',
    borderWidth: 1,
    marginRight: 25,
  },
  AppleSignInButton: {
    backgroundColor: '#000000',
    width: '75%',
    height: 60,
    borderRadius: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ApButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontFamily: 'Jakarta-ExtraBold',
    marginLeft: 10,
  },
  GoogleSignInButton: {
    backgroundColor: '#ffffff',
    width: '75%',
    height: 60,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 30,
  },
  GoButtonText: {
    color: '#5C5C6E',
    fontSize: 20,
    fontFamily: 'Jakarta-ExtraBold',
    marginLeft: 10,
  },
  signUpScrollLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  signUpScrollContent: {
    paddingBottom: 42,
  },
  formLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
  },
  svgShapeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  headerContent: {
    zIndex: 4,
    elevation: 4,
  },
  gap: {
    marginBottom: 30,
  },
});