import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#01053b" },
        headerTintColor: "#ffffff",
        headerShadowVisible: false,
        title: "",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
      <Stack.Screen name="favorites" options={{ title: "Favorites" }} />
      <Stack.Screen name="watchlist" options={{ title: "Watchlist" }} />
      <Stack.Screen name="chat" options={{ title: "AI Assistant" }} />
    </Stack>
  );
}