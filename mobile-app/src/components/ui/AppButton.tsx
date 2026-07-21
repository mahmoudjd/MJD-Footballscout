import React, { useContext } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { onTint, radius, shadow, spacing } from "@/src/constants/Theme";

type Variant = "primary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
  iconPosition?: "left" | "right";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const sizeMap: Record<Size, { minHeight: number; paddingH: number; fontSize: number; icon: number }> = {
  lg: { minHeight: 52, paddingH: spacing.xl, fontSize: 16, icon: 19 },
  md: { minHeight: 46, paddingH: spacing.lg, fontSize: 14, icon: 17 },
  sm: { minHeight: 38, paddingH: spacing.md, fontSize: 13, icon: 15 },
};

/**
 * Bold & Sporty button. Primary is a solid lime/ink fill with correct on-tint
 * contrast in both themes; ghost is an outlined tint button; danger is a soft
 * red. Replaces the ad-hoc primaryButton blocks that hardcoded `#fff` text.
 */
export default function AppButton({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  iconPosition = "left",
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  accessibilityLabel,
  accessibilityHint,
}: Props) {
  const { isDark } = useContext(AppContext);
  const colors = Colors[isDark ? "dark" : "light"];
  const dims = sizeMap[size];
  const isDisabled = disabled || loading;

  let backgroundColor: string;
  let borderColor: string;
  let contentColor: string;
  let elevated = false;

  if (variant === "primary") {
    backgroundColor = colors.tint;
    borderColor = colors.tint;
    contentColor = onTint(isDark);
    elevated = true;
  } else if (variant === "danger") {
    backgroundColor = isDark ? "rgba(239,68,68,0.14)" : "rgba(239,68,68,0.10)";
    borderColor = isDark ? "rgba(239,68,68,0.42)" : "rgba(239,68,68,0.32)";
    contentColor = "#ef4444";
  } else {
    backgroundColor = "transparent";
    borderColor = colors.tint;
    contentColor = colors.tint;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: dims.minHeight,
          paddingHorizontal: dims.paddingH,
          borderRadius: radius.md,
          backgroundColor,
          borderColor,
        },
        elevated ? shadow(isDark).sm : undefined,
        fullWidth ? styles.fullWidth : styles.auto,
        isDisabled ? styles.disabled : undefined,
        pressed && !isDisabled ? styles.pressed : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={contentColor} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === "left" ? (
            <Ionicons name={icon} size={dims.icon} color={contentColor} />
          ) : null}
          <Text style={[styles.label, { color: contentColor, fontSize: dims.fontSize } as TextStyle]}>
            {label}
          </Text>
          {icon && iconPosition === "right" ? (
            <Ionicons name={icon} size={dims.icon} color={contentColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  fullWidth: { width: "100%" },
  auto: { alignSelf: "flex-start" },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
});
