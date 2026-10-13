// src/services/orderService.ts
import { getAuth } from "@react-native-firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "@react-native-firebase/firestore";
import type { Plan } from "./planService";

export async function placeOrder(plan: Plan, address: string): Promise<void> {
  const user = getAuth().currentUser;
  if (!user) throw { code: "auth/session-expired" };

  await addDoc(collection(getFirestore(), "orders"), {
    customerId: user.uid,
    planId: plan.id,
    planName: plan.name,
    price: plan.price,
    address: address.trim(),
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export type Order = {
  id: string;
  planName: string;
  price: number;
  address: string;
  status: string;
};

// Delivery person: all orders that are not delivered yet.
export async function getActiveOrders(): Promise<Order[]> {
  const snap = await getDocs(collection(getFirestore(), "orders"));
  return snap.docs
    .map((d) => {
      const data = d.data() as Partial<Order>;
      return {
        id: d.id,
        planName: data.planName ?? "",
        price: Number(data.price ?? 0),
        address: data.address ?? "",
        status: data.status ?? "pending",
      };
    })
    .filter((o) => o.status !== "delivered");
}

export async function updateOrderStatus(
  orderId: string,
  status: "picked_up" | "delivered"
): Promise<void> {
  await updateDoc(doc(getFirestore(), "orders", orderId), { status });
}