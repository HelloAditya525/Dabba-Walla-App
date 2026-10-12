// src/app/(auth)/otp.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { sendOtp, verifyOtp } from "../../services/authService";
import { validateOtp } from "../../utils/validation";
import { getFriendlyError } from "../../utils/errorMessages";

export default function OtpScreen() {
  const router = useRouter();
  const { name, phone } = useLocalSearchParams<{ name: string; phone: string }>();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    const err = validateOtp(code);
    setCodeError(err);
    setFormError(null);
    if (err) return;

    setLoading(true);
    try {
      await verifyOtp(code);
      router.replace({
        pathname: "/create-password",
        params: { name, phone },
      } as any);
    } catch (e) {
      setFormError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setFormError(null);
    try {
      await sendOtp(phone);
      setFormError("A new OTP has been sent.");
    } catch (e) {
      setFormError(getFriendlyError(e));
    }
  }

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to +91 {phone}</Text>
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <AppInput
        label="OTP"
        placeholder="6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
        error={codeError}
      />

      <AppButton title="Verify OTP" onPress={handleVerify} loading={loading} />

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.link}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 26, fontWeight: "800", color: "#F97316" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 6, textAlign: "center" },
  formError: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    textAlign: "center",
  },
  footer: { alignItems: "center", marginTop: 24 },
  link: { color: "#F97316", fontWeight: "700" },
});