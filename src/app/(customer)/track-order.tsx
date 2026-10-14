// src/app/(customer)/track-order.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LiveMap from "../../components/LiveMap";
import { subscribeToOrder, Order } from "../../services/orderService";
import { getFriendlyError } from "../../utils/errorMessages";

const LABELS: Record<string, string> = {
  pending: "Order placed",
  picked_up: "On the way",
  delivered: "Delivered",
};

export default function TrackOrder() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeToOrder(
      id,
      (o) => setOrder(o),
      (e) => setError(getFriendlyError(e))
    );
  }, [id]);

  const dest =
    order?.destLat != null && order?.destLng != null
      ? { lat: order.destLat, lng: order.destLng }
      : null;
  const rider =
    order?.deliveryLat != null && order?.deliveryLng != null
      ? { lat: order.deliveryLat, lng: order.deliveryLng }
      : null;

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Track your order</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <LiveMap dest={dest} rider={rider} />

      <View style={styles.bottom}>
        <Text style={styles.status}>
          {order ? LABELS[order.status] ?? order.status : "Loading..."}
        </Text>
        {order ? <Text style={styles.plan}>{order.planName}</Text> : null}

        {order?.deliveryName && order.status !== "pending" ? (
          <View style={styles.rider}>
            <Text style={styles.riderName}>🛵 {order.deliveryName}</Text>
            {order.deliveryPhone ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${order.deliveryPhone}`)}
              >
                <Text style={styles.call}>📞 {order.deliveryPhone} (tap to call)</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {order && order.status === "picked_up" && !rider ? (
          <Text style={styles.note}>
            Waiting for the delivery partner to start sharing location...
          </Text>
        ) : null}
        {order && !dest ? (
          <Text style={styles.note}>No delivery pin was saved for this order.</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  top: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12 },
  back: { color: "#F97316", fontWeight: "700", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#F97316" },
  error: { color: "#B91C1C", marginTop: 8 },
  bottom: { padding: 20, backgroundColor: "#FFFFFF" },
  status: { fontSize: 20, fontWeight: "800", color: "#111827" },
  plan: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  rider: { backgroundColor: "#ECFDF5", borderRadius: 10, padding: 12, marginTop: 12 },
  riderName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  call: { fontSize: 15, color: "#059669", fontWeight: "700", marginTop: 6 },
  note: { color: "#6B7280", marginTop: 10 },
});