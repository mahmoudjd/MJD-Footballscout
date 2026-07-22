import React, { PropsWithChildren, useContext } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { AppContext } from "@/src/context/AppContext";
import GlassSurface from "@/src/components/ui/GlassSurface";
import { radius as radiusTokens, shadow } from "@/src/constants/Theme";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  withShadow?: boolean;
}>;

export default function CardSurface({
  children,
  style,
  padding = 16,
  radius = radiusTokens.xl,
  withShadow = true,
}: Props) {
  const { isDark } = useContext(AppContext);
  return (
    <GlassSurface
      style={[
        styles.base,
        withShadow ? shadow(isDark).md : undefined,
        {
          borderRadius: radius,
          padding,
        },
        style,
      ]}
    >
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
});
