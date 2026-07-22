import React, { forwardRef, useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, View, ViewStyle } from "react-native";
import { useReducedMotion } from "@/src/utils/useReducedMotion";

type Props = PressableProps & {
  /** Scale reached while pressed. Default 0.96. */
  scaleTo?: number;
  /** Style for the animated (scaling) inner surface. */
  style?: StyleProp<ViewStyle>;
  /** Style for the outer Pressable — put layout (width/alignSelf) here. */
  containerStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Drop-in Pressable that springs its scale down on press and back on release
 * (native driver — runs off the JS thread). Gives every tappable surface the
 * tactile micro-interaction the app was missing. Honours Reduce Motion.
 * Forwards its ref so it works as a child of <Link asChild>.
 */
const PressableScale = forwardRef<View, Props>(function PressableScale(
  { scaleTo = 0.96, style, containerStyle, children, onPressIn, onPressOut, ...rest },
  ref,
) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (to: number) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      ref={ref}
      onPressIn={(e) => {
        if (!reduced) spring(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduced) spring(1);
        onPressOut?.(e);
      }}
      style={containerStyle}
      {...rest}
    >
      {(state) => (
        <Animated.View style={[{ transform: [{ scale }] }, style]}>
          {typeof children === "function" ? (children as (s: typeof state) => React.ReactNode)(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
});

export default PressableScale;
