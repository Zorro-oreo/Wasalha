import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Reserve from '../../components/tabs/Calendar.svg';
import Ride from '../../components/tabs/Ride.svg';
import Scooter from '../../components/tabs/Scooter.svg';
import Search from '../../components/tabs/Search.svg';
import Search_back from '../../components/tabs/Search_back.svg';
import { getSession } from '../../utils/session';




export default function HomeScreen() {
    const router = useRouter();
    const [fname, setFname] = useState('');

    useEffect(() => {
            const loadUser = async () => {
                const session = await getSession();
                if (session?.fname) {
                    setFname(session.fname);
                }
            };
        loadUser();
    }, []);

    const searchButton = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        router.push('/booking/destination');
    };
    const { width: screenWidth } = useWindowDimensions();
    const searchBoxHeight = screenWidth * (197 / 402);

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F3FB' }}>
            <View style={{ flex: 1 }}>
                {Platform.OS === 'ios'? (
                <View style={StyleSheet.absoluteFillObject}>
                    <Search_back style={{ alignSelf: 'center' }} />
                </View>
                ) : (
                <View style={{...StyleSheet.absoluteFillObject}}>
                    <Search_back width={screenWidth} height={searchBoxHeight} preserveAspectRatio="none" />
                </View>
                )}
                <SafeAreaView style={styles.titleContainer} edges={['top']}>
                    <Text style={styles.text}>Good Morning,{fname} 👋</Text>
                    <Text style={styles.subtitle}>Where are you heading today?</Text>
                    <TouchableOpacity onPress={searchButton} style={styles.searchButtonBox}>
                        <Search style={{ marginLeft: 20 }} />
                        <Text style={{ fontFamily: 'Jakarta-Bold', color: '#5C5C6E', fontSize: 16 }}>
                            Where to?
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.servBox}>
                        <Text style={{ fontFamily: 'Jakarta-Bold', color: '#534AB7', fontSize: 20, marginLeft: 15, marginTop: 10 }}>
                            Services
                        </Text>
                        <View style={styles.servButtonAlign}>
                            <TouchableOpacity style={{...styles.servButtonBox, marginLeft: 16}} onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/booking/destination');
                            }}>
                                <View style={styles.iconBoxWide}>
                                    <Ride width="100%" height="100%" />
                                </View>
                                <Text style={{ fontFamily: 'Jakarta-Bold', color: '#534AB7', fontSize: 14, textAlign: 'center', marginTop: 2 }}>
                                    Ride
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{...styles.servButtonBox, marginLeft: 13}} onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/booking/destination');
                            }}>
                                <View style={styles.iconBoxWide}>
                                    <Scooter width="100%" height="100%" />
                                </View>
                                <Text style={{ fontFamily: 'Jakarta-Bold', color: '#534AB7', fontSize: 14, textAlign: 'center', marginTop: 2 }}>
                                    Scooter
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{...styles.servButtonBox, marginLeft: 13}} onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                router.push('/booking/destination');
                            }}>
                                <View style={styles.iconBox}>
                                    <Reserve width="100%" height="100%" />
                                </View>
                                <Text style={{ fontFamily: 'Jakarta-Bold', color: '#534AB7', fontSize: 14, textAlign: 'center', marginTop: 2 }}>
                                    Reserve
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flex: 1,
    },
    text: {
        fontSize: 24,
        color: '#ffffff',
        marginLeft: 15,
        marginTop: 10,
        fontFamily: 'Jakarta-Bold',
    },
    subtitle: {
        color: '#F1BCDD',
        fontFamily: 'Jakarta-Bold',
        fontSize: 15,
        marginLeft: 17,
        marginTop: -2,
    },
    searchButtonBox: {
        backgroundColor: '#ffffff',
        width: '90%',
        height: 50,
        borderRadius: 250,
        alignSelf: 'center',
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    servBox:{
        backgroundColor: '#ffffff',
        width: '90%',
        height: 120,
        alignSelf: 'center',
        marginTop: 50,
        borderRadius: 25,
        boxShadow: '0px 0px 0px 1px rgba(92, 92, 110, 0.25)'
    },
    servButtonBox: {
        backgroundColor: '#EDE9FA',
        width: '28%',
        height: 60,
        borderRadius: 15,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    servButtonAlign: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxWide: {
        width: 40,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    }
})