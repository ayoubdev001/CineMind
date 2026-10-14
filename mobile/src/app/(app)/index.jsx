import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

import useMoviesStore from "../../store/moviesStore";
import useAuthStore from "../../store/authStore";
import MovieCard from "../../components/MovieCard";
import Avatar from "../../components/Avatar";
import GenreRow from "../../components/GenreRow";

export default function Home() {
  const movies = useMoviesStore((state) => state.movies);
  const isLoading = useMoviesStore((state) => state.isLoading);
  const isLoadingMore = useMoviesStore((state) => state.isLoadingMore);
  const error = useMoviesStore((state) => state.error);
  const fetchMovies = useMoviesStore((state) => state.fetchMovies);
  const fetchMore = useMoviesStore((state) => state.fetchMore);

  const user = useAuthStore((state) => state.user);
  const mainScrollRef = useRef(null);

  useEffect(() => {
    if (movies.length === 0) fetchMovies();
  }, []);

  const scrollToTop = () => {
    mainScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const retry = () => fetchMovies();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#080B1D" />

      {/* Main vertical ScrollView holding all rows */}
      <ScrollView
        ref={mainScrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../../assets/images/icon.png")}
                style={styles.logo}
              />
            </View>

            <View>
              <Text style={styles.brandName}>
                WATCH<Text style={styles.brandAccent}> IT</Text>
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => router.push("/search")}
              accessibilityLabel="Search movies"
            >
              <Ionicons name="search-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.avatarButton}
              activeOpacity={0.8}
              onPress={() => router.push("/profile")}
              accessibilityLabel="Open profile"
            >
              <Avatar name={user?.username} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero heading */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Movies worth{"\n"}staying{" "}
            <Text style={styles.heroAccent}>up for.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Explore what's playing and find your next obsession.
          </Text>
        </View>

        {/* Row 1: Trending Now */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Now 🔥</Text>
        </View>

        <View style={styles.moviesContainer}>
          {isLoading && movies.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#A78BFA" />
              <Text style={styles.loadingText}>Finding great movies...</Text>
            </View>
          ) : error && movies.length === 0 ? (
            <View style={styles.center}>
              <View style={styles.stateIcon}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={30}
                  color="#F87171"
                />
              </View>

              <Text style={styles.stateTitle}>Couldn't load movies</Text>
              <Text style={styles.message}>{error}</Text>

              <TouchableOpacity
                style={styles.retry}
                onPress={retry}
                activeOpacity={0.85}
              >
                <Ionicons name="refresh" size={17} color="#FFFFFF" />
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={movies}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.cardItemWrapper}>
                  <MovieCard movie={item} width={140} />
                </View>
              )}
              contentContainerStyle={styles.horizontalList}
              onEndReached={fetchMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.footerLoader}>
                    <ActivityIndicator color="#A78BFA" />
                  </View>
                ) : null
              }
            />
          )}
        </View>

        <GenreRow title="Action 💥" genreName="Action" />
        <GenreRow title="Comedy 😂" genreName="Comedy" />
        <GenreRow title="Sci-Fi & Fantasy 🚀" genreName="Science Fiction" />
        <GenreRow title="Drama & Thrillers 🍿" genreName="Drama" />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push("/chat")}
        accessibilityRole="button"
        accessibilityLabel="Open AI chat"
      >
        <FontAwesome5 name="robot" size={27} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  scrollContent: {
    paddingBottom: 90, // Leave room for floating chat button
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 18,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 11,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  brandAccent: {
    color: "#A78BFA",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButton: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 2,
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  heroTitle: {
    color: "#fffcfc",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40,
    letterSpacing: -1.3,
  },
  heroAccent: {
    color: "#A78BFA",
  },
  heroSubtitle: {
    color: "#969BB6",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 290,
  },
  sectionHeader: {
    paddingHorizontal: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  moviesContainer: {
    marginBottom: 24,
  },
  horizontalList: {
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  cardItemWrapper: {
    marginRight: 14,
  },
  center: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  loadingText: {
    color: "#969BB6",
    fontSize: 13,
    marginTop: 14,
  },
  stateIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: "#211A30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  stateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    color: "#969BB6",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  retry: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: "#7C3AED",
    paddingHorizontal: 22,
    height: 44,
    borderRadius: 14,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  footerLoader: {
    width: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 26,
    width: 60,
    height: 60,
    borderRadius: 21,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
