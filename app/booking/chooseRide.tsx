import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiquidGlassCard from "../../components/liquidBack";
import Comfort from "../../components/tabs/ChooseRide/Comfort.svg";
import ComfortS from "../../components/tabs/ChooseRide/ComfotSelected.svg";
import Lux from "../../components/tabs/ChooseRide/Luxury.svg";
import LuxS from "../../components/tabs/ChooseRide/LuxurySelected.svg";
import Reg from "../../components/tabs/ChooseRide/Regular.svg";
import RegS from "../../components/tabs/ChooseRide/RegularSelected.svg";
import Scooter from "../../components/tabs/ChooseRide/Scooter.svg";
import ScooterS from "../../components/tabs/ChooseRide/ScooterSelected.svg";
import Shield from "../../components/tabs/ChooseRide/Shield.svg";
import Time from "../../components/tabs/ChooseRide/time.svg";
import {
  calculateFare,
  estimateDurationMinutes,
  getPrice,
  rideTypes,
} from "../../utils/pricing";

export default function ChooseRideScreen() {
  const [isSelected, setIsSelected] = useState("Luxury");
  const params = useLocalSearchParams<{
    pickupLat: string;
    pickupLng: string;
    dropoffLat: string;
    dropoffLng: string;
  }>();
  const rides = useMemo(() => {
    const straight = getPrice(
      Number(params.pickupLat),
      Number(params.pickupLng),
      Number(params.dropoffLat),
      Number(params.dropoffLng),
    );

    const distanceKm = straight * 1.3;
    const durationMinutes = estimateDurationMinutes(distanceKm);

    return rideTypes.map((ride) => ({
      ...ride,
      fare: calculateFare(distanceKm, durationMinutes, ride),
      eta: Math.round(durationMinutes),
    }));
  }, [
    params.pickupLat,
    params.pickupLng,
    params.dropoffLat,
    params.dropoffLng,
  ]);

  return (
    <SafeAreaView style={styles.body}>
      {/* Header */}
      <View style={styles.header}>
        <LiquidGlassCard onPress={() => router.back()} />
        <Text style={styles.headerText}>Choose a Ride</Text>
      </View>

      {/* Ride Cards */}
      <View
        style={{
          height: 350,
          marginTop: 40,
        }}
      >
        <Animated.ScrollView
          style={{ flex: 1, marginTop: 0 }}
          contentContainerStyle={{
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          alwaysBounceVertical
        >
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "85%",
              marginBottom: 20,
            }}
          >
            {/*Regular Ride Card */}
            {isSelected === "regular" ? (
              <View
                style={{
                  ...styles.selectedCard,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <RegS style={{ marginTop: 25, marginLeft: -10 }} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginLeft: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Jakarta-Bold",
                      marginTop: 10,
                      color: "#000000",
                      textAlign: "left",
                    }}
                  >
                    REGULAR
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Jakarta-Bold",
                      marginBottom: 0,
                      color: "#655B70",
                      textAlign: "left",
                      width: 150,
                    }}
                  >
                    STANDARD COMFORT
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 5,
                    }}
                  >
                    <Time />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-bold",
                        color: "#B85A9A",
                      }}
                    >
                      5 min away
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Jakarta-bold",
                        fontWeight: "bold",
                        color: "#B85A9A",
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    >
                      {rides.find((ride) => ride.id === "regular")?.fare} EGP
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsSelected("regular")}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: -50,
                  marginTop: -40,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Reg style={{ marginTop: 25, marginLeft: -10 }} />
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginLeft: -10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Jakarta-Bold",
                        marginTop: 10,
                        color: "#000000",
                        textAlign: "left",
                      }}
                    >
                      REGULAR
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-Bold",
                        marginBottom: 0,
                        color: "#655B70",
                        textAlign: "left",
                        width: 150,
                      }}
                    >
                      STANDARD COMFORT
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Time />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                        }}
                      >
                        5 min away
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                          marginLeft: 15,
                          marginTop: 10,
                        }}
                      >
                        {rides.find((ride) => ride.id === "regular")?.fare} EGP
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/*Comfort Ride Card */}
            {isSelected === "comfort" ? (
              <View
                style={{
                  ...styles.selectedCard,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginBottom: 40,
                  marginTop: 50,
                }}
              >
                <ComfortS style={{ marginTop: 25, marginLeft: -10 }} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginLeft: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Jakarta-Bold",
                      marginTop: 10,
                      color: "#000000",
                      textAlign: "left",
                    }}
                  >
                    COMFORT
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Jakarta-Bold",
                      marginBottom: 0,
                      color: "#655B70",
                      textAlign: "left",
                      width: 170,
                    }}
                  >
                    NEWER CARS WITH EXTRA LEGROOM
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 5,
                    }}
                  >
                    <Time />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-bold",
                        color: "#B85A9A",
                      }}
                    >
                      8 min away
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Jakarta-bold",
                        fontWeight: "bold",
                        color: "#B85A9A",
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    >
                      {rides.find((ride) => ride.id === "comfort")?.fare} EGP
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsSelected("comfort")}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: 0,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Comfort style={{ marginTop: 25, marginLeft: -10 }} />
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginLeft: -10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Jakarta-Bold",
                        marginTop: 10,
                        color: "#000000",
                        textAlign: "left",
                      }}
                    >
                      COMFORT
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-Bold",
                        marginBottom: 0,
                        color: "#655B70",
                        textAlign: "left",
                        width: 170,
                      }}
                    >
                      NEWER CARS WITH EXTRA LEGROOM
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Time />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                        }}
                      >
                        8 min away
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                          marginLeft: 15,
                          marginTop: 10,
                        }}
                      >
                        {rides.find((ride) => ride.id === "comfort")?.fare} EGP
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Luxury Ride Card */}
            {isSelected === "luxury" ? (
              <View
                style={{
                  ...styles.selectedCard,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
              >
                <LuxS style={{ marginTop: 25, marginLeft: -10 }} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginLeft: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Jakarta-Bold",
                      marginTop: 10,
                      color: "#000000",
                      textAlign: "left",
                    }}
                  >
                    LUXURY
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Jakarta-Bold",
                      marginBottom: 0,
                      color: "#655B70",
                      textAlign: "left",
                      width: 150,
                    }}
                  >
                    PREMIUM RIDES WITH LUXURY
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 5,
                    }}
                  >
                    <Time />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-bold",
                        color: "#B85A9A",
                      }}
                    >
                      5 min away
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Jakarta-bold",
                        fontWeight: "bold",
                        color: "#B85A9A",
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    >
                      {rides.find((ride) => ride.id === "luxury")?.fare} EGP
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsSelected("luxury")}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  marginTop: -40,
                  marginBottom: -40,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Lux style={{ marginTop: 25, marginLeft: -10 }} />
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginLeft: -10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Jakarta-Bold",
                        marginTop: 10,
                        color: "#000000",
                        textAlign: "left",
                      }}
                    >
                      LUXURY
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-Bold",
                        marginBottom: 0,
                        color: "#655B70",
                        textAlign: "left",
                        width: 150,
                      }}
                    >
                      PREMIUM RIDES WITH LUXURY
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Time />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                        }}
                      >
                        5 min away
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                          marginLeft: 15,
                          marginTop: 10,
                        }}
                      >
                        {rides.find((ride) => ride.id === "luxury")?.fare} EGP
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/*Scooter Ride Card */}
            {isSelected === "scooter" ? (
              <View
                style={{
                  ...styles.selectedCard,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  marginTop: 40,
                }}
              >
                <ScooterS style={{ marginTop: 25, marginLeft: -10 }} />
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginLeft: -10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: "Jakarta-Bold",
                      marginTop: 10,
                      color: "#000000",
                      textAlign: "left",
                    }}
                  >
                    SCOOTER
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: "Jakarta-Bold",
                      marginBottom: 0,
                      color: "#655B70",
                      textAlign: "left",
                      width: 150,
                    }}
                  >
                    SMALLER, FASTER
                  </Text>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 5,
                      marginBottom: 5,
                    }}
                  >
                    <Time />
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-bold",
                        color: "#B85A9A",
                      }}
                    >
                      2 min away
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Jakarta-bold",
                        fontWeight: "bold",
                        color: "#B85A9A",
                        marginLeft: 15,
                        marginTop: 10,
                      }}
                    >
                      {rides.find((ride) => ride.id === "scooter")?.fare} EGP
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setIsSelected("scooter")}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  width: "100%",
                  marginBottom: -40,
                }}
              >
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <Scooter style={{ marginTop: 25, marginLeft: -10 }} />
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginLeft: -10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontFamily: "Jakarta-Bold",
                        marginTop: 10,
                        color: "#000000",
                        textAlign: "left",
                        fontWeight: "bold",
                      }}
                    >
                      SCOOTER
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Jakarta-Bold",
                        marginBottom: 0,
                        color: "#655B70",
                        textAlign: "left",
                        width: 150,
                        fontWeight: "bold",
                      }}
                    >
                      SMALLER, FASTER
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Time />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                        }}
                      >
                        2 min away
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Jakarta-bold",
                          color: "#B85A9A",
                          marginLeft: 15,
                          marginTop: 10,
                        }}
                      >
                        {rides.find((ride) => ride.id === "scooter")?.fare} EGP
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.ScrollView>
      </View>

      {/* Guardian Shield Card */}
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "90%",
            height: 100,
            marginTop: 0,
            backgroundColor: "rgba(46, 85, 204, 0.1)",
            borderRadius: 32,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Shield style={{ marginLeft: 20 }} width={40} height={40} />
          <Text
            style={{
              width: 280,
              marginLeft: 20,
              fontFamily: "Jakarta-regular",
              fontSize: 14,
              color: "#2E55CC",
            }}
          >
            Your trip is protected by our{" "}
            <Text style={{ fontFamily: "Jakarta-Bold", fontWeight: "bold" }}>
              Guardian Shield
            </Text>
            . Live location sharing and emergency assistance are active.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#F5F3FB",
    flex: 1,
  },

  header: {
    marginTop: 15,
    marginLeft: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  headerText: {
    fontSize: 22,
    fontFamily: "Jakarta-Bold",
  },
  selectedCard: {
    backgroundColor: "#ffffff",
    width: "100%",
    height: 120,
    borderRadius: 20,
  },
});
