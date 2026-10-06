import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function MovieDetail() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Movie Detail Screen (id: {id})</Text>
    </View>
  );
}