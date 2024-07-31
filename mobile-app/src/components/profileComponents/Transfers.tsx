import * as React from "react";
import { View, Text } from "react-native";
import { Transfer } from "../../data/Types";
import Colors from "@/src/constants/Colors";
import { AppContext } from "@/src/context/AppContext";

type Props = {
  transfers: Transfer[];
  styles: any;
};
const Transfers = ({ transfers, styles }: Props) => {
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
      <Text style={styles.heading}>Transfers</Text>
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
          <Text
            style={[
              styles.tableHeader,
              { color: Colors[isDark ? "dark" : "light"].text },
            ]}
          >
            Season
          </Text>
          <Text
            style={[
              styles.tableHeader,
              { color: Colors[isDark ? "dark" : "light"].text },
            ]}
          >
            Team
          </Text>
          <Text
            style={[
              styles.tableHeader,
              { color: Colors[isDark ? "dark" : "light"].text },
            ]}
          >
            Amount
          </Text>
        </View>
        {transfers.map((t, index) => (
          <View
            key={index}
            style={[
              styles.tableRow,
              {
                width: "100%",
                borderBottomWidth: 1,
                borderBottomColor: Colors[isDark ? "dark" : "light"].border,
              },
            ]}
          >
            <Text
              style={[
                styles.tableData,
                {
                  textAlign: "left",
                  flex: 2,
                  color: Colors[isDark ? "dark" : "light"].notification,
                },
              ]}
            >
              {t.season}
            </Text>
            <Text
              style={[
                styles.tableData,
                {
                  flex: 5,
                  color: Colors[isDark ? "dark" : "light"].notification,
                },
              ]}
            >
              {t.team}
            </Text>
            <Text
              style={[
                styles.tableData,
                {
                  textAlign: "right",
                  flex: 2,
                  color: Colors[isDark ? "dark" : "light"].notification,
                },
              ]}
            >
              {t.amount.replace("€", "")}
              {t.amount !== "Free Transfer" &&
              parseInt(t.amount) < 1000 &&
              t.amount
                ? " €"
                : ""}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Transfers;
