import * as React from "react";
import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Award } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import { safeDecodeURIComponent } from "@/src/utils/playerDisplay";

type Props = {
  awards: Award[];
};

const Awards = ({ awards }: Props) => {
  const { isDark } = React.useContext(AppContext);
  const palette = Colors[isDark ? "dark" : "light"];
  const { width } = useWindowDimensions();
  const twoColumns = width >= 640;

  return (
    <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={styles.titleRow}>
        <View style={[styles.titleIconWrap, { backgroundColor: isDark ? "rgba(201,226,101,0.10)" : "rgba(215,255,69,0.27)" }]}>
          <Ionicons name="star-outline" size={16} color={palette.tint} />
        </View>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>Awards</Text>
      </View>

      <View style={styles.grid}>
        {awards.map((award, index) => (
          <View key={`${award.name}-${award.number}-${index}`} style={[styles.gridItem, twoColumns ? styles.gridItemHalf : null]}>
            <View style={[styles.itemCard, { borderColor: palette.border, backgroundColor: palette.background }]}>
              <Ionicons name="star" size={19} color="#f59e0b" />
              <Text style={[styles.itemName, { color: palette.text }]} numberOfLines={1}>
                {safeDecodeURIComponent(award.name) || "-"}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: isDark ? "rgba(201,226,101,0.10)" : "rgba(215,255,69,0.27)" }]}>
                <Text style={[styles.countText, { color: palette.tint }]}>{award.number || "-"}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Awards;

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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 9,
  },
  gridItem: {
    width: "100%",
  },
  gridItemHalf: {
    width: "48.5%",
  },
  itemCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  itemName: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "700",
  },
  countBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: "center",
  },
  countText: {
    fontSize: 12,
    fontWeight: "800",
  },
});
