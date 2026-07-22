import React, { PropsWithChildren, useContext } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "@/src/context/AppContext";
import AppBackground from "@/src/components/ui/AppBackground";
import Colors from "@/src/constants/Colors";

type Props = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
  withTopInset?: boolean;
  edges?: Edge[];
  withTabBarInset?: boolean;
  /**
   * Full-bleed mode: the container adds no top/bottom safe-area of its own so
   * the child scroll view can run edge-to-edge and let the translucent iOS 26
   * tab bar float in the foreground. The scroll view is expected to set
   * `contentInsetAdjustmentBehavior="automatic"`, which natively insets its
   * content below the status bar and above the floating tab bar.
   */
  edgeToEdge?: boolean;
}>;

export default function ScreenContainer({
  children,
  style,
  withTopInset = false,
  edges,
  withTabBarInset = false,
  edgeToEdge = false,
}: Props) {
  const { isDark } = useContext(AppContext);
  // The top safe-area is only reserved when the screen has a fixed header that
  // sits directly under the status bar. Screens whose header scrolls inside an
  // `automatic` scroll view leave `withTopInset`/`withTabBarInset` off and let
  // that scroll view own the top inset instead.
  const reserveTop = withTopInset || withTabBarInset;
  // Edge-to-edge screens claim NO bottom safe-area so the inner scroll view can
  // run full-height and scroll under the floating translucent tab bar; the
  // scroll's `contentInsetAdjustmentBehavior="automatic"` injects the real
  // tab-bar bottom inset so the final row stays reachable. Non edge-to-edge
  // screens keep the reserved bottom strip as before.
  const verticalEdges: Edge[] = [
    ...(reserveTop ? (["top"] as Edge[]) : []),
    ...(edgeToEdge ? [] : (["bottom"] as Edge[])),
  ];
  const resolvedEdges = edges || (["left", "right", ...verticalEdges] as Edge[]);
  const paddingTop = edgeToEdge ? (reserveTop ? 10 : 0) : withTopInset ? 10 : 14;
  const paddingBottom = edgeToEdge ? 0 : withTabBarInset ? 12 : 20;

  return (
    <SafeAreaView
      collapsable={false}
      edges={resolvedEdges}
      style={[
        styles.container,
        { backgroundColor: Colors[isDark ? "dark" : "light"].background },
      ]}
    >
      <AppBackground />
      <View
        collapsable={false}
        style={[styles.content, { paddingTop, paddingBottom }, style]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  content: {
    flex: 1,
    width: "100%",
  },
});
