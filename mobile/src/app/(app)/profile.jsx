import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { router } from "expo-router";
import useAuthStore from "../../store/authStore";
import useFavoritesStore from "../../store/favoritesStore";
import useWatchlistStore from "../../store/watchlistStore";
import Avatar from "../../components/Avatar";
import LibraryRow from "../../components/LibraryRow";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const favorites = useFavoritesStore((state) => state.items);
  const watchlist = useWatchlistStore((state) => state.items);

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.userRow}>
        <Avatar name={user?.username} size={72} />
        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>
            {user?.username}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
      </View>

      <LibraryRow
        title="Favorites"
        items={favorites}
        emptyText="No favorites yet. Tap the heart on any movie."
        onShowAll={() => router.push("/favorites")}
      />

      <LibraryRow
        title="Watchlist"
        items={watchlist}
        emptyText="Your watchlist is empty. Tap the bookmark on any movie."
        onShowAll={() => router.push("/watchlist")}
      />

      <TouchableOpacity style={styles.logout} onPress={confirmLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#01053b",
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: "#969BB6",
    fontSize: 14,
    marginTop: 3,
  },
  logout: {
    marginHorizontal: 20,
    marginTop: 10,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F87171",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#F87171",
    fontWeight: "700",
    fontSize: 15,
  },
});