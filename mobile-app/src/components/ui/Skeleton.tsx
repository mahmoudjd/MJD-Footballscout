import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, DimensionValue, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppContext } from "@/src/context/AppContext";
import { useReducedMotion } from "@/src/utils/useReducedMotion";

type Props = {
  height: number;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Loading placeholder block with a shimmer sweep (native-driver translateX of a
 * translucent LinearGradient band). Falls back to a static tinted block under
 * Reduce Motion. Drop-in replacement for the old plain SkeletonBlock.
 */
export default function Skeleton({ height, width = "100%", radius = 10, style }: Props) {
  const { isDark } = useContext(AppContext);
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(-1)).current;

  const base = isDark ? "#242e26" : "#e5ebe4";
  const highlight = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.65)";

  useEffect(() => {
    if (reduced || w === 0) return;
    const loop = Animated.loop(
      Animated.timing(x, { toValue: 1, duration: 1100, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [reduced, w, x]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[{ height, width, borderRadius: radius, backgroundColor: base, overflow: "hidden" }, style]}>
      {!reduced && w > 0 ? (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ translateX: x.interpolate({ inputRange: [-1, 1], outputRange: [-w, w] }) }],
          }}
        >
          <LinearGradient
            colors={["transparent", highlight, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
