import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { useContext } from "react";
import { AppContext } from "@/src/context/AppContext";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string | number;
  onPress?: () => void;
};

const ProfileInfoItem = ({ icon, label, value, onPress }: Props) => {
  const { isDark } = useContext(AppContext);
  const palette = Colors[isDark ? "dark" : "light"];
  const displayValue = String(value ?? "").trim() || "-";
  const isPressable = typeof onPress === "function";

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPressable}
      style={[
        styles.card,
        {
          borderColor: palette.border,
          backgroundColor: isPressable ? (isDark ? "rgba(215,255,69,0.07)" : "rgba(215,255,69,0.16)") : palette.card,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: isDark ? "rgba(215,255,69,0.10)" : "rgba(215,255,69,0.27)" }]}>
        <Ionicons name={icon} size={16} color={palette.tint} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: palette.notification }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.value,
            { color: isPressable ? palette.tint : palette.text },
          ]}
          numberOfLines={4}
        >
          {displayValue}
        </Text>
      </View>
    </Pressable>
  );
};

export default ProfileInfoItem;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  value: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
