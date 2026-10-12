// src/app/(auth)/signup.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { sendOtp } from "../../services/authService";
import { validateName, validatePhone } from "../../utils/validation";
import { getFriendlyError } from "../../utils/errorMessages";

export default function SignUpScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    const nErr = validateName(name);
    const pErr = validatePhone(phone);
    setNameError(nErr);
    setPhoneError(pErr);
    setFormError(null);
    if (nErr || pErr) return;

    setLoading(true);
    try {
      await sendOtp(phone);
      // Pass name and phone along to the next screens.
      router.push({
        pathname: "/otp",
        params: { name: name.trim(), phone: phone.trim() },
      } as any);
    } catch (e) {
      setFormError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoArea}>
        <Text style={styles.logoEmoji}>🍱</Text>
        <Text style={styles.appName}>Create account</Text>
        <Text style={styles.tagline}>We'll send an OTP to verify your number</Text>
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <AppInput
        label="Full name"
        placeholder="Your full name"
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
        error={nameError}
      />
      <AppInput
        label="Mobile number"
        placeholder="10-digit mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
        error={phoneError}
      />

      <AppButton title="Send OTP" onPress={handleSendOtp} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/" as any)}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoEmoji: { fontSize: 56 },
  appName: { fontSize: 28, fontWeight: "800", color: "#F97316", marginTop: 8 },
  tagline: { fontSize: 14, color: "#6B7280", marginTop: 4, textAlign: "center" },
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