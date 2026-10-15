import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMovies } from "../../services/movieService";
import getErrorMessage from "../../utils/getErrorMessage";
import MovieCard from "../../components/MovieCard";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0); // bump to retry

  const term = query.trim();

  useEffect(() => {
    // nothing typed: clear everything and stop
    if (!term) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // wait 400ms after the last keystroke before asking the server
    const timer = setTimeout(async () => {
      try {
        const { data } = await getMovies({ search: term, limit: 50 });
        if (!cancelled) setResults(data);
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 400);

    // runs when the text changes again (or the screen closes)
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, attempt]);

  let content;

  if (!term) {
    content = (
      <View style={styles.center}>
        <Ionicons name="search" size={44} color="#2A2F5A" />
        <Text style={styles.message}>Search movies and shows by title</Text>
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.center}>
        <Text style={styles.message}>{error}</Text>
        <TouchableOpacity
          style={styles.retry}
          onPress={() => setAttempt((n) => n + 1)}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (isLoading && results.length === 0) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </View>
    );
  } else if (results.length === 0) {
    content = (
      <View style={styles.center}>
        <Text style={styles.message}>No results for "{term}"</Text>
      </View>
    );
  } else {
    content = (
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <MovieCard movie={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#969BB6" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title..."
          placeholderTextColor="#969BB6"
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={20} color="#969BB6" />
          </TouchableOpacity>
        ) : null}
      </View>

      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b1055",
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    marginLeft: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  row: {
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  message: {
    color: "#969BB6",
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
  },
  retry: {
    marginTop: 20,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});