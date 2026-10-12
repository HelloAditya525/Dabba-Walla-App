// src/services/authService.ts
// All Firebase Authentication + Firestore code lives in this one file.

import {
  getAuth,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  linkWithCredential,
} from "@react-native-firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { phoneToEmail, toE164 } from "../utils/validation";

type AuthUser = ReturnType<typeof getAuth>["currentUser"];
type Confirmation = Awaited<ReturnType<typeof signInWithPhoneNumber>>;
// Holds the OTP "session" between the Sign Up screen and the OTP screen.
let pendingConfirmation: Confirmation | null = null;

// A user is only "fully registered" once the password (hidden email) is linked.
// Right after OTP they are signed in with the phone only, so this is false.
export function isFullyRegistered(user: AuthUser): boolean {
  return !!user && !!user.email;
}

// Step 1: Firebase sends an OTP SMS to this phone number.
export async function sendOtp(phone: string): Promise<void> {
  pendingConfirmation = await signInWithPhoneNumber(getAuth(), toE164(phone));
}

// Step 2: check the OTP the user typed.
export async function verifyOtp(code: string): Promise<void> {
  if (!pendingConfirmation) {
    throw { code: "auth/session-expired" };
  }
  await pendingConfirmation.confirm(code.trim());

  // If this phone already has a password, the account already exists.
  const user = getAuth().currentUser;
  if (user && user.email) {
    await signOut(getAuth());
    throw { code: "auth/email-already-in-use" };
  }
  pendingConfirmation = null;
}

// Step 3: save the profile, then attach the password to the same account.
export async function createAccount(
  name: string,
  phone: string,
  password: string
): Promise<void> {
  const user = getAuth().currentUser;
  if (!user) {
    throw { code: "auth/session-expired" };
  }

  // Profile first, so a retry after a failure is safe. NO password stored here.
  await setDoc(doc(getFirestore(), "users", user.uid), {
    name: name.trim(),
    phone: toE164(phone),
    role: "customer",
    createdAt: serverTimestamp(),
  });

  // Firebase stores and protects the password.
  const credential = EmailAuthProvider.credential(phoneToEmail(phone), password);
  await linkWithCredential(user, credential);
}

export async function login(phone: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getAuth(), phoneToEmail(phone), password);
}

export async function logout(): Promise<void> {
  await signOut(getAuth());
}

// The root layout uses this to know if someone is logged in.
export function subscribeToAuth(callback: (user: AuthUser) => void) {
  return onAuthStateChanged(getAuth(), callback);
}

// Reads the user's role ("customer" or "delivery") from Firestore.
export async function getUserRole(uid: string): Promise<string> {
  const snap = await getDoc(doc(getFirestore(), "users", uid));
  const data = snap.data() as { role?: string } | undefined;
  return data?.role ?? "customer";
}