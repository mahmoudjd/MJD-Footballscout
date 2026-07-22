import React, { useContext } from "react";
import { StyleSheet, View } from "react-native";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
import Skeleton from "@/src/components/ui/Skeleton";

const SkeletonBlock = Skeleton;

export default function HomeInsightsSkeleton() {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorKey].background,
        },
      ]}
    >
      <SkeletonBlock height={26} width={220} />
      <View style={{ height: 8 }} />
      <SkeletonBlock height={14} width={280} />

      <View style={styles.grid3}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock height={76} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonBlock height={76} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonBlock height={76} />
        </View>
      </View>

      <View style={styles.grid2}>
        <View style={{ flex: 1 }}>
          <SkeletonBlock height={150} />
        </View>
        <View style={{ flex: 1 }}>
          <SkeletonBlock height={150} />
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <SkeletonBlock height={170} />
        <SkeletonBlock height={170} />
        <SkeletonBlock height={170} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    gap: 12,
  },
  grid3: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
  grid2: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },
});
