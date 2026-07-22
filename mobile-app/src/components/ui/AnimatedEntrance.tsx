import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";
import { useReducedMotion } from "@/src/utils/useReducedMotion";

type Props = {
  children: React.ReactNode;
  /** Stagger offset in ms — pass index * 60 for a cascading list. */
  delay?: number;
  /** Vertical travel distance in px. Default 12. */
  offset?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Fades + slides its children up on mount (native driver). Pass an increasing
 * `delay` per item to stagger a list into view. Collapses to a static, visible
 * state when Reduce Motion is on.
 */
export default function AnimatedEntrance({ children, delay = 0, offset = 12, style }: Props) {
  const reduced = useReducedMotion();
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current;

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 320,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [delay, progress, reduced]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [offset, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
