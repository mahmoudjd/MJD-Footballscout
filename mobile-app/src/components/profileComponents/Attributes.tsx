import * as React from "react";
import { View, Text } from "react-native";
import { Attribute } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type Props = {
  attributes: Attribute[];
  styles: any;
};
const Attributes = ({ attributes, styles }: Props) => {
  const { isDark } = React.useContext(AppContext);
  return (
    <View
      style={[
        styles.tables,
        {
          backgroundColor: Colors[isDark ? "dark" : "light"].card,
          borderColor: Colors[isDark ? "dark" : "light"].border,
          borderWidth: 1,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
        },
      ]}
    >
      <Text style={styles.heading}>Attributes</Text>
      <View
        style={[
          styles.infoTable,
          { color: Colors[isDark ? "dark" : "light"].text },
        ]}
      >
        <View
          style={[
            styles.tableRow,
            {
              borderBottomColor: Colors[isDark ? "dark" : "light"].border,
              borderBottomWidth: 2,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.tableHeader,
                { color: Colors[isDark ? "dark" : "light"].text },
              ]}
            >
              Name of Attribute
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.tableHeader,
                { color: Colors[isDark ? "dark" : "light"].text },
              ]}
            >
              Value
            </Text>
          </View>
        </View>
        {attributes.map((a, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              {
                borderBottomWidth: 1,
                borderBottomColor: Colors[isDark ? "dark" : "light"].border,
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.tableData,
                  { color: Colors[isDark ? "dark" : "light"].notification },
                ]}
              >
                {decodeURIComponent(a.name)}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  styles.tableData,
                  { color: Colors[isDark ? "dark" : "light"].notification },
                ]}
              >
                {a.value}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Attributes;
