// src/services/orderService.ts
import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import type { Plan } from "./planService";

export async function placeOrder(
  plan: Plan,
  address: string,
  coords?: { lat: number; lng: number } | null
): Promise<void> {
  const user = getAuth().currentUser;
  if (!user) throw { code: "auth/session-expired" };

  const data: Record<string, unknown> = {
    customerId: user.uid,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    address: address.trim(),
    status: "pending",
    createdAt: serverTimestamp(),
  };
  if (coords) {
    data.destLat = coords.lat;
    data.destLng = coords.lng;
  }

  await addDoc(collection(getFirestore(), "orders"), data);
}

export type Order = {
  id: string;
  planName: string;
  price: number;
  address: string;
  status: string;
  deliveryName?: string;
  deliveryPhone?: string;
  destLat?: number;
  destLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  createdAt?: number;
};

function toOrder(id: string, data: Record<string, any>): Order {
  return {
    id,
    planName: data.planName ?? "",
    price: Number(data.price ?? 0),
    address: data.address ?? "",
    status: data.status ?? "pending",
    deliveryName: data.deliveryName,
    deliveryPhone: data.deliveryPhone,
    destLat: data.destLat,
    destLng: data.destLng,
    deliveryLat: data.deliveryLat,
    deliveryLng: data.deliveryLng,
    createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
  };
}

export async function getActiveOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(getFirestore(), "orders"));
  return snap.docs
    .map((d) => toOrder(d.id, d.data() as Record<string, any>))
    .filter((o) => o.status !== "delivered");
}

export function subscribeToMyOrders(
  onChange: (orders: Order[]) => void,
  onError: (e: unknown) => void
) {
  const user = getAuth().currentUser;
  if (!user) {
    onError({ code: "auth/session-expired" });
    return () => {};
  }
  const q = query(
    collection(getFirestore(), "orders"),
    where("customerId", "==", user.uid)
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) =>
        toOrder(d.id, d.data() as Record<string, any>)
      );
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      onChange(list);
    },
    onError
  );
}

// Customer: live updates of ONE order (status + rider position).
export function subscribeToOrder(
  orderId: string,
  onChange: (order: Order | null) => void,
  onError: (e: unknown) => void
) {
  return onSnapshot(
    doc(getFirestore(), "orders", orderId),
    (snap) => {
      const data = snap.data();
      onChange(data ? toOrder(snap.id, data as Record<string, any>) : null);
    },
    onError
  );
}

// Delivery person: save my current position on the order.
export async function updateDeliveryLocation(
  orderId: string,
  lat: number,
  lng: number
): Promise<void> {
  await updateDoc(doc(getFirestore(), "orders", orderId), {
    deliveryLat: lat,
    deliveryLng: lng,
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: "picked_up" | "delivered"
): Promise<void> {
  const user = getAuth().currentUser;
  if (!user) throw { code: "auth/session-expired" };

  const data: Record<string, string> = { status };

  // On pickup, attach the delivery person's details to the order.
  if (status === "picked_up") {
    const snap = await getDoc(doc(getFirestore(), "users", user.uid));
    const profile = snap.data() as { name?: string; phone?: string } | undefined;
    data.deliveryId = user.uid;
    data.deliveryName = profile?.name ?? "Delivery partner";
    data.deliveryPhone = profile?.phone ?? "";
  }

  await updateDoc(doc(getFirestore(), "orders", orderId), data);
}