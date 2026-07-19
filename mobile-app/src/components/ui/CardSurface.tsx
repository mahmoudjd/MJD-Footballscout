import React, { PropsWithChildren, useContext } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  padding?: number;
  radius?: number;
  withShadow?: boolean;
}>;

export default function CardSurface({
  children,
  style,
  padding = 12,
  radius = 14,
  withShadow = true,
}: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];

  return (
    <View
      style={[
        styles.base,
        withShadow ? styles.shadow : undefined,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius,
          padding,
          shadowColor: isDark ? "#000" : "#0f172a",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
  },
  shadow: {
    shadowOpacity: 0.07,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});
