import React from "react";
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import HeaderProfile from "./profileComponents/HeaderProfile";
import ProfileInfo from "./profileComponents/ProfileInfo";
import Transfers from "./profileComponents/Transfers";
import Attributes from "./profileComponents/Attributes";
import Titles from "./profileComponents/Titles";
import Awards from "./profileComponents/Awards";
import Colors from "../constants/Colors";
import { useContext, useLayoutEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { PlayerType } from "../data/Types";
import { useNavigation } from "expo-router";
import { updatePlayer, deletePlayer } from "../apiServices";

type Props = {
  person: PlayerType;
};

const PlayerProfile = ({ person }: Props) => {
  const navigation = useNavigation();
  const { isDark } = useContext(AppContext);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [player, setPlayer] = useState<PlayerType>(person);
  const playerId = person._id;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", columnGap: 5 }}>
          <Pressable
            onPress={() => {
              confirmDelete();
            }}
          >
            <Ionicons name="trash" size={24} color={isDark ? "#fff" : "#000"} />
          </Pressable>

          <Pressable onPress={handleUpdate}>
            <Text>
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </Text>
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setPlayer(await updatePlayer(playerId));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this player", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: handleDelete,
      },
    ]);
  };

  const handleDelete = async () => {
    try {
      await deletePlayer(playerId);
      navigation.goBack();
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          backgroundColor: Colors[isDark ? "dark" : "light"].background,
        }}
      >
        <ActivityIndicator animating={true} size="large" color="#008fb3" />
      </View>
    );
  }

  return !player ? (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>not found Player!</Text>
    </View>
  ) : (
    <ScrollView
      style={[
        styles.profilePage,
        { backgroundColor: Colors[isDark ? "dark" : "light"].background },
      ]}
    >
      <HeaderProfile player={player} />

      <Text
        style={{
          fontSize: 11,
          color: Colors[isDark ? "dark" : "light"].notification,
        }}
      >
        Data last updated: {new Date(player.timestamp).toLocaleString()}
      </Text>

      <View
        style={[
          styles.hr,
          { borderBottomColor: Colors[isDark ? "dark" : "light"].text },
        ]}
      />

      <View
        style={[
          {
            backgroundColor: Colors[isDark ? "dark" : "light"].card,
            borderColor: Colors[isDark ? "dark" : "light"].border,
          },
          styles.infos,
        ]}
      >
        <Text style={styles.heading}>Details</Text>
        <ProfileInfo player={player} />
      </View>

      <View
        style={[
          styles.hr,
          { borderBottomColor: Colors[isDark ? "dark" : "light"].text },
        ]}
      />

      {player.playerAttributes.length > 0 && (
        <>
          <Attributes attributes={player.playerAttributes} styles={styles} />
          <View
            style={[
              styles.hr,
              { borderBottomColor: Colors[isDark ? "dark" : "light"].text },
            ]}
          />
        </>
      )}
      {player.transfers.length > 0 && (
        <>
          <Transfers transfers={player.transfers} styles={styles} />
          <View
            style={[
              styles.hr,
              { borderBottomColor: Colors[isDark ? "dark" : "light"].text },
            ]}
          />
        </>
      )}
      {player.titles.length > 0 && (
        <>
          <Titles titles={player.titles} styles={styles} />
          <View
            style={[
              styles.hr,
              { borderBottomColor: Colors[isDark ? "dark" : "light"].text },
            ]}
          />
        </>
      )}
      {player.awards.length > 0 && (
        <>
          <Awards awards={player.awards} styles={styles} />
          <View
            style={[
              styles.hr,
              {
                marginBottom: 20,
                borderBottomColor: Colors[isDark ? "dark" : "light"].text,
              },
            ]}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  profilePage: {
    flex: 1,
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  infos: {
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    padding: 8,
  },
  hr: {
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  tables: {
    padding: 8,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008fb3",
    marginBottom: 5,
  },
  infoTable: {
    marginBottom: 10,
  },
  tableHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    marginBottom: 5,
  },
  tableData: {
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  errorBox: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default PlayerProfile;
