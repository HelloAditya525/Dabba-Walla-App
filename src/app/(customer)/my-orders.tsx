// src/app/(customer)/my-orders.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { subscribeToMyOrders, Order } from "../../services/orderService";
import { getFriendlyError } from "../../utils/errorMessages";

const STEPS = ["pending", "picked_up", "delivered"];
const LABELS: Record<string, string> = {
  pending: "Order placed",
  picked_up: "On the way",
  delivered: "Delivered",
};

function StatusBar({ status }: { status: string }) {
  const current = STEPS.indexOf(status);
  return (
    <View style={styles.steps}>
      {STEPS.map((s, i) => (
        <View key={s} style={styles.step}>
          <View style={[styles.dot, i <= current ? styles.dotOn : null]} />
          <Text style={[styles.stepText, i <= current ? styles.stepTextOn : null]}>
            {LABELS[s]}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function MyOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMyOrders(
      (list) => {
        setOrders(list);
        setLoading(false);
      },
      (e) => {
        setError(getFriendlyError(e));
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(o) => o.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Orders</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.planName}>{item.planName}</Text>
            <Text style={styles.price}>₹{item.price}</Text>
          </View>
          <Text style={styles.address}>📍 {item.address}</Text>

          <StatusBar status={item.status} />

        {item.status !== "delivered" ? (
            <TouchableOpacity
              style={{ marginTop: 14 }}
              onPress={() =>
                router.push({ pathname: "/track-order", params: { id: item.id } } as any)
              }
            >
              <Text style={{ color: "#F97316", fontWeight: "700" }}>
                🗺️ Track on map →
              </Text>
            </TouchableOpacity>
          ) : null}

          {item.deliveryName && item.status !== "pending" ? (
            <View style={styles.deliveryBox}>
              <Text style={styles.deliveryTitle}>🛵 Your delivery partner</Text>
              <Text style={styles.deliveryName}>{item.deliveryName}</Text>
              {item.deliveryPhone ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${item.deliveryPhone}`)}
                >
                  <Text style={styles.call}>📞 {item.deliveryPhone} (tap to call)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
      ListEmptyComponent={
        error ? null : <Text style={styles.empty}>You haven't placed any orders yet.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF7ED" },
  list: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 16 },
  back: { color: "#F97316", fontWeight: "700", marginBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", color: "#F97316" },
  error: {
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  planName: { fontSize: 17, fontWeight: "700", color: "#111827", flex: 1 },
  price: { fontSize: 17, fontWeight: "800", color: "#F97316" },
  address: { fontSize: 14, color: "#6B7280", marginTop: 6 },
  steps: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  step: { alignItems: "center", flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#D1D5DB" },
  dotOn: { backgroundColor: "#F97316" },
  stepText: { fontSize: 12, color: "#9CA3AF", marginTop: 4, textAlign: "center" },
  stepTextOn: { color: "#111827", fontWeight: "700" },
  deliveryBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },
  deliveryTitle: { fontSize: 12, color: "#059669", fontWeight: "700" },
  deliveryName: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 4 },
  call: { fontSize: 15, color: "#059669", fontWeight: "700", marginTop: 6 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 24 },
});