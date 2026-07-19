import { StyleSheet, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, type Href } from "expo-router";

type Props = {
  title: string;
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  href: Href;
};
const HomeBTN = ({ title, iconName, href }: Props) => {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.btn}>
        <Text style={styles.btnText}>
          <Ionicons name={iconName} color={"#fff"} size={22} /> {title}
        </Text>
      </Pressable>
    </Link>
  );
};

export default HomeBTN;

const styles = StyleSheet.create({
  btn: {
    borderRadius: 15,
    width: 220,
    height: 50,
    marginHorizontal: 10,
    marginVertical: 20,
    backgroundColor: "#008fb3",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    shadowColor: "#666",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});
