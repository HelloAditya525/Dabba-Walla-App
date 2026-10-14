// src/app/(customer)/plan-detail.tsx
import * as Location from "expo-location";
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { placeOrder } from "../../services/orderService";
import { getFriendlyError } from "../../utils/errorMessages";

export default function PlanDetail() {
  const router = useRouter();
  const { id, name, price, description } = useLocalSearchParams<{
    id: string;
    name: string;
    price: string;
    description: string;
  }>();

  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locMsg, setLocMsg] = useState<string | null>(null);

  async function handleOrder() {
    if (address.trim().length < 10) {
      setAddressError("Please enter your full delivery address.");
      return;
    }
    setAddressError(null);
    setFormError(null);
    setLoading(true);
    try {
      await placeOrder(
        { id, name, price: Number(price), description },
        address,
        coords
      );
      setDone(true);
    } catch (e) {
      setFormError(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

    async function handleUseLocation() {
    setLocMsg("Getting your location...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocMsg("Location permission denied.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      setLocMsg("Delivery pin saved ✔");
    } catch {
      setLocMsg("Couldn't get location. Turn on GPS and try again.");
    }
  }

  if (done) {
    return (
      <View style={styles.doneContainer}>
        <Text style={styles.doneEmoji}>✅</Text>
        <Text style={styles.title}>Order placed!</Text>
        <Text style={styles.description}>
          {name} will be delivered to your address.
        </Text>
        <View style={styles.full}>
          <AppButton title="Back to plans" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{name}</Text>
      <Text style={styles.price}>₹{price}</Text>
      <Text style={styles.description}>{description}</Text>

      {formError ? <Text style={styles.formError}>{formError}</Text> : null}

      <View style={styles.form}>
        <AppInput
          label="Delivery address"
          placeholder="House no, building, area, landmark"
          multiline
          value={address}
          onChangeText={setAddress}
          error={addressError}
        />
                <TouchableOpacity onPress={handleUseLocation} style={{ marginBottom: 16 }}>
          <Text style={{ color: "#F97316", fontWeight: "700" }}>
            📍 Use my current location as the delivery pin
          </Text>
          {locMsg ? (
            <Text style={{ color: "#6B7280", marginTop: 4 }}>{locMsg}</Text>
          ) : null}
        </TouchableOpacity>
        <AppButton title="Place Order" onPress={handleOrder} loading={loading} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#FFF7ED" },
  container: { padding: 24, paddingTop: 56 },
  back: { color: "#F97316", fontWeight: "700", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827" },
  price: { fontSize: 22, fontWeight: "800", color: "#F97316", marginTop: 4 },
  description: { fontSize: 15, color: "#6B7280", marginTop: 8 },
  form: { marginTop: 28 },
  formError: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    textAlign: "center",
  },
  doneContainer: {
    flex: 1,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  doneEmoji: { fontSize: 64 },
  full: { width: "100%", marginTop: 28 },
});