import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getMovies } from "../services/movieService";
import MovieCard from "./MovieCard";

export default function GenreRow({ title, genreName }) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Fetch popular movies for this genre across all years
    getMovies({ genre: genreName, limit: 10, popular: true })
      .then((res) => {
        if (isMounted) setMovies(res.data || []);
      })
      .catch((err) => console.error(`Error fetching genre ${genreName}:`, err))
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [genreName]);

  if (!isLoading && movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.rowHeader}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#A78BFA" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MovieCard movie={item} width={140} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  loader: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    paddingHorizontal: 22,
  },
  cardWrapper: {
    marginRight: 14,
  },
});