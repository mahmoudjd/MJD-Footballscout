import { useContext } from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { AppContext } from "@/src/context/AppContext";
import Colors from "@/src/constants/Colors";

type Props = {
  handleChange: (text: string) => void;
  handleSearch: () => void;
};
const SearchField = ({ handleChange, handleSearch }: Props) => {
  const { isDark } = useContext(AppContext);

  return (
    <View style={styles.searchField}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[isDark ? "dark" : "light"].card,
            borderColor: Colors[isDark ? "dark" : "light"].border,
            color: Colors[isDark ? "dark" : "light"].text,
          },
        ]}
        placeholderTextColor={Colors[isDark ? "dark" : "light"].text}
        onChangeText={handleChange}
        placeholder="Enter player's name"
        editable
        autoCorrect={false}
        autoCapitalize="none"
        maxLength={40}
      />
      <View style={styles.btn}>
        <Pressable style={styles.pressField} onPress={handleSearch}>
          <FontAwesome name="search" size={22} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchField: {
    width: "100%",
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10,
    rowGap: 5,
  },
  input: {
    height: 40,
    width: "80%",
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
    borderWidth: 1,
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  btn: {
    height: 40,
    marginTop: 20,
    backgroundColor: "#008fb3",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    textAlign: "center",
  },
  pressField: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    flex: 1,
    width: "100%",
  },
});

export default SearchField;
