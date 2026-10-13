// src/utils/errorMessages.ts
// Turns technical Firebase errors into messages a normal user understands.

export function getFriendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";

  switch (code) {
    case "auth/invalid-phone-number":
      return "That mobile number doesn't look right.";
    case "auth/invalid-verification-code":
      return "Incorrect OTP. Please try again.";
    case "auth/code-expired":
    case "auth/session-expired":
      return "This OTP has expired. Please request a new one.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a while and try again.";
    case "auth/quota-exceeded":
      return "OTP limit reached. Please try again later.";
    case "auth/email-already-in-use":
    case "auth/credential-already-in-use":
    case "auth/provider-already-linked":
      return "An account with this mobile number already exists. Please log in.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "Incorrect mobile number or password.";
    case "auth/weak-password":
      return "Password is too weak. Use at least 6 characters.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/network-request-failed":
      return "No internet connection. Please check your network.";
    case "firestore/permission-denied":
      return "You don't have permission to do that. Please try again.";

    default:
      console.log("AUTH ERROR:", code, error);
      return "Something went wrong. Please try again.";
    /*default: {
      const msg = (error as { message?: string })?.message ?? "";
      console.log("AUTH ERROR:", code, msg);
      return `Something went wrong. (${code || "no code"}) ${msg}`;
    }*/
  }
}