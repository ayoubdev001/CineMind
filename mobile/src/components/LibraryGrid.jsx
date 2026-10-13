import { FlatList, Text, StyleSheet } from "react-native";
import MovieCard from "./MovieCard";

export default function LibraryGrid({ items, emptyText, isLoading, onRefresh }) {
  // list items look like { id, movieId, Movie: {...} }; keep just the movies
  const movies = items.map((item) => item.Movie).filter(Boolean);

  return (
    <FlatList
      style={styles.container}
      data={movies}
      keyExtractor={(movie) => String(movie.id)}
      renderItem={({ item }) => <MovieCard movie={item} />}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshing={isLoading}
      onRefresh={onRefresh}
      ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    color: "#969BB6",
    fontSize: 15,
    textAlign: "center",
    marginTop: 60,
  },
});