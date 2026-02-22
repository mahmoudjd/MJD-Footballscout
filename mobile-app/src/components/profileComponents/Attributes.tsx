import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attribute } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { safeDecodeURIComponent } from "@/src/utils/playerDisplay";

type Props = {
  attributes: Attribute[];
};

const attributeIcons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  pace: "flash-outline",
  shot: "football-outline",
  pass: "swap-horizontal-outline",
  dribbling: "shuffle-outline",
  defence: "shield-checkmark-outline",
  defense: "shield-checkmark-outline",
  physical: "barbell-outline",
};

function toAttributeScore(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

function getScoreColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
}

const Attributes = ({ attributes }: Props) => {
  const { isDark } = React.useContext(AppContext);
  const palette = Colors[isDark ? "dark" : "light"];

  return (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.titleRow}>
        <View
          style={[
            styles.titleIconWrap,
            { backgroundColor: isDark ? "rgba(34,211,238,0.14)" : "rgba(14,165,165,0.12)" },
          ]}
        >
          <Ionicons name="speedometer-outline" size={16} color={palette.tint} />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Player Attributes</Text>
      </View>

      <View style={styles.list}>
        {attributes.map((attr, index) => {
          const decodedName = safeDecodeURIComponent(attr.name) || "Attribute";
          const score = toAttributeScore(attr.value || "");
          const barColor = getScoreColor(score);
          const icon = attributeIcons[decodedName.toLowerCase()] || "sparkles-outline";

          return (
            <View
              key={`${attr.name}-${attr.value}-${index}`}
              style={[
                styles.row,
                {
                  borderColor: palette.border,
                  backgroundColor: palette.background,
                },
              ]}
            >
              <View style={styles.rowTop}>
                <View style={styles.labelWrap}>
                  <Ionicons name={icon} size={15} color={palette.tint} />
                  <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
                    {decodedName}
                  </Text>
                </View>
                <View style={[styles.valueBadge, { backgroundColor: barColor }]}>
                  <Text style={styles.valueText}>{score || "-"}</Text>
                </View>
              </View>

              <View style={[styles.track, { backgroundColor: isDark ? "#233246" : "#dce7ee" }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${score}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Attributes;

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  titleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  list: {
    gap: 8,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  labelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  valueBadge: {
    borderRadius: 999,
    minWidth: 40,
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  valueText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  track: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
