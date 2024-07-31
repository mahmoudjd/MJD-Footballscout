import React, { useState, useMemo, useContext, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
} from "react-native";
import PlayerItem from "../components/PlayerItem";
import Pagination from "../components/Pagination";
import { Ionicons } from "@expo/vector-icons";
import Filter from "../components/Filter";
import { PlayerType } from "../data/Types";
import Colors from "../constants/Colors";
import { AppContext } from "../context/AppContext";
import { getAllPlayers } from "../apiServices";

const placeholder = {
  label: "All Countries",
  value: "",
};

const placeholderPos = {
  label: "All Positions",
  value: "",
};

const positions = [
  { label: "Goalkeeper", value: "goal" },
  { label: "Defender", value: "defender" },
  { label: "Midfielder", value: "midfielder" },
  { label: "Forward", value: "forward" },
];

export default function PlayerList() {
  const navigation = useNavigation();
  const { isDark } = useContext(AppContext);

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [countries, setCountries] = useState<
    { label: string; value: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedPos, setSelectedPos] = useState("");
  const [totalPages, setTotalPages] = useState(0);

  const elemsPerPage = 10;

  useEffect(() => {
    navigation.addListener("focus", async () => {
      await fetchData();
    });

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={async () => {
            setCurrentPage(1);
            await fetchData();
          }}
        >
          <Text>
            <Ionicons name="refresh" size={24} color="#fff" />
            {"  "}
          </Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  async function fetchData() {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data);
      const setOfCountries = new Set(
        data
          .map((player: PlayerType) => player.country)
          .filter((country: string) => country),
      );

      const uniqueCountries = Array.from(setOfCountries).sort((a, b) =>
        a.localeCompare(b),
      );

      setCountries(
        uniqueCountries.map((country: string) => ({
          label: country,
          value: country,
        })),
      );
      // Update total pages after fetching players data
      setTotalPages(Math.ceil(data.length / elemsPerPage));

      setSelectedCountry("");
      setSelectedPos("");
    } catch (err) {
      setError(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const idxOfLast = currentPage * elemsPerPage;
  const idxOfFirst = idxOfLast - elemsPerPage;

  // Filter players by countries and positions
  const filteredPlayers =
    selectedCountry || selectedPos
      ? players.filter(
          (player: PlayerType) =>
            player.country.includes(selectedCountry) &&
            player.position.toLowerCase().includes(selectedPos),
        )
      : players;

  // players to render of currentPage
  const currentPlayers = useMemo(() => {
    return filteredPlayers ? filteredPlayers.slice(idxOfFirst, idxOfLast) : [];
  }, [filteredPlayers, idxOfFirst, idxOfLast]);

  const renderPlayerOfPage = (page: number) => {
    setCurrentPage(page);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setCurrentPage(1);
    // Update total pages based on the number of players on current page
    setTotalPages(Math.ceil(filteredPlayers.length / elemsPerPage));
  };

  const handlePosChange = (value: string) => {
    setSelectedPos(value);
    setCurrentPage(1);
    setTotalPages(Math.ceil(filteredPlayers.length / elemsPerPage));
  };

  return (
    <>
      <View
        style={[
          { backgroundColor: Colors[isDark ? "dark" : "light"].background },
          styles.container,
        ]}
      >
        <Filter
          countries={countries}
          positions={positions}
          placeholder={placeholder}
          placeholderPos={placeholderPos}
          handlePosChange={handlePosChange}
          handleCountryChange={handleCountryChange}
          selectedCountry={selectedCountry}
          selectedPos={selectedPos}
        />
        {loading ? (
          <View
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <ActivityIndicator animating={true} size="large" color="#008fb3" />
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: failed to fetch data!</Text>
          </View>
        ) : (
          <>
            <Pagination
              renderPlayerOfPage={renderPlayerOfPage}
              totalPages={totalPages}
              currentPage={currentPage}
            />

            {currentPlayers && (
              <FlatList
                data={currentPlayers}
                renderItem={({ item }) => <PlayerItem player={item} />}
                numColumns={1}
                contentContainerStyle={{ gap: 0, padding: 5 }}
              />
            )}
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    width: "100%",
  },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 18,
    color: "red",
  },
  container: {
    width: "100%",
    flex: 1,
    marginBottom: 5,
    paddingHorizontal: 15,
  },
});
