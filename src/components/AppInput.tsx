// src/components/AppInput.tsx
// A text box with a label, an error message, and an optional show/hide toggle.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string | null;
  isPassword?: boolean;
};

export default function AppInput({ label, error, isPassword, ...rest }: Props) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error ? styles.boxError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isPassword ? hidden : false}
          autoCapitalize="none"
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Text style={styles.toggle}>{hidden ? "Show" : "Hide"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },
  boxError: { borderColor: "#DC2626" },
  input: { flex: 1, paddingVertical: 14, fontSize: 16, color: "#111827" },
  toggle: { color: "#F97316", fontWeight: "600", marginLeft: 8 },
  error: { color: "#DC2626", fontSize: 13, marginTop: 4 },
});