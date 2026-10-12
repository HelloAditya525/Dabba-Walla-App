// src/app/(auth)/create-password.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { createAccount } from "../../services/authService";
import {
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validation";
import { getFriendlyError } from "../../utils/errorMessages";

export default function CreatePasswordScreen() {
  const { name, phone } = useLocalSearchParams<{ name: string; phone: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    const pErr = validatePassword(password);
    const cErr = validateConfirmPassword(password, confirm);
    setPasswordError(pErr);
    setConfirmError(cErr);
    setFormError(null);
    if (pErr || cErr) return;

    setLoading(true);
    try {
      await createAccount(name, phone, password);
      // No navigation here: the root layout (Step 15) moves you to Home.
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
      <View style={styles.header}>
        <Text style={styles.title}>Create a password</Text>
        <Text style={styles.subtitle}>
          Number verified. Choose a password to finish signing up.
        </Text>
      </View>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <AppInput
        label="Password"
        placeholder="At least 6 characters"
        isPassword
        value={password}
        onChangeText={setPassword}
        error={passwordError}
      />
      <AppInput
        label="Confirm password"
        placeholder="Re-enter your password"
        isPassword
        value={confirm}
        onChangeText={setConfirm}
        error={confirmError}
      />

      <AppButton title="Create Account" onPress={handleCreate} loading={loading} />
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
});