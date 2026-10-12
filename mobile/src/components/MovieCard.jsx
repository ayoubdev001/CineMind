import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";

const SCREEN_PADDING = 16; // left and right padding of the grid
const GAP = 12; // space between the two columns

export default function MovieCard({ movie }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - SCREEN_PADDING * 2 - GAP) / 2;
  const posterHeight = cardWidth * 1.5; // TMDB posters are 2:3

  const [imageFailed, setImageFailed] = useState(false);

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "";
  const showPoster = movie.posterUrl && !imageFailed;

  return (
    <TouchableOpacity
      style={{ width: cardWidth, marginBottom: 20 }}
      activeOpacity={0.8}
      onPress={() => router.push(`/movie/${movie.id}`)}
    >
      {showPoster ? (
        <Image
          source={{ uri: movie.posterUrl }}
          style={[styles.poster, { height: posterHeight }]}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.poster, styles.placeholder, { height: posterHeight }]}>
          <Text style={styles.placeholderIcon}>🎬</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
      {year ? <Text style={styles.year}>{year}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  poster: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#0b1055",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 40,
  },
  title: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  year: {
    color: "#9aa0c7",
    fontSize: 12,
    marginTop: 2,
  },
});