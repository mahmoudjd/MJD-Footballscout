import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type Props = {
  label: string;
  value: number | string;
};

export default function StatTile({ label, value }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorKey].card,
          borderColor: Colors[colorKey].border,
          shadowColor: isDark ? "#000" : "#0f172a",
        },
      ]}
    >
      <Text style={[styles.label, { color: Colors[colorKey].notification }]}>{label}</Text>
      <Text style={[styles.value, { color: Colors[colorKey].text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    marginTop: 6,
    fontSize: 24,
    fontWeight: "800",
  },
});
