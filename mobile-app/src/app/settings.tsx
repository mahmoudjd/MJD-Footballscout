import * as React from "react";
import { View, Text, Switch, Platform } from "react-native";
import { AppContext } from "../context/AppContext";
import Colors from "../constants/Colors";
import { StatusBar } from "expo-status-bar";

export default function ModalScreen() {
  const { isDark, setIsDark } = React.useContext(AppContext);
  return (
    <View
      style={{
        backgroundColor: Colors[isDark ? "dark" : "light"].background,
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 45,
      }}
    >
      <Text
        style={{
          color: Colors[isDark ? "dark" : "light"].text,
          fontSize: 20,
          fontWeight: "800",
        }}
      >
        Theme Switch
      </Text>

      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 8,
          paddingVertical: 16,
          backgroundColor: Colors[isDark ? "dark" : "light"].card,
          borderRadius: 8,
          marginTop: 8,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: isDark ? "#fff" : "#111",
            fontSize: 16,
            paddingHorizontal: 10,
          }}
        >
          {isDark ? "Light" : "Dark"} mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={() => setIsDark((prev: boolean) => !prev)}
          trackColor={{ false: "#767577", true: "lightblue" }}
          thumbColor={"#f4f3f4"}
        />
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
