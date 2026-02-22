import React, { useContext, useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";

type Props = {
  currentPage: number;
  totalPages: number;
  renderPlayerOfPage: (page: number) => void;
  isLoading?: boolean;
};

const Pagination = ({ currentPage, totalPages, renderPlayerOfPage, isLoading = false }: Props) => {
  const { isDark } = useContext(AppContext);

  useLayoutEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      renderPlayerOfPage(currentPage - 1);
    }
  }, [currentPage, totalPages, renderPlayerOfPage]);

  const colorKey = isDark ? "dark" : "light";
  const isPrevDisabled = currentPage <= 1 || isLoading;
  const isNextDisabled = currentPage >= totalPages || isLoading;

  return (
    <View style={styles.pagination}>
      <Pressable
        onPress={() => renderPlayerOfPage(currentPage - 1)}
        disabled={isPrevDisabled}
        style={[
          styles.navButton,
          {
            borderColor: Colors[colorKey].border,
            backgroundColor: Colors[colorKey].card,
          },
          isPrevDisabled ? styles.disabled : undefined,
        ]}
      >
        <Ionicons name="chevron-back" size={16} color={Colors[colorKey].tint} />
        <Text style={[styles.navButtonText, { color: Colors[colorKey].tint }]}>Prev</Text>
      </Pressable>

      <View
        style={[
          styles.pageBadge,
          {
            borderColor: Colors[colorKey].border,
            backgroundColor: Colors[colorKey].card,
          },
        ]}
      >
        <Text style={{ color: Colors[colorKey].text, fontWeight: "700" }}>
          Page {currentPage} / {totalPages}
        </Text>
      </View>

      <Pressable
        onPress={() => renderPlayerOfPage(currentPage + 1)}
        disabled={isNextDisabled}
        style={[
          styles.navButton,
          {
            borderColor: Colors[colorKey].border,
            backgroundColor: Colors[colorKey].card,
          },
          isNextDisabled ? styles.disabled : undefined,
        ]}
      >
        <Text style={[styles.navButtonText, { color: Colors[colorKey].tint }]}>Next</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors[colorKey].tint} />
      </Pressable>
    </View>
  );
};
export default Pagination;

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
  navButton: {
    minWidth: 72,
    height: 36,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 2,
  },
  pageBadge: {
    minWidth: 132,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: "center",
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.45,
  },
});
