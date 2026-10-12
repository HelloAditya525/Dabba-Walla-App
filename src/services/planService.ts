// src/services/planService.ts
// Reads tiffin plans from Firestore.

import { getFirestore, collection, getDocs } from "@react-native-firebase/firestore";

export type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export async function getPlans(): Promise<Plan[]> {
  const snap = await getDocs(collection(getFirestore(), "plans"));

  const plans = snap.docs.map((d) => {
    const data = d.data() as {
      name?: string;
      price?: number;
      description?: string;
    };
    return {
      id: d.id,
      name: data.name ?? "Unnamed plan",
      price: Number(data.price ?? 0),
      description: data.description ?? "",
    };
  });

  // Cheapest first
  return plans.sort((a, b) => a.price - b.price);
}