import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MovieCard from "./MovieCard";

const MAX_ITEMS = 10; // the row shows the 10 newest; "Show all" opens the rest

export default function LibraryRow({ title, items, emptyText, onShowAll }) {
  // list items look like { id, movieId, Movie: {...} }; keep just the movies
  const movies = items.map((item) => item.Movie).filter(Boolean);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {title}
          {movies.length > 0 ? (
            <Text style={styles.count}>  {movies.length}</Text>
          ) : null}
        </Text>

        {movies.length > 0 ? (
          <TouchableOpacity style={styles.showAll} onPress={onShowAll}>
            <Text style={styles.showAllText}>Show all</Text>
            <Ionicons name="chevron-forward" size={16} color="#A78BFA" />
          </TouchableOpacity>
        ) : null}
      </View>

      {movies.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        <FlatList
          data={movies.slice(0, MAX_ITEMS)}
          keyExtractor={(movie) => String(movie.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <MovieCard movie={item} width={120} />
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  count: {
    color: "#969BB6",
    fontSize: 14,
    fontWeight: "600",
  },
  showAll: {
    flexDirection: "row",
    alignItems: "center",
  },
  showAllText: {
    color: "#A78BFA",
    fontSize: 13,
    fontWeight: "700",
  },
  empty: {
    color: "#969BB6",
    fontSize: 13,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  cardWrapper: {
    marginRight: 14,
  },
});