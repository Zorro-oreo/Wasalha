// app/booking/mapConfirm.tsx
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import LiquidGlassCard from "../../components/liquidBack";
import Center from "../../components/tabs/center.svg";
import { addRecentDestination } from "../../db/locations";
import { getSession } from "../../utils/session";

export default function MapConfirmScreen() {
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const db = useSQLiteContext();
  const params = useLocalSearchParams<{
    pickupLat: string;
    pickupLng: string;
    dropoffLat: string;
    dropoffLng: string;
    dropoffAddress: string;
  }>();

  const [region, setRegion] = useState<Region>({
    latitude: Number(params.dropoffLat),
    longitude: Number(params.dropoffLng),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [address, setAddress] = useState(
    params.dropoffAddress ?? "Move map to set location",
  );
  const [isMoving, setIsMoving] = useState(false);

  const onRegionChangeComplete = async (newRegion: Region) => {
    setRegion(newRegion);
    setIsMoving(false);
    const [place] = await Location.reverseGeocodeAsync({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });
    if (place) {
      const specific = place.name ?? place.street ?? place.district;
      setAddress([specific, place.city].filter(Boolean).join(", "));
    }
  };

  const recenterToCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const newRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    mapRef.current?.animateToRegion(newRegion, 500);
  };
  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  const confirmLocation = async () => {
    const session = await getSession();
    if (session) {
      await addRecentDestination(
        db,
        session.userID,
        address,
        region.latitude,
        region.longitude,
      );
    }
    router.push({
      pathname: "/booking/chooseRide",
      params: {
        pickupLat: params.pickupLat,
        pickupLng: params.pickupLng,
        dropoffLat: region.latitude,
        dropoffLng: region.longitude,
        address,
      },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChange={() => setIsMoving(true)}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={true}
        showsMyLocationButton={false}
      />

      {/* Fixed center pin, overlaid on top of the map */}
      <View style={styles.pinWrap} pointerEvents="none">
        <View style={[styles.pin, isMoving && styles.pinLifted]} />
        <View style={styles.pinPoint} />
      </View>

      <SafeAreaView style={styles.header} edges={["top"]}>
        <LiquidGlassCard onPress={() => router.back()} />
        {Platform.OS === "ios" ? (
          <Text style={styles.headerText}>Confirm Location</Text>
        ) : (
          <Text style={{ ...styles.headerText, color: "#000" }}>
            Confirm Location
          </Text>
        )}
      </SafeAreaView>

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={recenterToCurrentLocation}
      >
        <Center width={44} height={44} />
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <Text style={styles.label}>DROP-OFF POINT</Text>
        <Text style={styles.addressText} numberOfLines={2}>
          {isMoving ? "Finding location..." : address}
        </Text>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -18,
    marginTop: -44,
    alignItems: "center",
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#B85A9A",
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 6,
  },
  pinLifted: {
    transform: [{ translateY: -8 }],
  },
  pinPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
    marginTop: 2,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    position: "absolute",
    marginTop: 15,
    marginLeft: 22,
  },
  headerText: {
    fontSize: 22,
    fontFamily: "Jakarta-Bold",
    color: "#ffffff",
  },
  backButton: {
    marginTop: 15,
    marginLeft: 22,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
  },
  recenterButton: {
    position: "absolute",
    bottom: 200,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 6px rgba(0,0,0,0.15)",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 30,
    boxShadow: "0px -2px 10px rgba(0,0,0,0.1)",
  },
  label: {
    color: "#B85A9A",
    fontFamily: "Jakarta-Bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  addressText: {
    fontFamily: "Jakarta-Bold",
    fontSize: 18,
    color: "#000",
    marginTop: 6,
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: "#B85A9A",
    height: 56,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontFamily: "Jakarta-ExtraBold",
    fontSize: 18,
  },
});
