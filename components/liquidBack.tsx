import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import Arrow from "../components/tabs/Arrow.svg";

export default function LiquidBack({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.shadowWrapper, { transform: [{ scale }] }]}>
        <View style={styles.circle}>
          <View style={styles.iconWrap}>
            <Arrow />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const SIZE = 50;

const styles = StyleSheet.create({
  shadowWrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  circle: {
    flex: 1,
    borderRadius: SIZE / 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  iconWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: "center",
    alignItems: "center",
  },
});
