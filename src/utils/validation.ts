// src/utils/validation.ts
// Each function returns an error message, or null if the value is fine.

export function validateName(name: string): string | null {
  if (name.trim().length === 0) return "Please enter your full name.";
  if (name.trim().length < 2) return "Name is too short.";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (phone.trim().length === 0) return "Please enter your mobile number.";
  // Indian mobile numbers: 10 digits, starting with 6, 7, 8 or 9
  if (!/^[6-9]\d{9}$/.test(phone.trim())) {
    return "Enter a valid 10-digit mobile number.";
  }
  return null;
}

export function validateOtp(code: string): string | null {
  if (code.trim().length === 0) return "Please enter the OTP.";
  if (!/^\d{6}$/.test(code.trim())) return "The OTP must be 6 digits.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length === 0) return "Please enter a password.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | null {
  if (confirm.length === 0) return "Please confirm your password.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

// Firebase needs the phone number in international format.
export function toE164(phone: string): string {
  return `+91${phone.trim()}`;
}

// Firebase can't give a phone-only user a password, so we link a hidden
// email built from the phone number. The user never sees this email.
export function phoneToEmail(phone: string): string {
  return `${phone.trim()}@dabbawalla.app`;
}