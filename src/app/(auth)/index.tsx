// src/app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { login } from "../../services/authService";
import { validatePhone } from "../../utils/validation";
import { getFriendlyError } from "../../utils/errorMessages";

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const pErr = validatePhone(phone);
    const pwErr = password.length === 0 ? "Please enter your password." : null;
    setPhoneError(pErr);
    setPasswordError(pwErr);
    setFormError(null);
    if (pErr || pwErr) return;

    setLoading(true);
    try {
      await login(phone, password);
      // No navigation here: the root layout (Step 15) moves you to Home
      // automatically as soon as Firebase says you are logged in.
    } catch (e) {
      setFormError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoArea}>
          <Text style={styles.logoEmoji}>🍱</Text>
          <Text style={styles.appName}>Dabba Walla</Text>
          <Text style={styles.tagline}>Fresh tiffin, on time</Text>
        </View>

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <AppInput
          label="Mobile number"
          placeholder="10-digit mobile number"
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
          error={phoneError}
        />
        <AppInput
          label="Password"
          placeholder="Enter your password"
          isPassword
          value={password}
          onChangeText={setPassword}
          error={passwordError}
        />

        <AppButton title="Login" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup" as any)}>
            <Text style={styles.link}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoEmoji: { fontSize: 56 },
  appName: { fontSize: 30, fontWeight: "800", color: "#F97316", marginTop: 8 },
  tagline: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  formError: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    textAlign: "center",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: "#6B7280" },
  link: { color: "#F97316", fontWeight: "700" },
});