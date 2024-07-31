import * as React from "react";
import { View, Text } from "react-native";
import { Award } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
type Props = {
  awards: Award[];
  styles: any;
};
const Awards = ({ awards, styles }: Props) => {
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
      <Text style={styles.heading}>Awards</Text>
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
              Name of Award
            </Text>
          </View>
          <View>
            <Text
              style={[
                styles.tableHeader,
                { color: Colors[isDark ? "dark" : "light"].text },
              ]}
            >
              Received
            </Text>
          </View>
        </View>
        {awards.map((a, index) => (
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
                {a.number}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Awards;
