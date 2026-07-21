import React, { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { PlayerType, ShadowTeamAssignment, ShadowTeamSlot } from "@/src/data/Types";
import { getPlayerDisplayName } from "@/src/utils/playerDisplay";

type Props = {
  slots: ShadowTeamSlot[];
  assignments: ShadowTeamAssignment[];
  playersById: Map<string, PlayerType>;
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
};

const SLOT_WIDTH = 78;
const SLOT_HEIGHT = 58;
const LINE = "rgba(255,255,255,0.55)";

/**
 * Native port of the web Shadow Team formation board: a portrait pitch with
 * the formation slots absolutely positioned from the server-provided x/y
 * percentages (GK at the bottom, attack at the top). The pitch keeps fixed
 * colours in both themes — grass is grass.
 */
export default function FormationBoard({
  slots,
  assignments,
  playersById,
  selectedSlotId,
  onSelectSlot,
}: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View style={styles.pitch} onLayout={onLayout}>
      {/* Pitch markings */}
      <View pointerEvents="none" style={styles.fieldBorder} />
      <View pointerEvents="none" style={styles.halfwayLine} />
      <View pointerEvents="none" style={styles.centerCircle} />
      <View pointerEvents="none" style={[styles.penaltyBox, styles.penaltyBoxTop]} />
      <View pointerEvents="none" style={[styles.penaltyBox, styles.penaltyBoxBottom]} />

      {size.width > 0
        ? slots.map((slot) => {
            const ids = assignments.find((item) => item.slotId === slot.id)?.playerIds || [];
            const primary = ids.length ? playersById.get(ids[0]) : undefined;
            const selected = slot.id === selectedSlotId;
            const left = (slot.x / 100) * size.width - SLOT_WIDTH / 2;
            const top = (slot.y / 100) * size.height - SLOT_HEIGHT / 2;

            return (
              <Pressable
                key={slot.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${slot.label}: ${primary ? getPlayerDisplayName(primary) : "empty"}`}
                onPress={() => onSelectSlot(slot.id)}
                style={[
                  styles.slot,
                  { left, top },
                  selected ? styles.slotSelected : primary ? styles.slotFilled : styles.slotEmpty,
                ]}
              >
                <Text
                  style={[
                    styles.slotLabel,
                    { color: selected ? "rgba(255,255,255,0.75)" : primary ? "rgba(10,33,24,0.6)" : "rgba(255,255,255,0.75)" },
                  ]}
                >
                  {slot.shortLabel}
                </Text>
                {primary ? (
                  <View style={styles.slotPlayerRow}>
                    <Image
                      source={primary.image || undefined}
                      style={styles.slotAvatar}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={140}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.slotPlayerName, { color: selected ? "#ffffff" : "#0a2118" }]}
                    >
                      {getPlayerDisplayName(primary)}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.slotAdd, { color: selected ? "#ffffff" : "rgba(255,255,255,0.92)" }]}>
                    Add player
                  </Text>
                )}
                {ids.length > 1 ? (
                  <View style={styles.altBadge}>
                    <Text style={styles.altBadgeText}>+{ids.length - 1}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pitch: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: "#047857",
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "#ffffff",
    overflow: "hidden",
  },
  fieldBorder: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 2,
    borderColor: LINE,
    borderRadius: 18,
  },
  halfwayLine: {
    position: "absolute",
    top: "50%",
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: LINE,
  },
  centerCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 92,
    height: 92,
    marginLeft: -46,
    marginTop: -46,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: LINE,
  },
  penaltyBox: {
    position: "absolute",
    left: "25%",
    width: "50%",
    height: 62,
    borderWidth: 2,
    borderColor: LINE,
  },
  penaltyBoxTop: {
    top: 12,
    borderTopWidth: 0,
  },
  penaltyBoxBottom: {
    bottom: 12,
    borderBottomWidth: 0,
  },
  slot: {
    position: "absolute",
    width: SLOT_WIDTH,
    minHeight: SLOT_HEIGHT,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 5,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  slotSelected: {
    backgroundColor: "#052e22",
    borderColor: "#d7ff45",
    transform: [{ scale: 1.06 }],
    zIndex: 2,
  },
  slotFilled: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "rgba(255,255,255,0.7)",
  },
  slotEmpty: {
    backgroundColor: "rgba(2,44,34,0.72)",
    borderColor: "rgba(255,255,255,0.7)",
    borderStyle: "dashed",
  },
  slotLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  slotPlayerRow: {
    marginTop: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
  },
  slotAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
  },
  slotPlayerName: {
    flexShrink: 1,
    fontSize: 10,
    fontWeight: "800",
  },
  slotAdd: {
    marginTop: 3,
    fontSize: 10.5,
    fontWeight: "800",
  },
  altBadge: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: "#d7ff45",
    alignItems: "center",
    justifyContent: "center",
  },
  altBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#0a2118",
  },
});
