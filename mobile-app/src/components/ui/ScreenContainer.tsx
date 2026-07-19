import React, { PropsWithChildren, useContext } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "@/src/context/AppContext";
import AppBackground from "@/src/components/ui/AppBackground";

type Props = PropsWithChildren<{
  style?: ViewStyle | ViewStyle[];
  withTopInset?: boolean;
  edges?: Edge[];
  withTabBarInset?: boolean;
}>;

export default function ScreenContainer({
  children,
  style,
  withTopInset = false,
  edges,
  withTabBarInset: _withTabBarInset = true,
}: Props) {
  const { isDark } = useContext(AppContext);
  const resolvedEdges = edges || (withTopInset ? ["top", "left", "right", "bottom"] : ["left", "right", "bottom"]);
  const bottomSpacing = 16;

  return (
    <SafeAreaView
      edges={resolvedEdges}
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111826" : "#f6f9fb" },
      ]}
    >
      <AppBackground />
      <View
        style={[
          styles.content,
          { paddingTop: 16, paddingBottom: bottomSpacing },
          style,
        ]}
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
