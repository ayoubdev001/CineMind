import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getMovieById, getSimilarMovies } from "../../../services/movieService";
import { Ionicons } from "@expo/vector-icons";
import useFavoritesStore from "../../../store/favoritesStore";
import useWatchlistStore from "../../../store/watchlistStore";
import getErrorMessage from "../../../utils/getErrorMessage";

export default function MovieDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

    const movieId = Number(id);
  const isFavorite = useFavoritesStore((s) =>
    s.items.some((item) => item.movieId === movieId)
  );
  const isInWatchlist = useWatchlistStore((s) =>
    s.items.some((item) => item.movieId === movieId)
  );
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const toggleWatchlist = useWatchlistStore((s) => s.toggleWatchlist);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    Promise.all([getMovieById(id), getSimilarMovies(id)])
      .then(([movieData, similarData]) => {
        if (!cancelled) {
          setMovie(movieData);
          setSimilarMovies(similarData || []);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A60F14" />
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>{error ?? "Movie not found"}</Text>
        <TouchableOpacity
          style={styles.retry}
          onPress={() => setAttempt((n) => n + 1)}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : null;
  const typeLabel = movie.mediaType === "tv_show" ? "TV Show" : "Movie";
  const meta = [year, typeLabel].filter(Boolean).join(" • ");
  const genres = movie.Genres ?? [];
  const showPoster = movie.posterUrl && !imageFailed;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {showPoster ? (
        <Image
          source={{ uri: movie.posterUrl }}
          style={styles.poster}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <View style={[styles.poster, styles.placeholder]}>
          <Text style={styles.placeholderIcon}>🎬</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{movie.title}</Text>
        <Text style={styles.meta}>{meta}</Text>

                <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isFavorite && styles.actionBtnActivef]}
            onPress={() => toggleFavorite(movie)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.actionText}>
              {isFavorite ? "Favorited" : "Favorite"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, isInWatchlist && styles.actionBtnActivew]}
            onPress={() => toggleWatchlist(movie)}
          >
            <Ionicons
              name={isInWatchlist ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#ffffff"
            />
            <Text style={styles.actionText}>
              {isInWatchlist ? "In Watchlist" : "Watchlist"}
            </Text>
          </TouchableOpacity>
        </View>

        {genres.length > 0 ? (
          <View style={styles.genres}>
            {genres.map((g) => (
              <View key={g.id} style={styles.chip}>
                <Text style={styles.chipText}>{g.name}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Overview</Text>
        <Text style={styles.overview}>
          {movie.overview || "No description available."}
        </Text>

        {/* Similar Movies Horizontal Scroll */}
        {similarMovies.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarList}
            >
              {similarMovies.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarCard}
                  activeOpacity={0.7}
                  onPress={() => router.push(`/movie/${item.id}`)}
                >
                  {item.posterUrl ? (
                    <Image
                      source={{ uri: item.posterUrl }}
                      style={styles.similarPoster}
                    />
                  ) : (
                    <View style={[styles.similarPoster, styles.placeholder]}>
                      <Text style={{ fontSize: 24 }}>🎬</Text>
                    </View>
                  )}
                  <Text style={styles.similarTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#01053b",
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
  poster: {
    width: "60%",
    aspectRatio: 2 / 3,
    borderRadius: 16,
    backgroundColor: "#0b1055",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: 60,
  },
  info: {
    width: "100%",
    marginTop: 20,
  },
  title: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },
  meta: {
    color: "#9aa0c7",
    fontSize: 14,
    marginTop: 6,
  },
    actions: {
    flexDirection: "row",
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fcfbfb",
    borderRadius: 20,
    paddingHorizontal: 14,
    height: 40,
    marginRight: 10,
  },
  actionBtnActivef: {
    backgroundColor: "#A60F14",
  },
  actionBtnActivew:{
    backgroundColor:"#08ad02"
  },
  actionText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  genres: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#0004ff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#ffffff",
    fontSize: 12,
  },
  sectionTitle: {
    color: "#fd0202",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 22,
  },
  overview: {
    color: "#d5d8f0",
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  similarSection: {
    marginTop: 10,
    width: "100%",
  },
  similarList: {
    paddingVertical: 12,
  },
  similarCard: {
    marginRight: 14,
    width: 110,
  },
  similarPoster: {
    width: 110,
    height: 160,
    borderRadius: 12,
    backgroundColor: "#0b1055",
  },
  similarTitle: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },
});
