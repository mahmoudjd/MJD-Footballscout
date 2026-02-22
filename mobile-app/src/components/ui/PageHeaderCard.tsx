import React, { ReactNode, useContext } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import CardSurface from "@/src/components/ui/CardSurface";

type Props = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function PageHeaderCard({ icon, title, subtitle, children, style }: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];
  const iconWrapBackground = isDark ? "rgba(34,211,238,0.14)" : "rgba(14,165,165,0.11)";

  return (
    <CardSurface style={style} padding={12}>
      <View style={styles.titleRow}>
        <View style={[styles.iconWrap, { backgroundColor: iconWrapBackground }]}>
          <Ionicons name={icon} size={17} color={colors.tint} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.notification }]}>{subtitle}</Text> : null}
      {children ? <View style={styles.children}>{children}</View> : null}
    </CardSurface>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
  },
  children: {
    marginTop: 9,
  },
});
