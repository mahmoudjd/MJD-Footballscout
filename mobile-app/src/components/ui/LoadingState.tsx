import React, { useContext } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import AppBackground from "@/src/components/ui/AppBackground";

type Props = {
  withTopInset?: boolean;
};

export default function LoadingState({ withTopInset = false }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";

  return (
    <SafeAreaView
      edges={withTopInset ? ["top", "left", "right", "bottom"] : ["left", "right", "bottom"]}
      style={[
        styles.container,
        { backgroundColor: Colors[colorKey].background },
      ]}
    >
      <AppBackground />
      <View
        style={[
          styles.loaderCard,
          {
            backgroundColor: Colors[colorKey].card,
            borderColor: Colors[colorKey].border,
          },
        ]}
      >
        <ActivityIndicator animating size="large" color={Colors[colorKey].tint} />
        <Text style={[styles.loaderText, { color: Colors[colorKey].notification }]}>Loading data...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 16,
    alignItems: "center",
    gap: 10,
  },
  loaderText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
