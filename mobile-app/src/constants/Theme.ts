import { TextStyle, ViewStyle } from "react-native";
import Colors from "@/src/constants/Colors";

/**
 * Design tokens for the "Bold & Sporty" direction.
 *
 * Central source of truth for spacing, radii, typography, shadows and the
 * theme-aware colour helpers. Screens/components should compose these instead
 * of re-deriving magic numbers or hardcoding brand colours so the whole app
 * reads as one system in both light and dark mode.
 */

const ink = "#0a2118";
const lime = "#d7ff45";

export const BRAND = { ink, lime } as const;

/** 4pt spacing scale. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/** Corner radii. Bold & Sporty leans on 14–18 for cards, larger for heroes. */
export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
} as const;

/**
 * Typography scale — punchy, high-contrast headings for a sporty feel.
 * Spread these into a Text style, then layer colour on top.
 */
export const typography = {
  display: { fontSize: 34, fontWeight: "900", letterSpacing: -1 },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -0.6 },
  heading: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  subheading: { fontSize: 16, fontWeight: "800", letterSpacing: -0.2 },
  body: { fontSize: 14, fontWeight: "500" },
  bodyStrong: { fontSize: 14, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "700" },
  micro: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
} satisfies Record<string, TextStyle>;

type ShadowLevels = Record<"sm" | "md" | "lg", ViewStyle>;

/** Soft, elevation-driven shadow presets. */
export function shadow(isDark: boolean): ShadowLevels {
  const color = isDark ? "#000000" : "#0f3224";
  return {
    sm: {
      shadowColor: color,
      shadowOpacity: isDark ? 0.32 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    md: {
      shadowColor: color,
      shadowOpacity: isDark ? 0.42 : 0.1,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
    lg: {
      shadowColor: color,
      shadowOpacity: isDark ? 0.55 : 0.16,
      shadowRadius: 26,
      shadowOffset: { width: 0, height: 14 },
      elevation: 7,
    },
  };
}

/**
 * Text/icon colour that sits ON the `tint` fill.
 * `tint` is ink in light mode (needs white) and lime in dark mode (needs ink).
 */
export function onTint(isDark: boolean): string {
  return isDark ? ink : "#ffffff";
}

/** Soft, brand-tinted background for subtle badges/pills. */
export function accentSoft(isDark: boolean): string {
  return isDark ? "rgba(201,226,101,0.14)" : "rgba(10,33,24,0.06)";
}

/** Readable text colour for content placed on an `accentSoft` background. */
export function accentSoftText(isDark: boolean): string {
  const colors = Colors[isDark ? "dark" : "light"];
  return isDark ? colors.accent : colors.tint;
}

/** Standard pressed-state feedback for Pressables. */
export const pressed = {
  opacity: 0.82,
  transform: [{ scale: 0.99 }],
} satisfies ViewStyle;
