import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export function AdminLoginCorner() {
  const { role, login, logout } = useAuth();
  const colors = useColors();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const success = await login(password, true);
    if (success) {
      setPassword("");
      setError("");
      setShowModal(false);
    } else {
      setError("Invalid password");
    }
  };

  if (role === "admin") {
    return (
      <View style={styles.adminContainer}>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={[styles.adminButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.adminText, { color: colors.background }]}>👤 ADMIN</Text>
        </TouchableOpacity>

        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Admin Panel</Text>

              <TouchableOpacity
                onPress={() => {
                  logout();
                  setShowModal(false);
                }}
                style={[styles.logoutButton, { borderColor: colors.error }]}
              >
                <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={[styles.closeButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.closeText, { color: colors.background }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.loginContainer}>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={[styles.loginButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.loginText, { color: colors.background }]}>🔐 LOGIN</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Admin Login</Text>

            <TextInput
              style={[
                styles.passwordInput,
                {
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Enter admin password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
            />

            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.submitText, { color: colors.background }]}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setPassword("");
                setError("");
              }}
              style={[styles.cancelButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.foreground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  adminContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  loginButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  adminButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  loginText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  adminText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    maxWidth: 300,
    borderRadius: 12,
    padding: 20,
    gap: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
  },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
});
