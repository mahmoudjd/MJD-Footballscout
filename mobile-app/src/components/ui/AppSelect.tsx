import React, { useContext, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Menu } from "react-native-paper";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

export type SelectOption = {
  label: string;
  value: string;
};

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AppSelect({
  icon,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  compact = false,
  style,
}: Props) {
  const { isDark } = useContext(AppContext);
  const colorKey = isDark ? "dark" : "light";
  const [open, setOpen] = useState(false);

  const selectedLabel = useMemo(
    () => options.find((item) => item.value === value)?.label || placeholder,
    [options, value, placeholder],
  );

  return (
    <View style={[styles.container, style]}>
      <Menu
        visible={open}
        onDismiss={() => setOpen(false)}
        contentStyle={[
          styles.menu,
          {
            backgroundColor: Colors[colorKey].card,
            borderColor: Colors[colorKey].border,
          },
        ]}
        anchor={
          <Pressable
            disabled={disabled}
            onPress={() => setOpen(true)}
            style={[
              styles.trigger,
              compact ? styles.triggerCompact : undefined,
              {
                backgroundColor: Colors[colorKey].card,
                borderColor: Colors[colorKey].border,
              },
              disabled ? styles.disabled : undefined,
            ]}
          >
            <View style={styles.leadingContent}>
              {icon ? <Ionicons name={icon} size={compact ? 16 : 18} color={Colors[colorKey].notification} /> : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.triggerText,
                  compact ? styles.triggerTextCompact : undefined,
                  {
                    color:
                      value && selectedLabel !== placeholder
                        ? Colors[colorKey].text
                        : Colors[colorKey].notification,
                  },
                ]}
              >
                {selectedLabel || placeholder}
              </Text>
            </View>
            <Ionicons
              name={open ? "chevron-up-outline" : "chevron-down-outline"}
              size={compact ? 16 : 18}
              color={Colors[colorKey].notification}
            />
          </Pressable>
        }
      >
        <ScrollView style={styles.optionsScroll} nestedScrollEnabled>
          <Menu.Item
            title={placeholder}
            onPress={() => {
              onChange("");
              setOpen(false);
            }}
            titleStyle={{ color: Colors[colorKey].notification }}
          />
          {options.map((item) => (
            <Menu.Item
              key={item.value}
              title={item.label}
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              titleStyle={{ color: Colors[colorKey].text }}
              leadingIcon={item.value === value ? "check" : undefined}
            />
          ))}
        </ScrollView>
        <View style={styles.footer} />
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
  trigger: {
    width: "100%",
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leadingContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  triggerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "500",
  },
  triggerCompact: {
    minHeight: 36,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  triggerTextCompact: {
    fontSize: 13,
  },
  menu: {
    borderWidth: 1,
    borderRadius: 12,
    maxWidth: 360,
  },
  optionsScroll: {
    maxHeight: 300,
  },
  footer: {
    height: 2,
  },
  disabled: {
    opacity: 0.6,
  },
});
