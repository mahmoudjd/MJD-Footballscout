import * as React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import AppSelect, { SelectOption } from "@/src/components/ui/AppSelect";
import { AdvancedSortBy, AdvancedSortOrder } from "@/src/data/Types";

type SortByOption = AdvancedSortBy | "";
type SortOrderOption = AdvancedSortOrder | "";
type AgeGroup = "" | "<20" | "20-30" | "30-40" | ">40";

interface Props {
  nationalities: SelectOption[];
  selectedPosition: string;
  selectedAgeGroup: AgeGroup;
  selectedNationality: string;
  clubQuery: string;
  minAge: string;
  maxAge: string;
  minValue: string;
  maxValue: string;
  sortBy: SortByOption;
  sortOrder: SortOrderOption;
  onPositionChange: (value: string) => void;
  onAgeGroupChange: (value: AgeGroup) => void;
  onNationalityChange: (value: string) => void;
  onClubQueryChange: (value: string) => void;
  onMinAgeChange: (value: string) => void;
  onMaxAgeChange: (value: string) => void;
  onMinValueChange: (value: string) => void;
  onMaxValueChange: (value: string) => void;
  onSortByChange: (value: SortByOption) => void;
  onSortOrderChange: (value: SortOrderOption) => void;
  onReset: () => void;
}

const positionOptions: SelectOption[] = [
  { value: "Forward", label: "Forward" },
  { value: "Midfielder", label: "Midfielder" },
  { value: "Defender", label: "Defender" },
  { value: "Goalkeeper", label: "Goalkeeper" },
  { value: "Manager", label: "Manager" },
];

const ageOptions: SelectOption[] = [
  { value: "<20", label: "< 20" },
  { value: "20-30", label: "20 - 30" },
  { value: "30-40", label: "30 - 40" },
  { value: ">40", label: "> 40" },
];

const sortByOptions: SelectOption[] = [
  { value: "elo", label: "ELO" },
  { value: "age", label: "Age" },
  { value: "value", label: "Market Value" },
  { value: "name", label: "Name" },
  { value: "timestamp", label: "Last Update" },
];

const sortOrderOptions: SelectOption[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

function NumberInput({
  placeholder,
  value,
  onChangeText,
  color,
  borderColor,
  placeholderColor,
  backgroundColor,
}: {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  color: string;
  borderColor: string;
  placeholderColor: string;
  backgroundColor: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType="number-pad"
      placeholderTextColor={placeholderColor}
      style={[
        styles.input,
        {
          color,
          borderColor,
          backgroundColor,
        },
      ]}
    />
  );
}

const Filter = ({
  nationalities,
  selectedPosition,
  selectedAgeGroup,
  selectedNationality,
  clubQuery,
  minAge,
  maxAge,
  minValue,
  maxValue,
  sortBy,
  sortOrder,
  onPositionChange,
  onAgeGroupChange,
  onNationalityChange,
  onClubQueryChange,
  onMinAgeChange,
  onMaxAgeChange,
  onMinValueChange,
  onMaxValueChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: Props) => {
  const { isDark } = React.useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  return (
    <View
      style={[
        styles.filter,
        {
          backgroundColor: Colors[colorKey].card,
          borderColor: Colors[colorKey].border,
        },
      ]}
    >
      <View style={styles.headingRow}>
        <View style={styles.labelRow}>
          <Ionicons name="options-outline" size={18} color={Colors[colorKey].tint} />
          <Text style={[styles.labelText, { color: Colors[colorKey].text }]}>Filter Players</Text>
        </View>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setShowAdvanced((current) => !current)}
            style={[
              styles.toggleButton,
              { borderColor: Colors[colorKey].border, backgroundColor: Colors[colorKey].background },
            ]}
          >
            <Text style={[styles.toggleButtonText, { color: Colors[colorKey].notification }]}>
              {showAdvanced ? "Less" : "Advanced"}
            </Text>
          </Pressable>
          <Pressable
            onPress={onReset}
            style={[
              styles.resetButton,
              { borderColor: Colors[colorKey].border, backgroundColor: Colors[colorKey].background },
            ]}
          >
            <Text style={[styles.resetButtonText, { color: Colors[colorKey].notification }]}>Reset</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.gridTwo}>
        <AppSelect
          icon="body-outline"
          placeholder="Position"
          options={positionOptions}
          onChange={onPositionChange}
          value={selectedPosition}
          compact
        />
        <AppSelect
          icon="flag-outline"
          placeholder="Country"
          options={nationalities}
          onChange={onNationalityChange}
          value={selectedNationality}
          compact
        />
      </View>

      {showAdvanced ? (
        <>
          <View style={styles.gridTwo}>
            <AppSelect
              icon="hourglass-outline"
              placeholder="Age group"
              options={ageOptions}
              onChange={(value) => onAgeGroupChange(value as AgeGroup)}
              value={selectedAgeGroup}
              compact
            />
            <AppSelect
              icon="funnel-outline"
              placeholder="Sort by"
              options={sortByOptions}
              onChange={(value) => onSortByChange(value as SortByOption)}
              value={sortBy}
              compact
            />
          </View>
          <View style={styles.gridTwo}>
            <AppSelect
              icon="swap-vertical-outline"
              placeholder="Order"
              options={sortOrderOptions}
              onChange={(value) => onSortOrderChange(value as SortOrderOption)}
              value={sortOrder}
              compact
            />
            <TextInput
              value={clubQuery}
              onChangeText={onClubQueryChange}
              placeholder="Club (e.g. Barcelona)"
              style={[
                styles.input,
                {
                  color: Colors[colorKey].text,
                  borderColor: Colors[colorKey].border,
                  backgroundColor: Colors[colorKey].card,
                },
              ]}
              placeholderTextColor={Colors[colorKey].notification}
            />
          </View>
          <View style={styles.gridTwo}>
            <NumberInput
              placeholder="Min age"
              value={minAge}
              onChangeText={onMinAgeChange}
              color={Colors[colorKey].text}
              borderColor={Colors[colorKey].border}
              placeholderColor={Colors[colorKey].notification}
              backgroundColor={Colors[colorKey].card}
            />
            <NumberInput
              placeholder="Max age"
              value={maxAge}
              onChangeText={onMaxAgeChange}
              color={Colors[colorKey].text}
              borderColor={Colors[colorKey].border}
              placeholderColor={Colors[colorKey].notification}
              backgroundColor={Colors[colorKey].card}
            />
          </View>
          <View style={styles.gridTwo}>
            <NumberInput
              placeholder="Min value"
              value={minValue}
              onChangeText={onMinValueChange}
              color={Colors[colorKey].text}
              borderColor={Colors[colorKey].border}
              placeholderColor={Colors[colorKey].notification}
              backgroundColor={Colors[colorKey].card}
            />
            <NumberInput
              placeholder="Max value"
              value={maxValue}
              onChangeText={onMaxValueChange}
              color={Colors[colorKey].text}
              borderColor={Colors[colorKey].border}
              placeholderColor={Colors[colorKey].notification}
              backgroundColor={Colors[colorKey].card}
            />
          </View>
        </>
      ) : null}
    </View>
  );
};

export default Filter;

const styles = StyleSheet.create({
  filter: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 8,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  labelText: {
    fontSize: 15,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  toggleButton: {
    borderWidth: 1,
    borderRadius: 9,
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: 9,
    minHeight: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  gridTwo: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
});
