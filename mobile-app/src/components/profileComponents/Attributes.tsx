import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

// Mirrors the web hero gradient + lime accents used across the profile.
const HERO_GRADIENT = ["#022c22", "#064e3b", "#065f46"] as const;
const LIME = "#d9f99d";

const attributeIcons: Record<string, React.ComponentProps<typeof Ionicons>["name"]> = {
  pace: "flash-outline",
  shot: "rocket-outline",
  pass: "swap-horizontal-outline",
  dribbling: "color-wand-outline",
  defence: "shield-checkmark-outline",
  defense: "shield-checkmark-outline",
  physical: "flame-outline",
};

function toAttributeScore(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

// Tier thresholds match the web attribute card tones.
function getScoreTone(score: number) {
  if (score >= 85) return { label: "Elite", fg: "#059669", soft: "rgba(5,150,105,0.14)" };
  if (score >= 70) return { label: "Strong", fg: "#65a30d", soft: "rgba(101,163,13,0.15)" };
  if (score >= 50) return { label: "Balanced", fg: "#d97706", soft: "rgba(217,119,6,0.16)" };
  return { label: "Developing", fg: "#e11d48", soft: "rgba(225,29,72,0.14)" };
}

const Attributes = ({ attributes }: Props) => {
  const { isDark } = React.useContext(AppContext);
  const palette = Colors[isDark ? "dark" : "light"];

  const scored = attributes.map((attr) => ({
    name: safeDecodeURIComponent(attr.name) || "Attribute",
    score: toAttributeScore(attr.value || ""),
  }));
  const average = scored.length
    ? Math.round(scored.reduce((sum, a) => sum + a.score, 0) / scored.length)
    : 0;
  const strongest = scored.reduce<(typeof scored)[number] | null>(
    (best, a) => (!best || a.score > best.score ? a : best),
    null,
  );

  return (
    <View style={styles.wrap}>
      {/* Performance hero — mirrors the web attributes header. */}
      <LinearGradient
        colors={HERO_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroText}>
          <View style={styles.heroPill}>
            <Ionicons name="sparkles" size={12} color={LIME} />
            <Text style={styles.heroPillText}>Performance Profile</Text>
          </View>
          <Text style={styles.heroTitle}>Player Attributes</Text>
          <Text style={styles.heroSubtitle}>
            A focused view of the player&apos;s technical, physical & tactical strengths.
          </Text>
          {strongest ? (
            <View style={styles.topAttrRow}>
              <Text style={styles.topAttrLabel}>Top Attribute</Text>
              <View style={styles.topAttrBadge}>
                <Text style={styles.topAttrBadgeText}>
                  {strongest.name}: {strongest.score}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Overall emblem. ponytail: full lime ring, not a proportional arc —
            react-native-svg isn't a dependency and a decorative arc isn't worth
            adding one. Swap for an svg Circle if a true progress ring is needed. */}
        <View style={styles.overallRing}>
          <View style={styles.overallInner}>
            <Text style={styles.overallValue}>{average}</Text>
            <Text style={styles.overallLabel}>OVERALL</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.list}>
        {scored.map((attr, index) => {
          const tone = getScoreTone(attr.score);
          const icon = attributeIcons[attr.name.toLowerCase()] || "sparkles-outline";
          return (
            <AnimatedEntrance key={`${attr.name}-${index}`} delay={index * 70}>
              <View
                style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLabelWrap}>
                    <View style={[styles.iconChip, { backgroundColor: tone.soft }]}>
                      <Ionicons name={icon} size={18} color={tone.fg} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[styles.attrName, { color: palette.text }]} numberOfLines={1}>
                        {attr.name}
                      </Text>
                      <View style={[styles.tierBadge, { borderColor: tone.fg, backgroundColor: tone.soft }]}>
                        <Text style={[styles.tierText, { color: tone.fg }]}>
                          {tone.label.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.scoreWrap}>
                    <Text style={[styles.scoreValue, numeric, { color: tone.fg }]}>{attr.score}</Text>
                    <Text style={[styles.scoreMax, { color: palette.notification }]}>/ 100</Text>
                  </View>
                </View>

                <View style={styles.barWrap}>
                  <AnimatedBar
                    progress={attr.score}
                    color={tone.fg}
                    trackColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(6,78,59,0.08)"}
                    height={10}
                    delay={index * 70}
                  />
                  <View style={styles.scaleRow}>
                    <Text style={[styles.scaleText, { color: palette.notification }]}>0</Text>
                    <Text style={[styles.scaleText, { color: palette.notification }]}>50</Text>
                    <Text style={[styles.scaleText, { color: palette.notification }]}>100</Text>
                  </View>
                </View>
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
  wrap: {
    gap: 12,
    marginBottom: 12,
  },
  hero: {
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  heroPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(217,249,157,0.2)",
    marginBottom: 10,
  },
  heroPillText: {
    color: "#ecfccb",
    fontSize: 11,
    fontWeight: "800",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    color: "rgba(236,253,245,0.72)",
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 6,
  },
  topAttrRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  topAttrLabel: {
    color: "rgba(236,253,245,0.75)",
    fontSize: 12,
    fontWeight: "600",
  },
  topAttrBadge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
    backgroundColor: "#bef264",
  },
  topAttrBadgeText: {
    color: "#022c22",
    fontSize: 12,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  overallRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 5,
    borderColor: "#bef264",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2,44,34,0.6)",
  },
  overallInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  overallValue: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
    lineHeight: 28,
  },
  overallLabel: {
    color: LIME,
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 1,
  },
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
    minWidth: 0,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  attrName: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  tierBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  scoreWrap: {
    alignItems: "flex-end",
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  scoreMax: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
  barWrap: {
    marginTop: 16,
  },
  scaleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 7,
  },
  scaleText: {
    fontSize: 10,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
