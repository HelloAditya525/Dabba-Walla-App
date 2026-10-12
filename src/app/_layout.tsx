// src/app/_layout.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import {
  getUserRole,
  isFullyRegistered,
  subscribeToAuth,
} from "../services/authService";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      if (user && isFullyRegistered(user)) {
        try {
          setRole(await getUserRole(user.uid));
        } catch {
          setRole("customer"); // safe default if the lookup fails
        }
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  const isDelivery = loggedIn && role === "delivery";
  const isCustomer = loggedIn && role !== "delivery";

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isCustomer}>
        <Stack.Screen name="(customer)" />
      </Stack.Protected>
      <Stack.Protected guard={isDelivery}>
        <Stack.Screen name="(delivery)" />
      </Stack.Protected>
      <Stack.Protected guard={!loggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}