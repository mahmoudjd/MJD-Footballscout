import { ImageBackground, StyleSheet } from "react-native";
import { Text, View } from "react-native";
import HomeBTN from "@/src/components/HomeBTN";
import { useState, useEffect, useMemo } from "react";

export default function HomeScreen() {
  const img1 = require("@/assets/fotos/0.jpg");
  const img2 = require("@/assets/fotos/1.jpg");
  const img4 = require("@/assets/fotos/3.jpg");
  const img5 = require("@/assets/fotos/4.jpg");
  const img6 = require("@/assets/fotos/5.jpg");
  const img7 = require("@/assets/fotos/6.jpeg");
  const images = useMemo(() => [img1, img2, img4, img5, img6, img7], []);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [images]);

  const imageUrl = images[currentImageIndex];

  return (
    <ImageBackground
      source={imageUrl}
      resizeMode="cover"
      style={[styles.image, styles.container]}
      blurRadius={1}
    >
      <View style={styles.texts}>
        <Text style={styles.welcomeText}>
          Welcome to <Text style={{ color: "#008fb3" }}>MJD-FootballScout</Text>
        </Text>
        <Text style={styles.subText}>
          Discover and explore talented football players
        </Text>
      </View>

      <View style={styles.btnContainer}>
        <HomeBTN
          title="Show List of Players"
          iconName="people-outline"
          href="/playerList"
        />
        <HomeBTN title="Search for players" iconName="search" href="/search" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  texts: {
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 5,
    padding: 5,
  },
  welcomeText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  subText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    color: "#fefefe",
  },
  btnContainer: {
    flexDirection: "column",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    objectFit: "fill",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
