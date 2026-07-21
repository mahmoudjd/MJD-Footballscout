import * as React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PlayerType } from "../../data/Types";
import { getPlayerDisplayName, safeDecodeURIComponent } from "@/src/utils/playerDisplay";

type Props = {
  player: PlayerType;
};

type HeroTone = {
  gradient: [string, string];
  badge: string;
};

function getHeroTone(position: string): HeroTone {
  if (position.includes("Forward")) {
    return { gradient: ["#be123c", "#7f1d1d"], badge: "rgba(255,255,255,0.2)" };
  }
  if (position.includes("Midfielder")) {
    return { gradient: ["#0f766e", "#134e4a"], badge: "rgba(255,255,255,0.2)" };
  }
  if (position.includes("Defender")) {
    return { gradient: ["#1d4ed8", "#1e3a8a"], badge: "rgba(255,255,255,0.2)" };
  }
  return { gradient: ["#ca8a04", "#854d0e"], badge: "rgba(255,255,255,0.22)" };
}

function InfoBadge({
  icon,
  label,
  background,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  background: string;
}) {
  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Ionicons name={icon} size={12} color="#fff" />
      <Text style={styles.badgeText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const HeaderProfile = ({ player }: Props) => {
  const displayName = getPlayerDisplayName(player);
  const tone = getHeroTone(player.position || "");

  return (
    <LinearGradient
      colors={tone.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.topMetaRow}>
        {player.number ? (
          <InfoBadge icon="shirt-outline" label={`#${player.number}`} background={tone.badge} />
        ) : (
          <View />
        )}
        {player.age ? (
          <InfoBadge icon="hourglass-outline" label={`${player.age}y`} background={tone.badge} />
        ) : null}
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={player.image || undefined}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={180}
          />
        </View>

        <View style={styles.identityTextWrap}>
          <Text style={styles.name} numberOfLines={2}>
            {displayName}
          </Text>

          {player.title ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {safeDecodeURIComponent(player.title)}
            </Text>
          ) : null}

          <View style={styles.badgeRow}>
            {player.position ? (
              <InfoBadge icon="navigate-outline" label={player.position} background={tone.badge} />
            ) : null}
            {player.currentClub ? (
              <InfoBadge icon="shield-outline" label={player.currentClub} background={tone.badge} />
            ) : null}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default HeaderProfile;

const styles = StyleSheet.create({
  hero: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  topMetaRow: {
    minHeight: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  identityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  identityTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 23,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    lineHeight: 27,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 17,
  },
  badgeRow: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  badge: {
    maxWidth: "100%",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    maxWidth: 170,
  },
});
