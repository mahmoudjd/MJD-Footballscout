import { StyleSheet, View, Text } from "react-native";
import Colors from "@/src/constants/Colors";
import { useContext } from "react";
import { AppContext } from "@/src/context/AppContext";
type Props = {
  k: string;
  v: string | number;
};
const ProfileInfoItem = ({ k, v }: Props) => {
  const { isDark } = useContext(AppContext);
  return (
    <View style={styles.infoItem}>
      <Text style={{ color: Colors[isDark ? "dark" : "light"].notification }}>
        <Text
          style={[
            styles.strong,
            { color: Colors[isDark ? "dark" : "light"].notification },
          ]}
        >
          {k}{" "}
        </Text>
        {v}
      </Text>
    </View>
  );
};

export default ProfileInfoItem;

const styles = StyleSheet.create({
  infoItem: {
    paddingVertical: 5,
  },
  strong: {
    marginRight: 6,
    fontWeight: "bold",
  },
});
