import { useActionSheet } from '@expo/react-native-action-sheet';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import * as Crypto from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Animated, Easing, Keyboard, KeyboardAvoidingView, LayoutChangeEvent, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import Google from '../../assets/images/Google.svg';
import SignInBox from '../../components/Sign_in_box.svg';
import { saveSession } from '../../utils/session';


const MIN_PASSWORD_LENGTH = 8;

// Validation schema for sign-in form using Zod
const signInSchema = z.object({
    email: z
      .string()
      .min(1, { message: 'Email is required' })
      .email({ message: 'Enter a valid email address' }),
    password: z
      .string()
      .min(1, { message: 'Password is required' })
      .refine(p => !p.includes(' '), { message: 'Password cannot contain spaces' }),
  });
type SignInForm = z.infer<typeof signInSchema>;

// Validation schema for sign-up form using Zod
const signUpSchema = z.object({
  fname: z
    .string().min(1, { message: 'First name is required' }),
  lname: z
    .string().min(1, { message: 'Last name is required' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` })
    .refine(p => !p.includes(' '), { message: 'Password cannot contain spaces' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Please confirm your password' }),
  pnumber: z
    .string()
    .min(1, { message: 'Phone number is required' })
    .regex(/^\+?[\d\s\-()]{7,15}$/, { message: 'Enter a valid phone number' }),
  birthdate: z
    .string()
    .min(1, { message: 'Birth date is required' }),
  officialIdUri: z
    .string()
    .min(1, { message: 'Please upload your National ID' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords Do Not Match",
    path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

const passwordStrengthCheck = (pass: string): { score: number; label: string; color: string; hint: string } => {
  if(!pass) return { score: 0, label: '', color: 'transparent', hint: '' };
  if(pass.includes(' ') || pass.length < MIN_PASSWORD_LENGTH){
    return { score: 1, label: 'Weak', color: '#D64545', hint: `Use at least ${MIN_PASSWORD_LENGTH} characters with no spaces` };
  } 

  const hasUpper = /[A-Z]/.test(pass);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);

  if(hasUpper && hasSpecial) {
    return {score: 4, label: 'Strong', color: '#10B981', hint: ''};
  }
  if(hasUpper || hasSpecial) {
    return {score: 3, label: 'Good', color: '#3B82F6', hint: hasUpper ? `Add a special character for stronger password` : `Add an uppercase letter for stronger password`};
  }
  return {score: 2, label: 'Fair', color: '#F59E0B', hint: `Add uppercase letters or special characters to strengthen it`};
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

export default function UserAuthScreen() {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const { width: screenWidth } = useWindowDimensions();
  const signInBoxHeight = screenWidth * (377 / 402);

  // ── Sign In fields ──
  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isChecked, setChecked] = useState(false);

  // ── Sign Up fields ──
  const {
    control: signUpControl,
    handleSubmit: signUpHandleSubmit,
    reset: signUpReset,
    clearErrors: signUpClearErrors,
    setValue: signUpSetValue,
    watch: signUpWatch,
    formState: { errors: signUpErrors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fname: '',
      lname: '',
      email: '',
      password: '',
      confirmPassword: '',
      pnumber: '',
      birthdate: '',
      officialIdUri: '',
    },
  });
  const birthdate = signUpWatch('birthdate');
  const officialIdUri = signUpWatch('officialIdUri');
  const [isSignUpPasswordVisible, setIsSignUpPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // General Error
  const [generalError, setGeneralError] = useState('');

  const router = useRouter();
  const db = useSQLiteContext();

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
  
  // ── Handlers ──
  const handleSignIn = async (data: SignInForm) => {
    setGeneralError('');
    try{
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data.password
      );
      const user: any = await db.getFirstAsync(
        'SELECT * FROM Users WHERE email = ? AND password = ?;',
        [data.email, hashedPassword]
      );
      if(!user){
        setGeneralError('Invalid email or password');
        return;
      }
      if(isChecked){
        await saveSession({ id: user.id, email: user.email, fname: user.Fname });
      }
      router.replace('/(tabs)');
    } catch (error) {
      setGeneralError('Something went wrong. Please try again.');
    }
  };

  const handleSignUp = async (data: SignUpForm) => {
    setGeneralError('');
    try{
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        data.password
      );
      const existingUser: any = await db.getFirstAsync(
        'SELECT * FROM Users WHERE email = ?;',
        [data.email]
      );
      if (existingUser) {
        setGeneralError('An account with this email already exists');
        return;
      }
      const id = Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO Users (id, Fname, Lname, email, password, Pnum, DOB, nat_id_pic_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [id, data.fname, data.lname, data.email, hashedPassword, data.pnumber, data.birthdate, data.officialIdUri]
      );
      await saveSession({ id, email: data.email, fname: data.fname });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign up error:', error);
      setGeneralError('Something went wrong. Please try again.');
    }
  };

  const submitSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const values = watch();
    if (!values.email.trim() && !values.password.trim()) {
      clearErrors();
      setGeneralError('All fields are required');
      return;
    }

    setGeneralError('');
    handleSubmit(handleSignIn)();
  };

  const submitSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const values = signUpWatch();
    const allEmpty =
      !values.fname.trim() &&
      !values.lname.trim() &&
      !values.email.trim() &&
      !values.password &&
      !values.confirmPassword &&
      !values.pnumber.trim() &&
      !values.birthdate &&
      !values.officialIdUri;

    if (allEmpty) {
      signUpClearErrors();
      setGeneralError('All fields are required');
      return;
    }

    setGeneralError('');
    signUpHandleSubmit(handleSignUp)();
  };

  const { showActionSheetWithOptions } = useActionSheet();
  const imagePicker = () => {
  showActionSheetWithOptions(
      {
        options: ['Photo Library', 'Take Photo', 'Choose file', 'Cancel'],
        cancelButtonIndex: 3,
        title: 'Upload National ID',
      },
      async (selectedIndex) => {
        switch (selectedIndex) {
          case 0: // Photo Library
            const libPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!libPermission.granted) return;
            const libResult = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });
            if (!libResult.canceled) {
              signUpSetValue('officialIdUri', libResult.assets[0].uri, { shouldValidate: true, shouldDirty: true });
              signUpClearErrors('officialIdUri');
            }
            break;

          case 1: // Take Photo
            const camPermission = await ImagePicker.requestCameraPermissionsAsync();
            if (!camPermission.granted) return;
            const camResult = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 1,
            });
            if (!camResult.canceled) {
              signUpSetValue('officialIdUri', camResult.assets[0].uri, { shouldValidate: true, shouldDirty: true });
              signUpClearErrors('officialIdUri');
            }
            break;

          case 2: // Choose file
            const fileResult = await DocumentPicker.getDocumentAsync({
              type: ['image/*', 'application/pdf'],
              copyToCacheDirectory: true,
            });
            if (!fileResult.canceled) {
              signUpSetValue('officialIdUri', fileResult.assets[0].uri, { shouldValidate: true, shouldDirty: true });
              signUpClearErrors('officialIdUri');
            }
            break;

          case 3: // Cancel
            break;
        }
      }
    );
  };

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const datePicker = (event: any, selectedDate?: Date) => {
    setShowPicker(false);

    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }
    const currentDate = selectedDate || date;
    setDate(currentDate);
    signUpSetValue('birthdate', formatDate(currentDate), { shouldValidate: true, shouldDirty: true });
    signUpClearErrors('birthdate');
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
    if (tab === 'signin') {
      reset();
      clearErrors();
      setGeneralError('');
      setIsPasswordVisible(false);
    }

    // ── Reset Sign up form states ──
    else {
      signUpReset();
      signUpClearErrors();
      setGeneralError('');
      setIsSignUpPasswordVisible(false);
      setIsConfirmPasswordVisible(false);
    }

    // ── Animate Tab Transition ──
    Animated.timing(formAnim, {
      toValue: tab === 'signin' ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease),
    }).start();

    setShowPicker(false);
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
            {Platform.OS === 'ios'? (
              <View style={StyleSheet.absoluteFillObject}>
                <SignInBox style={{ alignSelf: 'center' }} />
              </View>
            ) : (
              <View style={{...StyleSheet.absoluteFillObject}}>
                <SignInBox width={screenWidth} height={signInBoxHeight} preserveAspectRatio="none" />
              </View>
            )}
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
                {Platform.OS === 'ios' ? (
                  <SignInBox style={{ alignSelf: 'center' }} />
                ) : (
                  <SignInBox width={screenWidth} height={signInBoxHeight} preserveAspectRatio="none" />
                )}
              </View>

              <View style={{ flex: 1 }}>

                {/* ── SIGN UP FORM ── */}
                <Animated.ScrollView
                  pointerEvents={activeTab === 'signup' ? 'auto' : 'none'}
                  style={[styles.signUpScrollLayer, { opacity: signUpOpacity, zIndex: activeTab === 'signup' ? 2 : 1 }]}
                  contentContainerStyle={[styles.signUpScrollContent, {paddingTop: 65}]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces
                  alwaysBounceVertical
                >
                  <View>
                    {/* First Name */}
                    <View style={{...styles.fieldContainer, paddingTop: 20}}>
                      {generalError ? (
                        <Text style={styles.fieldErrorSlot}>{generalError}</Text>
                      ) : null}
                      {signUpErrors.fname && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.fname?.message}</Text>
                      )}
                      <Controller
                        control={signUpControl}
                        name="fname"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            placeholder="First Name"
                            style={[styles.input, styles.noTopMargin]}
                            placeholderTextColor="#8A84CE"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              if (generalError) setGeneralError('');
                            }}
                            autoCorrect={false}
                            ref={null}
                            returnKeyType="next"
                            onSubmitEditing={() => LnameInputRef.current?.focus()}
                          />
                        )}
                      />
                    </View>

                    {/* Last Name */}
                    <View style={styles.fieldContainer}>
                      {signUpErrors.lname && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.lname.message}</Text>
                      )}
                      <Controller
                        control={signUpControl}
                        name="lname"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            placeholder="Last Name"
                            style={[styles.input, styles.noTopMargin]}
                            placeholderTextColor="#8A84CE"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              if (generalError) setGeneralError('');
                            }}
                            autoCorrect={false}
                            ref={LnameInputRef}
                            returnKeyType="next"
                            onSubmitEditing={() => SuEmailInputRef.current?.focus()}
                          />
                        )}
                      />
                    </View>

                    {/* Email */}
                    <View style={styles.fieldContainer}>
                      {signUpErrors.email && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.email.message}</Text>
                      )}
                      <Controller
                        control={signUpControl}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            placeholder="Email"
                            style={[styles.input, styles.noTopMargin]}
                            placeholderTextColor="#8A84CE"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              if (generalError) setGeneralError('');
                            }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            ref={SuEmailInputRef}
                            returnKeyType="next"
                            onSubmitEditing={() => PnumInputRef.current?.focus()}
                          />
                        )}
                      />
                    </View>

                    {/* Birth Date + National ID row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', alignSelf: 'center', marginTop: 12, alignItems: 'flex-end' }}>
  
                    {/* Birth Date Column */}
                    <View style={{ width: '48%' }}>
                      {signUpErrors.birthdate && (
                        <Text style={[styles.fieldErrorSlot, { width: '100%', marginLeft: 0, minHeight: 0, marginBottom: 4 }]}>
                          {signUpErrors.birthdate.message}
                        </Text>
                      )}
                      <TouchableOpacity onPress={() => setShowPicker(true)}>
                        <View style={[styles.pickers, { justifyContent: 'space-between', width: '100%', flexDirection: 'row', borderColor: signUpErrors.birthdate ? '#D64545' : '#CECCD6', borderWidth: 1 }]}>
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
                                onPress={() => { signUpSetValue('birthdate', formatDate(date), { shouldValidate: true, shouldDirty: true }); signUpClearErrors('birthdate'); setShowPicker(false); }}
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
                      {signUpErrors.officialIdUri && (
                        <Text style={[styles.fieldErrorSlot, { width: '100%', marginLeft: 0, minHeight: 0, marginBottom: 4 }]}>
                          {signUpErrors.officialIdUri?.message}
                        </Text>
                      )}
                      <TouchableOpacity onPress={imagePicker}>
                        <View style={[styles.pickers, { justifyContent: 'space-between', width: '100%', flexDirection: 'row', borderColor: signUpErrors.officialIdUri? '#D64545' : '#CECCD6', borderWidth: 1 }]}>
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
                      {signUpErrors.pnumber && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.pnumber.message}</Text>
                      )}
                      <Controller
                        name="pnumber"
                        control={signUpControl}
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            placeholder="Phone Number"
                            style={[styles.input, styles.noTopMargin]}
                            placeholderTextColor="#8A84CE"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              if (generalError) setGeneralError('');
                            }}
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            autoCorrect={false}
                          />
                        )}
                      />
                    </View>

                    {/* Password */}
                    <View style={styles.fieldContainer}>
                      {signUpErrors.password && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.password.message}</Text>
                      )}
                      <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                        <Controller
                          name="password"
                          control={signUpControl}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              placeholder="Password"
                              style={[styles.input, styles.passwordInput, styles.noTopMargin]}
                              placeholderTextColor="#8A84CE"
                              value={value}
                              onChangeText={(text) => {
                                onChange(text);
                                if (generalError) setGeneralError('');
                              }}
                              onBlur={onBlur}
                              ref={SuPasswordInputRef}
                              returnKeyType="done"
                              onSubmitEditing={() => ConfirmPasswordInputRef.current?.focus()}
                              secureTextEntry={!isSignUpPasswordVisible}
                              autoCorrect={false}
                            />
                          )}
                        />
                        <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsSignUpPasswordVisible(!isSignUpPasswordVisible)} hitSlop={10}>
                          <Ionicons name={isSignUpPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {/* Password Strength Bar */}
                    <StrengthBar password={signUpWatch('password')} />
                    {/* Confirm Password */}
                    <View style={styles.fieldContainer}>
                      {signUpErrors.confirmPassword && (
                        <Text style={styles.fieldErrorSlot}>{signUpErrors.confirmPassword.message}</Text>
                      )}
                      <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                        <Controller
                          name="confirmPassword"
                          control={signUpControl}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              placeholder="Confirm Password"
                              style={[styles.input, styles.passwordInput, styles.noTopMargin]}
                              placeholderTextColor="#8A84CE"
                              value={value}
                              onChangeText={(text) => {
                                onChange(text);
                                if (generalError) setGeneralError('');
                              }}
                              onBlur={onBlur}
                              ref={ConfirmPasswordInputRef}
                              returnKeyType="done"
                              onSubmitEditing={submitSignUp}
                              secureTextEntry={!isConfirmPasswordVisible}
                              autoCorrect={false}
                            />
                          )}
                        />
                        <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} hitSlop={10}>
                          <Ionicons name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <TouchableOpacity style={styles.ButtonBox} onPress={submitSignUp}>
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
                <Animated.ScrollView
                  pointerEvents={activeTab === 'signin' ? 'auto' : 'none'}
                  style={[styles.signInScrollLayer, { opacity: signInOpacity, zIndex: activeTab === 'signin' ? 2 : 1 }]}
                  contentContainerStyle={[styles.signInScrollContent, {paddingTop: 65}]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  bounces
                  alwaysBounceVertical
                >
                  <View style={{...styles.fieldContainer, paddingTop: 20}}>
                    {generalError && (
                      <Text style={styles.fieldErrorSlot}>{generalError}</Text>
                    )}
                    {errors.email && (
                      <Text style={styles.fieldErrorSlot}>{errors.email?.message}</Text>
                    )}
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          placeholder="Email"
                          style={[styles.input, styles.noTopMargin]}
                          placeholderTextColor="#8A84CE"
                          value={value}
                          onChangeText={(text) => {
                            onChange(text);
                            if (generalError) setGeneralError('');
                          }}
                          onBlur={onBlur}
                          ref={EmailInputRef}
                          returnKeyType="next"
                          onSubmitEditing={() => PasswordInputRef.current?.focus()}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      )}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    {errors.password && (
                      <Text style={styles.fieldErrorSlot}>{errors.password?.message}</Text>
                    )}
                    <View style={[styles.passwordFieldContainer, styles.noTopMargin]}>
                      <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                          <TextInput
                            placeholder="Password"
                            style={[styles.input, styles.passwordInput, styles.noTopMargin]}  // ← noTopMargin
                            placeholderTextColor="#8A84CE"
                            value={value}
                            onChangeText={(text) => {
                              onChange(text);
                              if (generalError) setGeneralError('');
                            }}
                            onBlur={onBlur}
                            ref={PasswordInputRef}
                            returnKeyType="done"
                            onSubmitEditing={submitSignIn}
                            secureTextEntry={!isPasswordVisible}
                            autoCorrect={false}
                            autoCapitalize="none"
                          />
                        )}
                      />
                      <TouchableOpacity style={styles.passwordToggle} onPress={() => setIsPasswordVisible(!isPasswordVisible)} hitSlop={10}>
                        <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#8A84CE" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.checkboxContainer}>
                    <Checkbox style={styles.checkboxBox} value={isChecked} onValueChange={setChecked} color="#5C5C6E" />
                    <Text style={{ marginLeft: 8, fontFamily: 'Jakarta-Bold', color: '#5C5C6E', fontSize: 16 }}>Remember me</Text>
                  </View>

                  <TouchableOpacity style={styles.ButtonBox} onPress={submitSignIn}>
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
                </Animated.ScrollView>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  pickerBox: {
    backgroundColor: '#fff',
    borderRadius: 35,
    padding: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  doneButton: {
    backgroundColor: '#B85A9A',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 10,
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
  signInScrollLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  signInScrollContent: {
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
    zIndex: 4,
  },
  headerContent: {
    zIndex: 5,
    elevation: 4,
  },
});