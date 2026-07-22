import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attribute } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { safeDecodeURIComponent } from "@/src/utils/playerDisplay";
import AnimatedBar from "@/src/components/ui/AnimatedBar";
import AnimatedEntrance from "@/src/components/ui/AnimatedEntrance";
import { numeric } from "@/src/constants/Theme";

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

function getScoreTone(score: number) {
  if (score >= 80) return { fg: "#16a34a", soft: "rgba(22,163,74,0.14)" };
  if (score >= 60) return { fg: "#f59e0b", soft: "rgba(245,158,11,0.16)" };
  return { fg: "#ef4444", soft: "rgba(239,68,68,0.14)" };
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
            { backgroundColor: isDark ? "rgba(201,226,101,0.10)" : "rgba(215,255,69,0.27)" },
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
          const tone = getScoreTone(score);
          const icon = attributeIcons[decodedName.toLowerCase()] || "sparkles-outline";

          return (
            <AnimatedEntrance key={`${attr.name}-${attr.value}-${index}`} delay={index * 70}>
              <View
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
                    <View style={[styles.iconChip, { backgroundColor: tone.soft }]}>
                      <Ionicons name={icon} size={14} color={tone.fg} />
                    </View>
                    <Text style={[styles.label, { color: palette.text }]} numberOfLines={1}>
                      {decodedName}
                    </Text>
                  </View>
                  <View style={[styles.valueBadge, { backgroundColor: tone.fg }]}>
                    <Text style={[styles.valueText, numeric]}>{score || "-"}</Text>
                  </View>
                </View>

                <AnimatedBar
                  progress={score}
                  color={tone.fg}
                  trackColor={isDark ? "#233246" : "#dce7ee"}
                  delay={index * 70}
                />
              </View>
            </AnimatedEntrance>
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
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
});
