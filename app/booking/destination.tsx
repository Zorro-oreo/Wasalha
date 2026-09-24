import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LiquidGlassCard from "../../components/liquidBack";
import Recents from "../../components/tabs/chooseDist/Home.svg";
import {
  getRecentDestinations,
  getSavedDestinations,
} from "../../db/locations";
import { getSession } from "../../utils/session";

export default function HomeScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [toText, setToText] = useState("");
  const [saved, setSaved] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [fromText, setFromText] = useState("");

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setFromText("");
      return;
    }
    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation(location);

    const [place] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    if (place) {
      const specific = place.name ?? place.street ?? place.district;
      setFromText([specific, place.city].filter(Boolean).join(", "));
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const loadSaved = async () => {
      const session = await getSession();
      if (!session) return;
      setSaved(await getSavedDestinations(db, session.userID));
    };
    loadSaved();
  }, []);

  useEffect(() => {
    const loadRecent = async () => {
      const session = await getSession();
      if (!session) return;
      setRecent(await getRecentDestinations(db, session.userID));
    };
    loadRecent();
  }, []);

  const selectPlace = (place: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    router.push({
      pathname: "/booking/mapConfirm",
      params: {
        pickupLat: location?.coords.latitude,
        pickupLng: location?.coords.longitude,
        dropoffLat: place.lat,
        dropoffLng: place.lng,
        dropoffAddress: place.address,
      },
    });
  };

  const searchPlace = async () => {
    if (!toText) return;
    const result = await Location.geocodeAsync(toText);
    if (result.length === 0) {
      alert("Location not found");
      return;
    }
    const { latitude, longitude } = result[0];
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    const primary = place?.name ?? place?.street ?? place?.district;
    const specific = place
      ? [primary, place.city].filter(Boolean).join(", ")
      : toText;
    router.push({
      pathname: "/booking/mapConfirm",
      params: {
        pickupLat: location?.coords.latitude,
        pickupLng: location?.coords.longitude,
        dropoffLat: latitude,
        dropoffLng: longitude,
        dropoffAddress: specific,
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F3FB",
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <LiquidGlassCard onPress={() => router.back()} />
              <Text style={styles.headerText}>Choose Destination</Text>
            </View>
            {/* Body */}
            <View
              style={{ display: "flex", alignItems: "center", marginTop: 20 }}
            >
              {/* Destination Box */}
              <View style={styles.whereBox}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View style={styles.fromicon}></View>
                  <TextInput
                    value={fromText}
                    onChangeText={setFromText}
                    placeholder="Enter your location!"
                    placeholderTextColor="#5C5C6E"
                    style={{
                      marginLeft: 10,
                      marginTop: 15,
                      color: "#000000",
                      fontFamily: "Jakarta-Bold",
                      fontSize: 16,
                      width: "90%",
                    }}
                  />
                </View>
                <View style={styles.line}></View>
                <View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={styles.toicon}></View>
                    <TextInput
                      placeholder="Where to?"
                      placeholderTextColor="#5C5C6E"
                      returnKeyType="search"
                      value={toText}
                      onChangeText={setToText}
                      onSubmitEditing={searchPlace}
                      style={{
                        marginLeft: 10,
                        marginBottom: 15,
                        color: "#000000",
                        fontFamily: "Jakarta-Bold",
                        fontSize: 16,
                        width: "90%",
                      }}
                    />
                  </View>
                </View>
              </View>
              {/* Saved Destinations */}
              {saved.length > 0 && (
                <View style={styles.savedBox}>
                  <Text
                    style={{
                      ...styles.labels,
                      marginTop: 20,
                      marginBottom: 10,
                    }}
                  >
                    SAVED PLACES
                  </Text>
                  <View style={styles.savedItem}>
                    {saved.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={styles.listRow}
                        onPress={() => selectPlace(place)}
                      >
                        <Text style={styles.rowTitle}>{place.label}</Text>
                        <Text style={styles.rowSubtitle}>{place.address}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Recent Destinations */}
              {recent.length > 0 && (
                <>
                  <Text
                    style={{
                      ...styles.labels,
                      marginTop: 20,
                      marginBottom: 10,
                      alignSelf: "flex-start",
                      marginLeft: "5%",
                    }}
                  >
                    RECENTS
                  </Text>
                  <View style={styles.list}>
                    {recent.map((place) => {
                      const [title, ...rest] = place.address
                        .split(",")
                        .map((s: string) => s.trim());
                      const area = rest[rest.length - 1] ?? "";
                      const when = place.created_at
                        ? new Date(place.created_at).toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "";
                      const subtitle = [area, when].filter(Boolean).join(" · ");

                      return (
                        <TouchableOpacity
                          key={place.id}
                          style={styles.listRow}
                          onPress={() => selectPlace(place)}
                        >
                          <Recents width={44} height={44} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.rowTitle} numberOfLines={1}>
                              {title}
                            </Text>
                            <Text style={styles.rowSubtitle} numberOfLines={1}>
                              {subtitle}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  whereBox: {
    backgroundColor: "#fff",
    width: "90%",
    height: 115,
    borderRadius: 20,
    boxShadow: "0px 0px 0px 1px rgba(92, 92, 110, 0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  fromicon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 15,
    backgroundColor: "#534AB7",
  },
  toicon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    marginLeft: 15,
    marginBottom: 15,
    backgroundColor: "#B85A9A",
  },
  line: {
    width: "90%",
    height: 2,
    marginLeft: 16,
    backgroundColor: "#CFCDD7",
    borderRadius: 1,
  },
  savedItem: {
    flexDirection: "column",
    width: "100%",
  },
  savedBox: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 20,
    boxShadow: "0px 0px 0px 1px rgba(92, 92, 110, 0.25)",
    paddingBottom: 8,
    marginTop: 20,
  },
  labels: {
    fontFamily: "Jakarta-Bold",
    fontSize: 18,
    color: "#923A76",
  },
  list: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 5,
    width: "90%",
    boxShadow: "0px 0px 0px 1px rgba(92, 92, 110, 0.25)",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    gap: 12,
  },
  rowTitle: {
    fontFamily: "Jakarta-Bold",
    fontSize: 16,
    color: "#000000",
  },
  rowSubtitle: {
    fontFamily: "Jakarta-Regular",
    fontSize: 13,
    color: "#888888",
    marginTop: 2,
  },
});
