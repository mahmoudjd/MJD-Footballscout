import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, View, ViewStyle } from "react-native";
import { useReducedMotion } from "@/src/utils/useReducedMotion";

type Props = {
  /** Fill amount, 0–100. */
  progress: number;
  color: string;
  trackColor: string;
  height?: number;
  /** Stagger the fill so rows animate in sequence. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Progress bar whose fill grows from 0 to `progress` on mount. Width can't run
 * on the native driver, but this is only ever a handful of bars on one screen,
 * so the JS-thread cost is negligible. Collapses to a static fill under Reduce
 * Motion.
 */
export default function AnimatedBar({ progress, color, trackColor, height = 8, delay = 0, style }: Props) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, progress));
  const anim = useRef(new Animated.Value(reduced ? clamped : 0)).current;

  useEffect(() => {
    if (reduced) {
      anim.setValue(clamped);
      return;
    }
    const run = Animated.timing(anim, {
      toValue: clamped,
      duration: 800,
      delay,
      useNativeDriver: false,
    });
    run.start();
    return () => run.stop();
  }, [clamped, delay, reduced, anim]);

  const width = anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View style={[{ height, borderRadius: 999, backgroundColor: trackColor, overflow: "hidden" }, style]}>
      <Animated.View style={{ height: "100%", borderRadius: 999, width, backgroundColor: color }} />
    </View>
  );
}
