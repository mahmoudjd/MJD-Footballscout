import React, { useContext, useLayoutEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";

type Props = {
  currentPage: number;
  totalPages: number;
  renderPlayerOfPage: (page: number) => void;
};

const Pagination = ({ currentPage, totalPages, renderPlayerOfPage }: Props) => {
  const { isDark } = useContext(AppContext);
  useLayoutEffect(() => {
    if (currentPage > totalPages && totalPages > 0)
      renderPlayerOfPage(currentPage - 1);
  }, []);
  return (
    <View style={styles.pagination}>
      <Pressable
        onPress={() => {
          renderPlayerOfPage(currentPage - 1);
        }}
        disabled={currentPage === 1}
      >
        <Ionicons name="arrow-back-circle-outline" size={26} color="#008fb3" />
      </Pressable>
      <Text
        style={{ padding: 15, color: Colors[isDark ? "dark" : "light"].text }}
      >
        {currentPage} of {totalPages}
      </Text>
      <Pressable
        onPress={() => {
          renderPlayerOfPage(currentPage + 1);
        }}
        disabled={currentPage === totalPages}
      >
        <Ionicons
          name="arrow-forward-circle-outline"
          size={26}
          color="#008fb3"
        />
      </Pressable>
    </View>
  );
};
export default Pagination;

const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 10,
  },
});
