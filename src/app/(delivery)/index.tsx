// src/app/(delivery)/index.tsx
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AppButton from "../../components/AppButton";
import { logout } from "../../services/authService";
import {
  getActiveOrders,
  updateOrderStatus,
  Order,
} from "../../services/orderService";
import { getFriendlyError } from "../../utils/errorMessages";

export default function DeliveryHome() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOrders(await getActiveOrders());
    } catch (e) {
      setError(getFriendlyError(e));
    }
  }, []);

  useEffect(() => {
    load().then(() => setLoading(false));
  }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function advance(order: Order) {
    setBusyId(order.id);
    setError(null);
    try {
      await updateOrderStatus(
        order.id,
        order.status === "pending" ? "picked_up" : "delivered"
      );
      await load();
    } catch (e) {
      setError(getFriendlyError(e));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(o) => o.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>🛵 Delivery Dashboard</Text>
          <Text style={styles.subtitle}>Active orders (pull down to refresh)</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.planName}>{item.planName}</Text>
            <Text style={styles.status}>
              {item.status === "pending" ? "Pending" : "Picked up"}
            </Text>
          </View>
          <Text style={styles.address}>📍 {item.address}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
          <AppButton
            title={item.status === "pending" ? "Mark as picked up" : "Mark as delivered"}
            onPress={() => advance(item)}
            loading={busyId === item.id}
          />
                    {item.status === "picked_up" ? (
            <AppButton
              title="🗺️ Open live map"
              onPress={() =>
                router.push({
                  pathname: "/track",
                  params: {
                    id: item.id,
                    address: item.address,
                    destLat: String(item.destLat ?? ""),
                    destLng: String(item.destLng ?? ""),
                  },
                } as any)
              }
            />
          ) : null}
        </View>
      )}
      ListEmptyComponent={
        error ? null : <Text style={styles.empty}>No active orders.</Text>
      }
      ListFooterComponent={
        <View style={styles.footer}>
          <AppButton title="Logout" onPress={logout} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#ECFDF5" },
  list: { flex: 1, backgroundColor: "#ECFDF5" },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: "#059669" },
  subtitle: { fontSize: 14, color: "#6B7280", marginTop: 4 },
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
    borderColor: "#A7F3D0",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  planName: { fontSize: 17, fontWeight: "700", color: "#111827", flex: 1 },
  status: { fontSize: 13, fontWeight: "700", color: "#059669" },
  address: { fontSize: 14, color: "#374151", marginTop: 8 },
  price: { fontSize: 15, fontWeight: "800", color: "#059669", marginTop: 4 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 24 },
  footer: { marginTop: 16 },
});