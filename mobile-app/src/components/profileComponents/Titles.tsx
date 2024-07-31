import * as React from "react";
import { View, Text } from "react-native";
import { Title } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";
type Props = {
  titles: Title[];
  styles: any;
};
const Titles = ({ titles, styles }: Props) => {
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
      <Text style={styles.heading}>Titles</Text>
      <View style={styles.infoTable}>
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
              Name of Title
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
        {titles.map((a, index) => (
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

export default Titles;
