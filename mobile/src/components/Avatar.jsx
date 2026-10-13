import { View, Text, StyleSheet } from "react-native";

export default function Avatar({ name, size = 40 }) {
  const letter = name ? name.trim().charAt(0).toUpperCase() : "?";

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.45 }]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: "#A60F14",
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: "#ffffff",
    fontWeight: "700",
  },
});