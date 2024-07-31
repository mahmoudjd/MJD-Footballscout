import React, { useState, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  View,
  ScrollView,
} from "react-native";
import { PlayerType } from "@/src/data/Types";
import PlayerItem from "@/src/components/PlayerItem";
import { AppContext } from "@/src/context/AppContext";
import Colors from "@/src/constants/Colors";
import SearchField from "@/src/components/SearchField";
import { convert } from "@/src/convert";
import { getAllPlayers, searchPlayers } from "@/src/apiServices";

export default function SearchScreen() {
  const { isDark } = useContext(AppContext);
  const navigation = useNavigation();
  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [results, setResults] = useState<PlayerType[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    navigation.addListener("focus", async () => {
      setPlayers(await getAllPlayers());
    });
  }, [navigation]);

  function handleChange(text: string) {
    setSearchTerm(text.trim());
    let foundPlayers = players.filter(
      (player: PlayerType) =>
        convert(player.name)
          .toLowerCase()
          .includes(convert(searchTerm).toLowerCase().trim()) ||
        convert(player.title)
          .toLowerCase()
          .includes(convert(searchTerm).toLowerCase().trim()) ||
        convert(player.fullName)
          .toLowerCase()
          .includes(convert(searchTerm).toLowerCase().trim()),
    );
    foundPlayers ? setResults(foundPlayers) : setPlayers([]);
  }

  async function handleSearch() {
    try {
      if (searchTerm.trim().length < 3) {
        Alert.alert("invalid name!");
        return;
      }
      setLoading(true);
      setResults(await searchPlayers(searchTerm));
      setPlayers(await getAllPlayers());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        backgroundColor: Colors[isDark ? "dark" : "light"].background,
        flex: 1,
        alignItems: "center",
      }}
    >
      <SearchField handleChange={handleChange} handleSearch={handleSearch} />
      <ScrollView style={styles.resultsContainer}>
        {loading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator animating={true} size="large" color="#008fb3" />
          </View>
        ) : (
          results.map((player, index) => (
            <PlayerItem key={index} player={player} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flex: 1,
    width: "100%",
    marginTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsContainer: {
    flex: 1,
    width: "90%",
  },
});
