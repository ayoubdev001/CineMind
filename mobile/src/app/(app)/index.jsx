import { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useMoviesStore from "../../store/moviesStore";
import useAuthStore from "../../store/authStore";
import MovieCard from "../../components/MovieCard";

export default function Home() {
  const movies = useMoviesStore((state) => state.movies);
  const isLoading = useMoviesStore((state) => state.isLoading);
  const isRefreshing = useMoviesStore((state) => state.isRefreshing);
  const isLoadingMore = useMoviesStore((state) => state.isLoadingMore);
  const error = useMoviesStore((state) => state.error);
  const fetchMovies = useMoviesStore((state) => state.fetchMovies);
  const fetchMore = useMoviesStore((state) => state.fetchMore);

  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (movies.length === 0) fetchMovies();
  }, []);

  let content;

  if (isLoading && movies.length === 0) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A60F14" />
      </View>
    );
  } else if (error && movies.length === 0) {
    content = (
      <View style={styles.center}>
        <Text style={styles.message}>{error}</Text>
        <TouchableOpacity style={styles.retry} onPress={() => fetchMovies()}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={movies}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MovieCard movie={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={() => fetchMovies({ refresh: true })}
        onEndReached={fetchMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text style={styles.message}>No movies playing right now.</Text>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#A60F14" />
          ) : null
        }
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* temporary top bar: replaced by the real header and profile screen later */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Now Playing</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  logout: {
    color: "#A60F14",
    fontSize: 14,
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  message: {
    color: "#ffffff",
    fontSize: 16,
    textAlign: "center",
  },
  retry: {
    marginTop: 20,
    backgroundColor: "#A60F14",
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});