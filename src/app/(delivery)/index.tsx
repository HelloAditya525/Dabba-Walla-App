// src/app/(delivery)/index.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppButton from "../../components/AppButton";
import { logout } from "../../services/authService";

export default function DeliveryHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🛵</Text>
      <Text style={styles.title}>Delivery Dashboard</Text>
      <Text style={styles.subtitle}>Delivery home (placeholder)</Text>
      <View style={styles.buttonWrap}>
        <AppButton title="Logout" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: "800", color: "#059669", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 6 },
  buttonWrap: { width: "100%", marginTop: 32 },
});