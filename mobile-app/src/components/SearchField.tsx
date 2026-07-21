import { useContext } from "react";
import { ActivityIndicator, StyleSheet, View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppContext } from "@/src/context/AppContext";
import Colors from "@/src/constants/Colors";
import { onTint, radius, shadow } from "@/src/constants/Theme";

type Props = {
  value: string;
  loading?: boolean;
  autoFocus?: boolean;
  handleChange: (text: string) => void;
  handleSearch: () => void;
};
const SearchField = ({ value, loading = false, autoFocus = false, handleChange, handleSearch }: Props) => {
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
          placeholder="Search by player name"
          editable
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          maxLength={40}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
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
          shadow(isDark).sm,
          {
            backgroundColor: colors.tint,
          },
          loading ? { opacity: 0.7 } : null,
        ]}
        disabled={loading}
        onPress={handleSearch}
      >
        {loading ? (
          <ActivityIndicator size="small" color={onTint(isDark)} />
        ) : (
          <Ionicons name="arrow-forward" size={18} color={onTint(isDark)} />
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  searchField: {
    width: "92%",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  inputWrap: {
    height: 50,
    flex: 1,
    borderRadius: 16,
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
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SearchField;
