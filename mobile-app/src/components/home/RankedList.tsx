import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type RankedItem = {
  key: string;
  label: string;
  value: number;
};

type Props = {
  title: string;
  emptyText: string;
  items: RankedItem[];
};

export default function RankedList({ title, emptyText, items }: Props) {
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
      <Text style={[styles.title, { color: Colors[colorKey].text }]}>{title}</Text>

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: Colors[colorKey].notification }]}>
          {emptyText}
        </Text>
      ) : (
        items.map((item, index) => (
          <View key={item.key} style={styles.row}>
            <Text
              style={[styles.label, { color: Colors[colorKey].text }]}
              numberOfLines={1}
            >
              {index + 1}. {item.label}
            </Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueText}>{item.value}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flex: 1,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  valueBadge: {
    borderRadius: 999,
    backgroundColor: "#0ea5a5",
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  valueText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
