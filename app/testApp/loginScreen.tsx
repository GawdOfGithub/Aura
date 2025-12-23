import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { login } from "../store/features/users/userSlice";
import { useAppDispatch } from "../store/hooks";
import { OTPRequestCreateURL } from "./urlList";

// --- API CONFIGURATION ---

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  // --- HANDLE LOGIN (DIRECT) ---
  const handleLogin = async () => {
    // 1. Basic Validation
    if (phoneNumber.length !== 10) {
      Alert.alert("Invalid Number", "Please enter a 10-digit number.");
      return;
    }

    setLoading(true);
    try {
      const url = OTPRequestCreateURL();

      // 2. Call API
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_no: phoneNumber }),
      });

      const data = await response.json();

      // 3. Check for User and Token in response
      if (response.ok && data.user && data.token) {
        // SUCCESS: User exists
        Alert.alert("Success", `Welcome ${data.user.name || "User"} to Buzz`, [
          {
            text: "OK",
            onPress: () =>
              dispatch(login({ token: data.token, userData: data.user })), // Navigate to Home
          },
        ]);
      } else {
        // FAILURE: User does not exist or API error
        Alert.alert("Login Failed", "User does not exist or invalid response.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Network request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}>
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>Buzz</Text>
          <Text style={styles.subHeader}>Welcome Back!</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            placeholder='9876543210'
            placeholderTextColor='#aaa'
            keyboardType='number-pad'
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  keyboardView: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  headerContainer: { marginBottom: 40, alignItems: "center" },
  appName: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
    letterSpacing: 2,
  },
  subHeader: { fontSize: 18, color: "#555", fontWeight: "500" },
  formContainer: { width: "100%" },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    width: "100%",
    height: 55,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
    color: "#333",
  },
  button: {
    width: "100%",
    height: 55,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: { backgroundColor: "#555" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
