import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";

interface Props {
  countries: Array<{ label: string; value: string }>;
  positions: Array<{ label: string; value: string }>;
  placeholder: { label: string; value: string };
  placeholderPos: { label: string; value: string };
  selectedPos: string;
  selectedCountry: string;
  handleCountryChange: (value: string) => void;
  handlePosChange: (value: string) => void;
}
const Filter = ({
  countries,
  positions,
  placeholder,
  placeholderPos,
  handleCountryChange,
  handlePosChange,
  selectedPos,
  selectedCountry,
}: Props) => {
  const { isDark } = React.useContext(AppContext);
  return (
    <View
      style={[
        styles.filter,
        {
          backgroundColor: Colors[isDark ? "dark" : "light"].card,
          borderColor: Colors[isDark ? "dark" : "light"].border,
        },
      ]}
    >
      <Text>
        <Ionicons name="filter-outline" size={24} color="#008fb3" />
      </Text>
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          placeholder={placeholder}
          style={{
            placeholder: {
              color: Colors[isDark ? "dark" : "light"].notification,
            },
            inputIOS: {
              fontSize: 15,
              paddingVertical: 10,
              paddingHorizontal: 10,
              color: Colors[isDark ? "dark" : "light"].notification,
            },
            inputAndroid: {
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 14,
              color: Colors[isDark ? "dark" : "light"].notification,
            },
          }}
          items={countries}
          onValueChange={handleCountryChange}
          value={selectedCountry}
        />
      </View>

      <Ionicons name="filter-outline" size={24} color="#008fb3" />
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          placeholder={placeholderPos}
          style={{
            placeholder: {
              color: Colors[isDark ? "dark" : "light"].notification,
            },
            inputIOS: {
              fontSize: 16,
              paddingVertical: 10,
              paddingHorizontal: 10,
              color: Colors[isDark ? "dark" : "light"].notification,
            },
            inputAndroid: {
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 14,
              color: Colors[isDark ? "dark" : "light"].notification,
            },
          }}
          items={positions}
          onValueChange={handlePosChange}
          value={selectedPos}
        />
      </View>
    </View>
  );
};

export default Filter;

const styles = StyleSheet.create({
  filter: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  pickerContainer: {
    flex: 1,
  },
});
