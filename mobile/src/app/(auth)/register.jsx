import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState } from "react";
import { router } from 'expo-router';

export default function Login() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, showsetPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <KeyboardAvoidingView 
         behavior={Platform.OS === 'android' ? 'padding' : 'height'}
     style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.text}>
          <Text style={styles.redText}>Create </Text>
          an Account
        </Text>

        <Text style={styles.text2}>
          Enter your details to get started </Text>
      </View>

            <TextInput
              style={styles.input}
              placeholder="Enter your fullName"
              placeholderTextColor="#aaa"
              value={fullName}
              onChangeText={setFullName}
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
          <Text style={styles.showText}>
            {showpassword ? "Hide" : "Show"}
          </Text>
        </TouchableOpacity>
      </View>
 
        
            <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={confirmPassword}
          placeholder="confirm your password"
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

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up ➤</Text>
      </TouchableOpacity>

      <View >
        <Text style={styles.text2}>Don't have an account?
          <TouchableOpacity onPress={()=> router.push("/(auth)/login")}>
          <Text style={styles.redText}>  Log in</Text></TouchableOpacity></Text>
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
    borderRadius:20,
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