// src/app/(customer)/index.tsx
import React, { useCallback, useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import AppButton from "../../components/AppButton";
import { logout } from "../../services/authService";
import { getPlans, Plan } from "../../services/planService";
import { getFriendlyError } from "../../utils/errorMessages";

export default function CustomerHome() {
  const [name, setName] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const loadPlans = useCallback(async () => {
    setError(null);
    try {
      setPlans(await getPlans());
    } catch (e) {
      setError(getFriendlyError(e));
    }
  }, []);

  useEffect(() => {
    async function init() {
      const user = getAuth().currentUser;
      if (user) {
        try {
          const snap = await getDoc(doc(getFirestore(), "users", user.uid));
          const data = snap.data() as { name?: string } | undefined;
          setName(data?.name ?? "");
        } catch {
          setName("");
        }
      }
      await loadPlans();
      setLoading(false);
    }
    init();
  }, [loadPlans]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  }

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
      data={plans}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello{name ? `, ${name}` : ""} 👋
          </Text>
          <Text style={styles.sectionTitle}>Our tiffin plans</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
            renderItem={({ item }) => (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/plan-detail",
              params: {
                id: item.id,
                name: item.name,
                price: String(item.price),
                description: item.description,
              },
            } as any)
          }
        >
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        error ? null : <Text style={styles.empty}>No plans available yet.</Text>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
  },
  list: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { padding: 20, paddingTop: 56 },
  header: { marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: "800", color: "#F97316" },
  sectionTitle: { fontSize: 16, color: "#6B7280", marginTop: 4 },
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
  description: { fontSize: 14, color: "#6B7280", marginTop: 6 },
  empty: { textAlign: "center", color: "#6B7280", marginTop: 24 },
  footer: { marginTop: 16 },
});