import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import useAuthStore from "../../store/authStore";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, showsetPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError("All fields are required. ");
      return;
    }
    if (username.trim().length < 3) {
      setLocalError("Username must be at least 3 characters. ");
      return;
    }
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setLocalError("Please enter a valid email address. ");
      return;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters. ");
      return;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match. ");
      return;
    }
    setLocalError("");
    await register({
      username: username.trim(),
      email: email.trim(),
      password,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "android" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.text}>
          <Text style={styles.redText}>Create </Text>
          an Account
        </Text>

        <Text style={styles.text2}>Enter your details to get started</Text>
      </View>

      {(localError || error) ? (
        <Text style={styles.errorText}>{localError || error}</Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Choose a username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={password}
          placeholder="Enter your password"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          secureTextEntry={!showpassword}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.showpass}
          onPress={() => showsetPassword(!showpassword)}
        >
          <Text style={styles.showText}>{showpassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          placeholder="Confirm your password"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="password"
          secureTextEntry={!showConfirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={styles.showpass}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Text style={styles.showText}>
            {showConfirmPassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && { opacity: 0.6 }]}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up ➤</Text>
        )}
      </TouchableOpacity>

      <View>
        <Text style={styles.text2}>
          Already have an account?
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.redText}> Log in</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#01053b",
    paddingHorizontal: 25,
  },

  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 35,
  },

  text: {
    fontWeight: "800",
    fontSize: 25,
    color: "#ffffff",
    marginBottom: 8,
  },

  redText: {
    color: "#A60F14",
    fontWeight: "700",
  },

  text2: {
    color: "#ffffff",
    fontSize: 14,
  },

  errorText: {
    borderWidth: 0.5,
    borderColor: "#ff4040bd",
    borderRadius: 15,
    padding:10,
    color: "#ff0000",
    fontSize: 16,
    margin: 10,
    textAlign: "center",
  },

  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    fontSize: 15,
    color: "#333333",
  },

  passwordContainer: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 10,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 15,
  },

  showpass: {
    width: 65,
    backgroundColor: "#c8c8c9",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  showText: {
    color: "#030303",
    fontSize: 14,
    fontWeight: "600",
  },

  button: {
    width: "30%",
    height: 52,
    backgroundColor: "#A60F14",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
  },

  buttonText: {
    fontWeight: "600",
    fontSize: 18,
    color: "#ffffff",
  },
});