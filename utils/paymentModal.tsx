import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAnimatedStyle, withTiming } from "react-native-reanimated";
import Cash from "../components/tabs/Payments/Cash.svg";
import InUse from "../components/tabs/Payments/InUse.svg";
import MC from "../components/tabs/Payments/MC.svg";
import Meeza from "../components/tabs/Payments/Meeza.svg";
import Visa from "../components/tabs/Payments/Visa.svg";
import Wallet from "../components/tabs/Payments/Wallet.svg";
import { getPaymentMethods, setDefaultMethod } from "../db/payments";
import { getSession } from "../utils/session";

export default function PaymentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [methods, setMethods] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const Height = 485;
  const db = useSQLiteContext();

  useEffect(() => {
    const loadMethods = async () => {
      const session = await getSession();
      if (!session) return;
      setUserId(session.id);
      setMethods(await getPaymentMethods(db, session.id));
    };
    loadMethods();
  }, []);

  const selectMethods = async (methodId: string) => {
    if (!userId) return;
    await setDefaultMethod(db, userId, methodId);
    setMethods(await getPaymentMethods(db, userId));
    setIsVisible(false);
  };

  const toggleModal = () => {
    setIsVisible(!isVisible);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: withTiming(isVisible ? 0 : Height, { duration: 300 }),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.sheet, animatedStyle]}>
      <View style={styles.Pill} />

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          width: "100%",
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "Jakarta-Bold",
            fontWeight: "bold",
            fontSize: 26,
            color: "#B85A9A",
          }}
        >
          Payment Method
        </Text>
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "90%",
          marginBottom: 20,
        }}
      >
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => selectMethods(method.id)}
          >
            <View>
              {method.type === "card" && (
                <>
                  <View>
                    {method.network === "Visa" && (
                      <>
                        <Visa />
                        <Text>•••• {method.last_four}</Text>
                      </>
                    )}

                    {method.network === "MasterCard" && (
                      <>
                        <MC />
                        <Text>•••• {method.last_four}</Text>
                      </>
                    )}

                    {method.network === "Meeza" && (
                      <>
                        <Meeza />
                        <Text>•••• {method.last_four}</Text>
                      </>
                    )}
                  </View>
                </>
              )}

              {method.type === "cash" && (
                <>
                  <Cash />
                  <Text>Cash</Text>
                </>
              )}

              {method.type === "wallet" && (
                <>
                  <Wallet />
                  <Text>Wallet</Text>
                </>
              )}
            </View>

            {method.is_default === 1 && (
              <>
                <InUse />
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 485,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
    padding: 20,
  },
  Pill: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 10,
  },
});
