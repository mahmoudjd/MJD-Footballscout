import { useContext } from "react";
import { ActivityIndicator, StyleSheet, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "@/src/context/AppContext";
import Colors from "@/src/constants/Colors";

type Props = {
  value: string;
  loading?: boolean;
  handleChange: (text: string) => void;
  handleSearch: () => void;
};
const SearchField = ({ value, loading = false, handleChange, handleSearch }: Props) => {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const colors = Colors[colorKey];

  return (
    <View style={styles.searchField}>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.notification} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.notification}
          onChangeText={handleChange}
          value={value}
          placeholder="Search by name, club, country"
          editable
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={40}
        />
        {value ? (
          <Pressable onPress={() => handleChange("")} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={colors.notification} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        style={[
          styles.pressField,
          {
            backgroundColor: colors.tint,
          },
          loading ? { opacity: 0.7 } : null,
        ]}
        disabled={loading}
        onPress={handleSearch}
      >
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="arrow-forward" size={18} color="#fff" />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  searchField: {
    width: "92%",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  inputWrap: {
    height: 44,
    flex: 1,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  pressField: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SearchField;
