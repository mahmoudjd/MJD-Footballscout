import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transfer } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { safeDecodeURIComponent } from "@/src/utils/playerDisplay";

type Props = {
  transfers: Transfer[];
};

function safeText(value: unknown) {
  if (typeof value !== "string") return "-";
  const trimmed = value.trim();
  return trimmed || "-";
}

function parseAmount(amount: unknown): {
  display: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
} {
  if (typeof amount !== "string" || !amount.trim()) {
    return { display: "Undisclosed", icon: "help-circle-outline", iconColor: "#94a3b8" };
  }

  const cleaned = amount.trim();
  if (/^\d{4}$/.test(cleaned)) {
    return { display: `Until ${cleaned}`, icon: "time-outline", iconColor: "#f59e0b" };
  }

  if (cleaned.toLowerCase() === "free transfer") {
    return { display: "Free Transfer", icon: "swap-horizontal-outline", iconColor: "#6366f1" };
  }

  const normalized = cleaned.replace(/€/g, "").trim();
  const compactAmountMatch = normalized.match(/^(\d+(?:\.\d+)?)([mk])$/i);
  if (compactAmountMatch) {
    return { display: `€${normalized.toUpperCase()}`, icon: "cash-outline", iconColor: "#16a34a" };
  }

  const numericProbe = normalized
    .replace(",", ".")
    .replace(/\s+/g, "")
    .replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(numericProbe);
  if (Number.isFinite(parsed) && parsed > 0 && parsed < 1000) {
    return { display: `${normalized} €`, icon: "cash-outline", iconColor: "#16a34a" };
  }

  return { display: `€${normalized}`, icon: "cash-outline", iconColor: "#16a34a" };
}

const Transfers = ({ transfers }: Props) => {
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
          <Ionicons name="swap-horizontal-outline" size={16} color={palette.tint} />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Transfers</Text>
      </View>

      <View style={styles.timelineWrap}>
        {transfers.map((transfer, index) => {
          const amountMeta = parseAmount(transfer.amount);
          const last = index === transfers.length - 1;
          return (
            <View key={`${transfer.season}-${transfer.team}-${transfer.amount}-${index}`} style={styles.timelineRow}>
              <View style={styles.timelineMarkerCol}>
                <View style={[styles.dot, { backgroundColor: palette.tint }]} />
                {!last ? (
                  <View style={[styles.line, { backgroundColor: isDark ? "#263445" : "#d7e2ea" }]} />
                ) : null}
              </View>

              <View
                style={[
                  styles.entryCard,
                  {
                    borderColor: palette.border,
                    backgroundColor: palette.background,
                  },
                ]}
              >
                <View style={styles.entryHeader}>
                  <Ionicons name="calendar-outline" size={15} color={palette.tint} />
                  <Text style={[styles.season, { color: palette.text }]} numberOfLines={1}>
                    {safeText(transfer.season)}
                  </Text>
                </View>

                <View style={styles.entryRow}>
                  <Ionicons name="shield-outline" size={14} color="#6366f1" />
                  <Text style={[styles.team, { color: palette.text }]} numberOfLines={1}>
                    {safeDecodeURIComponent(safeText(transfer.team))}
                  </Text>
                </View>

                <View style={styles.entryRow}>
                  <Ionicons name={amountMeta.icon} size={14} color={amountMeta.iconColor} />
                  <Text style={[styles.amount, { color: palette.notification }]} numberOfLines={1}>
                    {amountMeta.display}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default Transfers;

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
  timelineWrap: {
    gap: 4,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },
  timelineMarkerCol: {
    width: 18,
    alignItems: "center",
    paddingTop: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 3,
    marginBottom: -3,
    borderRadius: 99,
  },
  entryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginBottom: 8,
    gap: 7,
  },
  entryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  season: {
    fontSize: 13,
    fontWeight: "800",
  },
  team: {
    fontSize: 13,
    fontWeight: "700",
  },
  amount: {
    fontSize: 12,
    fontWeight: "700",
  },
});
