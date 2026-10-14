// src/app/(delivery)/track.tsx
// Shares the delivery person's GPS to the order while this screen is open.

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import LiveMap from "../../components/LiveMap";
import { updateDeliveryLocation } from "../../services/orderService";

export default function Track() {
  const router = useRouter();
  const { id, address, destLat, destLng } = useLocalSearchParams<{
    id: string;
    address: string;
    destLat: string;
    destLng: string;
  }>();

  const dest =
    destLat && destLng ? { lat: Number(destLat), lng: Number(destLng) } : null;
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState("Starting location...");

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let cancelled = false;

    async function start() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setMessage("Location permission denied. Allow it in phone settings.");
        return;
      }
      const s = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 8000,
          distanceInterval: 10,
        },
        async (loc) => {
          const p = { lat: loc.coords.latitude, lng: loc.coords.longitude };
          setPos(p);
          try {
            await updateDeliveryLocation(id, p.lat, p.lng);
            setMessage("Sharing your live location ✔");
          } catch {
            setMessage("Couldn't send location. Check your internet.");
          }
        }
      );
      if (cancelled) s.remove();
      else sub = s;
    }

    start();
    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [id]);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live delivery map</Text>
      </View>

      <LiveMap dest={dest} rider={pos} />

      <View style={styles.bottom}>
        <Text style={styles.address}>📍 {address}</Text>
        {!dest ? (
          <Text style={styles.warn}>
            The customer didn't save a delivery pin for this order.
          </Text>
        ) : null}
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.note}>Location is shared only while this screen is open.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ECFDF5" },
  top: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12 },
  back: { color: "#059669", fontWeight: "700", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#059669" },
  bottom: { padding: 20, backgroundColor: "#FFFFFF" },
  address: { fontSize: 15, fontWeight: "600", color: "#111827" },
  warn: { color: "#B45309", marginTop: 6 },
  message: { color: "#059669", fontWeight: "700", marginTop: 8 },
  note: { color: "#6B7280", fontSize: 12, marginTop: 4 },
});