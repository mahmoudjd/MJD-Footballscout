import React, { useContext } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { accentSoft, accentSoftText, onTint, radius, spacing } from "@/src/constants/Theme";

type Tone = "soft" | "solid" | "outline" | "neutral";
type Size = "sm" | "md";

type Props = {
  label: string;
  tone?: Tone;
  size?: Size;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  uppercase?: boolean;
};

/**
 * Bold & Sporty badge/pill. `soft` = tinted background (default), `solid` =
 * filled lime/ink with on-tint text, `outline` = bordered, `neutral` = muted
 * surface. Centralises the many hand-rolled pill styles across the app.
 */
export default function Badge({
  label,
  tone = "soft",
  size = "sm",
  icon,
  style,
  textStyle,
  uppercase = false,
}: Props) {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];

  let backgroundColor: string;
  let borderColor = "transparent";
  let color: string;

  if (tone === "solid") {
    backgroundColor = colors.tint;
    color = onTint(isDark);
  } else if (tone === "outline") {
    backgroundColor = "transparent";
    borderColor = colors.border;
    color = colors.notification;
  } else if (tone === "neutral") {
    backgroundColor = colors.surfaceSoft;
    color = colors.notification;
  } else {
    backgroundColor = accentSoft(isDark);
    color = accentSoftText(isDark);
  }

  const sizing =
    size === "md"
      ? { paddingHorizontal: 10, paddingVertical: 5, fontSize: 12 }
      : { paddingHorizontal: 8, paddingVertical: 3, fontSize: 10.5 };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor,
          borderWidth: tone === "outline" ? 1 : 0,
          paddingHorizontal: sizing.paddingHorizontal,
          paddingVertical: sizing.paddingVertical,
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={sizing.fontSize + 1} color={color} /> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color,
            fontSize: sizing.fontSize,
            textTransform: uppercase ? "uppercase" : "none",
            letterSpacing: uppercase ? 0.6 : 0,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "800",
  },
});
