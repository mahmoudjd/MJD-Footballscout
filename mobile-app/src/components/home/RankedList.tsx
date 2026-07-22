import React, { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { radius, shadow, spacing, typography } from "@/src/constants/Theme";

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
  const colors = Colors[colorKey];

  return (
    <View
      style={[
        styles.container,
        shadow(isDark).sm,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.notification }]}>
          {emptyText}
        </Text>
      ) : (
        items.map((item) => (
          <View key={item.key} style={styles.row}>
            <Text
              style={[styles.label, { color: colors.text }]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
            <View style={[styles.valueBadge, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
              <Text style={[styles.valueText, { color: colors.notification }]}>{item.value}</Text>
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
    borderRadius: radius.lg,
    padding: spacing.md,
    flex: 1,
  },
  title: {
    ...typography.subheading,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  valueBadge: {
    borderWidth: 1,
    borderRadius: radius.pill,
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  valueText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
