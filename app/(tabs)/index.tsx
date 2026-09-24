import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Reserve from "../../components/tabs/Calendar.svg";
import Ride from "../../components/tabs/Ride.svg";
import Scooter from "../../components/tabs/Scooter.svg";
import Search from "../../components/tabs/Search.svg";
import Off from "../../components/tabs/off.svg";
import { getSession } from "../../utils/session";

export default function HomeScreen() {
  const router = useRouter();
  const [fname, setFname] = useState("");
  const { width, height } = useWindowDimensions();

  const guidelineWidth = 402;
  const guidelineHeight = 874;

  const horizontalScale = (size: number) => (width / guidelineWidth) * size;

  const verticalScale = (size: number) => (height / guidelineHeight) * size;

  const moderateScale = (size: number, factor = 0.5) =>
    size + (horizontalScale(size) - size) * factor;

  const searchBoxHeight = width * (197 / 402);

  const styles = createStyles(horizontalScale, verticalScale, moderateScale);

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/booking/destination");
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#F5F3FB" }}>
        <View style={{ flex: 1 }}>
          {Platform.OS === "ios" ? (
            <View style={{ ...styles.searchBox, position: "absolute" }}></View>
          ) : (
            <View style={{ ...styles.searchBox, position: "absolute" }}></View>
          )}
          <SafeAreaView style={styles.titleContainer} edges={["top"]}>
            <Text style={styles.text}>Good Morning,{fname} 👋</Text>
            <Text style={styles.subtitle}>Where are you heading today?</Text>
            <TouchableOpacity
              onPress={searchButton}
              style={styles.searchButtonBox}
            >
              <Search style={{ marginLeft: horizontalScale(20) }} />
              <Text
                style={{
                  fontFamily: "Jakarta-Bold",
                  color: "#5C5C6E",
                  fontSize: 16,
                }}
              >
                Where to?
              </Text>
            </TouchableOpacity>
            <View style={styles.servBox}>
              <Text
                style={{
                  fontFamily: "Jakarta-Bold",
                  color: "#534AB7",
                  fontSize: 20,
                  marginLeft: horizontalScale(15),
                  marginTop: verticalScale(-7),
                }}
              >
                Services
              </Text>
              <View style={styles.servButtonAlign}>
                <TouchableOpacity
                  style={{
                    ...styles.servButtonBox,
                    marginLeft: horizontalScale(13),
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/booking/destination");
                  }}
                >
                  <View style={styles.iconBoxWide}>
                    <Ride width="100%" height="100%" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Jakarta-Bold",
                      color: "#534AB7",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: verticalScale(2),
                    }}
                  >
                    Ride
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...styles.servButtonBox,
                    marginLeft: horizontalScale(10),
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/booking/destination");
                  }}
                >
                  <View style={styles.iconBoxWide}>
                    <Scooter width="100%" height="100%" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Jakarta-Bold",
                      color: "#534AB7",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: verticalScale(2),
                    }}
                  >
                    Scooter
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    ...styles.servButtonBox,
                    marginLeft: horizontalScale(10),
                    marginRight: horizontalScale(13),
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    router.push("/booking/destination");
                  }}
                >
                  <View style={styles.iconBox}>
                    <Reserve width="100%" height="100%" />
                  </View>
                  <Text
                    style={{
                      fontFamily: "Jakarta-Bold",
                      color: "#534AB7",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: verticalScale(2),
                    }}
                  >
                    Reserve
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                ...styles.servBox,
                marginTop: verticalScale(18),
                height: verticalScale(140),
              }}
            >
              <Text
                style={{
                  fontFamily: "Jakarta-Bold",
                  color: "#534AB7",
                  fontSize: 20,
                  marginLeft: horizontalScale(15),
                  marginTop: verticalScale(-7),
                }}
              >
                Scared of the driving test?
              </Text>
              <Text
                style={{
                  fontFamily: "Jakarta-Bold",
                  color: "#534AB7",
                  fontSize: 16,
                  marginLeft: horizontalScale(15),
                  marginTop: verticalScale(-2),
                }}
              >
                Book a driving lesson now!
              </Text>
              <TouchableOpacity
                style={{
                  ...styles.servButtonBox,
                  marginLeft: horizontalScale(18),
                  width: "90%",
                  height: verticalScale(65),
                  marginTop: verticalScale(15),
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push("/booking/destination");
                }}
              >
                <Text
                  style={{
                    fontFamily: "Jakarta-Bold",
                    color: "#534AB7",
                    fontSize: 16,
                  }}
                >
                  Book Now
                </Text>
              </TouchableOpacity>
            </View>
            <Off
              style={{ alignSelf: "center", marginTop: verticalScale(18) }}
            />
          </SafeAreaView>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const createStyles = (
  horizontalScale: (size: number) => number,
  verticalScale: (size: number) => number,
  moderateScale: (size: number, factor?: number) => number,
) =>
  StyleSheet.create({
    titleContainer: {
      flex: 1,
    },

    searchBox: {
      backgroundColor: "#B85A9A",
      width: "100%",
      height: verticalScale(197),
      borderBottomLeftRadius: moderateScale(30),
      borderBottomRightRadius: moderateScale(30),
    },

    text: {
      fontSize: moderateScale(24),
      color: "#fff",
      marginLeft: horizontalScale(15),
      marginTop: verticalScale(10),
      fontFamily: "Jakarta-Bold",
    },

    subtitle: {
      color: "#F1BCDD",
      fontFamily: "Jakarta-Bold",
      fontSize: moderateScale(15),
      marginLeft: horizontalScale(17),
      marginTop: verticalScale(-2),
    },

    searchButtonBox: {
      backgroundColor: "#fff",
      width: "90%",
      height: verticalScale(50),
      borderRadius: moderateScale(250),
      alignSelf: "center",
      marginTop: verticalScale(10),
      flexDirection: "row",
      alignItems: "center",
      gap: horizontalScale(10),
    },

    servBox: {
      backgroundColor: "#fff",
      width: "92%",
      paddingVertical: verticalScale(13),
      alignSelf: "center",
      marginTop: verticalScale(40),
      borderRadius: moderateScale(25),

      boxShadow: "0px 0px 0px 1px rgba(92,92,110,0.25)",
    },

    servButtonAlign: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      alignItems: "center",
      marginTop: verticalScale(12),
    },

    servButtonBox: {
      backgroundColor: "#EDE9FA",
      flex: 1,
      height: verticalScale(65),
      borderRadius: moderateScale(15),
      marginHorizontal: horizontalScale(6),
      justifyContent: "center",
      alignItems: "center",
    },

    iconBox: {
      width: horizontalScale(28),
      height: verticalScale(28),
      justifyContent: "center",
      alignItems: "center",
    },

    iconBoxWide: {
      width: horizontalScale(40),
      height: verticalScale(28),
      justifyContent: "center",
      alignItems: "center",
    },
  });
