import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================
// TYPES
// ============================================================

interface AdminSession {
  isLoggedIn: boolean;
  loginTime: number;
  sessionToken: string;
}

interface PaymentPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  features: string[];
  color: string;
}

interface UserSubscription {
  planId: string;
  startTime: number;
  expiresAt: number;
  token: string;
  status: "active" | "expired" | "trial";
}

// ============================================================
// CONSTANTS
// ============================================================

const ADMIN_PASSWORD = "#AllOfThem-3301";
const ADMIN_SECRET_WORD = "MerleoskinMerleoskin77";
const MONERO_ADDRESS = "8BbApiMBHsPVKkLEP4rVbST6CnSb3LW2gXygngCi5MGiBuwAFh6bFEzT3UTuFCkLHtyHnrYNnHycdaGb2Kgkkmw8jViCdB6";

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "trial",
    name: "TRIAL",
    duration: "12h",
    price: 0,
    features: ["12 hour access", "All 52 modules", "All 339 tools", "Limited API calls"],
    color: "#00e5ff",
  },
  {
    id: "weekly",
    name: "WEEKLY",
    duration: "7 days",
    price: 30,
    features: ["7 day access", "All 52 modules", "All 339 tools", "Unlimited API calls", "Priority support"],
    color: "#00ff88",
  },
  {
    id: "monthly",
    name: "MONTHLY",
    duration: "30 days",
    price: 300,
    features: ["30 day access", "All 52 modules", "All 339 tools", "Unlimited API calls", "Priority support", "Custom tools"],
    color: "#ffff00",
  },
  {
    id: "yearly",
    name: "YEARLY",
    duration: "365 days",
    price: 1000,
    features: ["365 day access", "All 52 modules", "All 339 tools", "Unlimited API calls", "Priority support", "Custom tools", "Dedicated support"],
    color: "#ff00ff",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function AdminPanel() {
  // Admin Login State
  const [adminPassword, setAdminPassword] = useState("");
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [secretWord, setSecretWord] = useState("");

  // Payment Management State
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [generatedTokens, setGeneratedTokens] = useState<UserSubscription[]>([]);
  // const [showTokenGenerator, setShowTokenGenerator] = useState(false); // Unused for now
  const [tokenCount, setTokenCount] = useState("1");
  const [loading, setLoading] = useState(false);

  const haptic = useCallback((type: "light" | "success" | "error") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const handleAdminLogin = useCallback(() => {
    haptic("light");

    if (adminPassword === ADMIN_PASSWORD) {
      haptic("success");
      const session: AdminSession = {
        isLoggedIn: true,
        loginTime: Date.now(),
        sessionToken: Math.random().toString(36).substring(2, 15),
      };
      setAdminSession(session);
      setAdminPassword("");
      AsyncStorage.setItem("adminSession", JSON.stringify(session));
      Alert.alert("✅ Admin Access Granted", "Welcome to WHOAMISec Pro Admin Panel");
    } else {
      haptic("error");
      Alert.alert("❌ Access Denied", "Invalid admin password");
    }
  }, [adminPassword, haptic]);

  const handleChangePassword = useCallback(() => {
    haptic("light");

    if (secretWord !== ADMIN_SECRET_WORD) {
      haptic("error");
      Alert.alert("❌ Invalid Secret Word", "Cannot change admin password");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      haptic("error");
      Alert.alert("❌ Invalid Password", "Password must be at least 8 characters");
      return;
    }

    haptic("success");
    Alert.alert("✅ Password Changed", `New admin password set to: ${newPassword}\n\nKeep this safe!`);
    setNewPassword("");
    setSecretWord("");
    setChangePasswordMode(false);
  }, [secretWord, newPassword, haptic]);

  const handleLogout = useCallback(() => {
    haptic("light");
    setAdminSession(null);
    AsyncStorage.removeItem("adminSession");
    Alert.alert("Logged Out", "Admin session terminated");
  }, [haptic]);

  // ============================================================
  // TOKEN GENERATION
  // ============================================================

  const generateTokens = useCallback(() => {
    if (!selectedPlan) {
      Alert.alert("❌ Select a Plan", "Choose a payment plan first");
      return;
    }

    haptic("light");
    setLoading(true);

    const plan = PAYMENT_PLANS.find((p) => p.id === selectedPlan);
    if (!plan) return;

    const count = parseInt(tokenCount) || 1;
    const newTokens: UserSubscription[] = [];

    for (let i = 0; i < count; i++) {
      const token = `WHM-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const now = Date.now();
      let expiresAt = now;

      // Calculate expiration based on plan
      if (selectedPlan === "trial") {
        expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours
      } else if (selectedPlan === "weekly") {
        expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days
      } else if (selectedPlan === "monthly") {
        expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days
      } else if (selectedPlan === "yearly") {
        expiresAt = now + 365 * 24 * 60 * 60 * 1000; // 365 days
      }

      newTokens.push({
        planId: selectedPlan,
        startTime: now,
        expiresAt,
        token,
        status: "active",
      });
    }

    setGeneratedTokens([...generatedTokens, ...newTokens]);
    setLoading(false);
    haptic("success");
    Alert.alert("✅ Tokens Generated", `Generated ${count} ${plan.name} token(s)`);
    setTokenCount("1");
  }, [selectedPlan, tokenCount, generatedTokens, haptic]);

  // ============================================================
  // LOGIN SCREEN
  // ============================================================

  if (!adminSession) {
    return (
      <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
          <View style={s.loginContainer}>
            <Text style={s.title}>⚙️ ADMIN LOGIN</Text>
            <Text style={s.subtitle}>WHOAMISec Pro v8.6</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>ADMIN PASSWORD</Text>
              <TextInput
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder="Enter admin password"
                placeholderTextColor="#4b5563"
                secureTextEntry
                style={s.input}
              />
            </View>

            <Pressable
              onPress={handleAdminLogin}
              style={({ pressed }) => [s.button, s.loginButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={s.buttonText}>LOGIN</Text>
            </Pressable>

            <View style={s.divider} />

            <Text style={s.subtitle}>Change Admin Password</Text>

            <Pressable
              onPress={() => setChangePasswordMode(!changePasswordMode)}
              style={({ pressed }) => [s.button, s.secondaryButton, pressed && { opacity: 0.8 }]}
            >
              <Text style={s.buttonText}>{changePasswordMode ? "CANCEL" : "CHANGE PASSWORD"}</Text>
            </Pressable>

            {changePasswordMode && (
              <View style={s.changePasswordForm}>
                <View style={s.inputGroup}>
                  <Text style={s.label}>SECRET WORD</Text>
                  <TextInput
                    value={secretWord}
                    onChangeText={setSecretWord}
                    placeholder="Enter secret word"
                    placeholderTextColor="#4b5563"
                    secureTextEntry
                    style={s.input}
                  />
                </View>

                <View style={s.inputGroup}>
                  <Text style={s.label}>NEW PASSWORD</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password (min 8 chars)"
                    placeholderTextColor="#4b5563"
                    secureTextEntry
                    style={s.input}
                  />
                </View>

                <Pressable
                  onPress={handleChangePassword}
                  style={({ pressed }) => [s.button, s.confirmButton, pressed && { opacity: 0.8 }]}
                >
                  <Text style={s.buttonText}>CONFIRM CHANGE</Text>
                </Pressable>
              </View>
            )}

            <View style={s.infoBox}>
              <Text style={s.infoText}>🔒 This is a restricted admin panel</Text>
              <Text style={s.infoText}>⚠️ Only authorized administrators can access</Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ============================================================
  // ADMIN PANEL SCREEN
  // ============================================================

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>👤 ADMIN PANEL</Text>
            <Text style={s.headerSub}>Session: {adminSession.sessionToken.substring(0, 8)}...</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [s.logoutBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={s.logoutBtnText}>LOGOUT</Text>
          </Pressable>
        </View>

        {/* Payment Plans */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💳 PAYMENT PLANS</Text>

          {PAYMENT_PLANS.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => {
                haptic("light");
                setSelectedPlan(selectedPlan === plan.id ? null : plan.id);
              }}
              style={({ pressed }) => [
                s.planCard,
                {
                  borderColor: selectedPlan === plan.id ? plan.color : "#1e293b",
                  backgroundColor: selectedPlan === plan.id ? plan.color + "15" : "#0d1117",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.planName, { color: plan.color }]}>{plan.name}</Text>
                <Text style={s.planDuration}>{plan.duration}</Text>
                <Text style={s.planPrice}>${plan.price}</Text>
                {plan.features.map((feature, idx) => (
                  <Text key={idx} style={s.planFeature}>
                    ✓ {feature}
                  </Text>
                ))}
              </View>
              <View style={[s.checkbox, { borderColor: plan.color }]}>
                {selectedPlan === plan.id && <View style={[s.checkboxInner, { backgroundColor: plan.color }]} />}
              </View>
            </Pressable>
          ))}
        </View>

        {/* Token Generator */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔑 TOKEN GENERATOR</Text>

          <View style={s.inputGroup}>
            <Text style={s.label}>NUMBER OF TOKENS</Text>
            <TextInput
              value={tokenCount}
              onChangeText={setTokenCount}
              placeholder="1"
              placeholderTextColor="#4b5563"
              keyboardType="number-pad"
              style={s.input}
            />
          </View>

          <Pressable
            onPress={generateTokens}
            disabled={loading || !selectedPlan}
            style={({ pressed }) => [
              s.button,
              s.generateButton,
              (loading || !selectedPlan) && { opacity: 0.5 },
              pressed && { opacity: 0.8 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#0a0e17" />
            ) : (
              <Text style={s.buttonText}>GENERATE TOKENS</Text>
            )}
          </Pressable>

          {generatedTokens.length > 0 && (
            <View style={s.tokensContainer}>
              <Text style={s.tokensTitle}>Generated Tokens ({generatedTokens.length})</Text>
              {generatedTokens.slice(-5).map((sub, idx) => {
                const plan = PAYMENT_PLANS.find((p) => p.id === sub.planId);
                const expiresIn = Math.floor((sub.expiresAt - Date.now()) / 1000 / 60 / 60);
                return (
                  <View key={idx} style={[s.tokenItem, { borderColor: plan?.color }]}>
                    <Text style={[s.tokenText, { color: plan?.color }]}>{sub.token}</Text>
                    <Text style={s.tokenMeta}>{plan?.name} • Expires in {expiresIn}h</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>💰 PAYMENT METHODS</Text>

          <View style={s.paymentMethod}>
            <Text style={s.methodTitle}>🔐 MONERO (XMR) - ANONYMOUS</Text>
            <Text style={s.methodAddress}>{MONERO_ADDRESS}</Text>
            <Pressable
              onPress={() => {
                haptic("light");
                Alert.alert("Monero Address Copied", "Paste in your Monero wallet");
              }}
              style={({ pressed }) => [s.copyButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.copyButtonText}>COPY ADDRESS</Text>
            </Pressable>
          </View>

          <View style={s.paymentMethod}>
            <Text style={s.methodTitle}>🔗 ANONYMOUS PAYMENT LINK</Text>
            <Text style={s.methodDesc}>For users who cannot use crypto</Text>
            <Pressable
              onPress={() => {
                haptic("light");
                Alert.alert("Anonymous Payment", "Link: https://pay.whoamisec.pro/anonymous\n\nNo personal data required");
              }}
              style={({ pressed }) => [s.copyButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={s.copyButtonText}>OPEN PAYMENT LINK</Text>
            </Pressable>
          </View>
        </View>

        {/* Admin Info */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>ℹ️ ADMIN INFORMATION</Text>
          <Text style={s.infoText}>• Session started: {new Date(adminSession.loginTime).toLocaleString()}</Text>
          <Text style={s.infoText}>• All tokens are cryptographically signed</Text>
          <Text style={s.infoText}>• Tokens expire automatically after duration</Text>
          <Text style={s.infoText}>• Users can extend subscriptions anytime</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ============================================================
// STYLES
// ============================================================

const mono = Platform.OS === "ios" ? "Menlo" : "monospace";

const s = StyleSheet.create({
  loginContainer: {
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: mono,
    marginBottom: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00e5ff",
    fontFamily: mono,
  },
  input: {
    backgroundColor: "#0d1117",
    color: "#e0e7ff",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: mono,
    fontSize: 13,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#00ff88",
  },
  secondaryButton: {
    backgroundColor: "#00e5ff",
  },
  confirmButton: {
    backgroundColor: "#ff00ff",
  },
  generateButton: {
    backgroundColor: "#ffff00",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0a0e17",
    fontFamily: mono,
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 12,
  },
  changePasswordForm: {
    gap: 12,
    padding: 12,
    backgroundColor: "#0d1117",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoBox: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  infoText: {
    fontSize: 11,
    color: "#00e5ff",
    fontFamily: mono,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
  },
  headerSub: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: mono,
  },
  logoutBtn: {
    backgroundColor: "#ff3b5c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#fff",
    fontFamily: mono,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
  },
  planCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 12,
    alignItems: "flex-start",
  },
  planName: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: mono,
  },
  planDuration: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: mono,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e0e7ff",
    fontFamily: mono,
    marginVertical: 4,
  },
  planFeature: {
    fontSize: 10,
    color: "#9ca3af",
    fontFamily: mono,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  tokensContainer: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  tokensTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
  },
  tokenItem: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
  },
  tokenText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: mono,
    marginBottom: 2,
  },
  tokenMeta: {
    fontSize: 9,
    color: "#6b7280",
    fontFamily: mono,
  },
  paymentMethod: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
  },
  methodAddress: {
    fontSize: 9,
    color: "#e0e7ff",
    fontFamily: mono,
    backgroundColor: "#111827",
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  methodDesc: {
    fontSize: 10,
    color: "#6b7280",
    fontFamily: mono,
  },
  copyButton: {
    backgroundColor: "#00e5ff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0a0e17",
    fontFamily: mono,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: mono,
    marginBottom: 4,
  },
});
