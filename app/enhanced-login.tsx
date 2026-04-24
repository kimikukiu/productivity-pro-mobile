import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

type LoginMode = "mode-select" | "admin" | "subscriber" | "payment";

interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  currency: string;
}

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: "weekly",
    name: "Weekly Access",
    price: 30,
    duration: "7 days",
    features: ["All tools", "24/7 support", "Auto-renewal"],
    currency: "USD",
  },
  {
    id: "monthly",
    name: "Monthly Access",
    price: 300,
    duration: "30 days",
    features: ["All tools", "Priority support", "Advanced analytics"],
    currency: "USD",
  },
  {
    id: "yearly",
    name: "Yearly Access",
    price: 1000,
    duration: "365 days",
    features: ["All tools", "VIP support", "Custom integrations"],
    currency: "USD",
  },
];

const ADMIN_PASSWORD = "#AllOfThem-3301";
const MONERO_ADDRESS = "48Y2Eo1QJFt2581MsA3tBXcqtEMTDope7N7zJ8bHxAeCV8nQKwVV";

export default function EnhancedLoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("mode-select");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleAdminLogin = async () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setLoading(true);
      try {
        // Generate admin token
        const adminToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Store admin session
        localStorage.setItem("userToken", adminToken);
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("loginTime", new Date().toISOString());

        Alert.alert("Success", "Admin login successful");
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert("Error", "Login failed");
      } finally {
        setLoading(false);
      }
    } else {
      Alert.alert("Error", "Invalid admin password");
    }
  };

  const handlePaymentProcess = async () => {
    if (!selectedPlan || !email) {
      Alert.alert("Error", "Please select a plan and enter email");
      return;
    }

    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate subscriber token
      const subscriberToken = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiryDate = new Date();
      expiryDate.setDate(
        expiryDate.getDate() + parseInt(selectedPlan.duration.split(" ")[0])
      );

      // Store subscriber session
      localStorage.setItem("userToken", subscriberToken);
      localStorage.setItem("userRole", "subscriber");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("subscriptionPlan", selectedPlan.id);
      localStorage.setItem("subscriptionExpiry", expiryDate.toISOString());
      localStorage.setItem("loginTime", new Date().toISOString());

      Alert.alert(
        "Success",
        `Payment processed! Token generated.\nPlan: ${selectedPlan.name}\nExpires: ${expiryDate.toLocaleDateString()}`
      );
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Error", "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "mode-select") {
    return (
      <ScreenContainer className="bg-gradient-to-b from-slate-900 to-black p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center gap-6">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-4xl font-bold text-green-400 mb-2">
                WHOAMISec Pro
              </Text>
              <Text className="text-lg text-gray-400">v8.6</Text>
            </View>

            {/* Admin Login Button */}
            <TouchableOpacity
              onPress={() => setMode("admin")}
              className="bg-red-600 p-6 rounded-lg border-2 border-red-500"
            >
              <Text className="text-white text-xl font-bold text-center">
                🔐 Admin Login
              </Text>
              <Text className="text-gray-200 text-sm text-center mt-2">
                Full system access
              </Text>
            </TouchableOpacity>

            {/* Subscriber Payment Button */}
            <TouchableOpacity
              onPress={() => setMode("subscriber")}
              className="bg-blue-600 p-6 rounded-lg border-2 border-blue-500"
            >
              <Text className="text-white text-xl font-bold text-center">
                💳 Subscribe & Access
              </Text>
              <Text className="text-gray-200 text-sm text-center mt-2">
                Choose a payment plan
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (mode === "admin") {
    return (
      <ScreenContainer className="bg-gradient-to-b from-slate-900 to-black p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 justify-center gap-6">
            <TouchableOpacity
              onPress={() => setMode("mode-select")}
              className="mb-4"
            >
              <Text className="text-blue-400 text-lg">← Back</Text>
            </TouchableOpacity>

            <View className="items-center mb-6">
              <Text className="text-3xl font-bold text-red-400">
                Admin Login
              </Text>
            </View>

            <View className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <Text className="text-white text-lg font-semibold mb-4">
                Enter Admin Password
              </Text>
              <TextInput
                secureTextEntry
                placeholder="Password"
                placeholderTextColor="#666"
                value={adminPassword}
                onChangeText={setAdminPassword}
                className="bg-slate-700 text-white p-4 rounded-lg mb-6 border border-slate-600"
              />

              <TouchableOpacity
                onPress={handleAdminLogin}
                disabled={loading}
                className="bg-red-600 p-4 rounded-lg"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold text-center">
                    Login as Admin
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (mode === "subscriber") {
    return (
      <ScreenContainer className="bg-gradient-to-b from-slate-900 to-black p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity
            onPress={() => setMode("mode-select")}
            className="mb-4"
          >
            <Text className="text-blue-400 text-lg">← Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-blue-400">
              Choose Your Plan
            </Text>
          </View>

          {PAYMENT_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => {
                setSelectedPlan(plan);
                setMode("payment");
              }}
              className={`mb-4 p-6 rounded-lg border-2 ${
                selectedPlan?.id === plan.id
                  ? "bg-blue-600 border-blue-400"
                  : "bg-slate-800 border-slate-700"
              }`}
            >
              <Text className="text-white text-xl font-bold">{plan.name}</Text>
              <Text className="text-green-400 text-2xl font-bold my-2">
                ${plan.price}
              </Text>
              <Text className="text-gray-300 text-sm mb-3">{plan.duration}</Text>
              {plan.features.map((feature, idx) => (
                <Text key={idx} className="text-gray-300 text-sm">
                  ✓ {feature}
                </Text>
              ))}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (mode === "payment") {
    return (
      <ScreenContainer className="bg-gradient-to-b from-slate-900 to-black p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <TouchableOpacity
            onPress={() => setMode("subscriber")}
            className="mb-4"
          >
            <Text className="text-blue-400 text-lg">← Back</Text>
          </TouchableOpacity>

          <View className="items-center mb-6">
            <Text className="text-3xl font-bold text-green-400">
              Complete Payment
            </Text>
          </View>

          {selectedPlan && (
            <View className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
              <Text className="text-white text-lg font-semibold mb-4">
                {selectedPlan.name}
              </Text>
              <Text className="text-green-400 text-3xl font-bold mb-4">
                ${selectedPlan.price}
              </Text>

              <View className="bg-slate-900 p-4 rounded-lg mb-6">
                <Text className="text-gray-400 text-sm mb-2">
                  Monero Payment Address:
                </Text>
                <Text className="text-green-400 text-xs font-mono break-all">
                  {MONERO_ADDRESS}
                </Text>
              </View>

              <View className="mb-6">
                <Text className="text-white text-lg font-semibold mb-4">
                  Email Address
                </Text>
                <TextInput
                  placeholder="your@email.com"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  className="bg-slate-700 text-white p-4 rounded-lg border border-slate-600"
                />
              </View>

              <TouchableOpacity
                onPress={handlePaymentProcess}
                disabled={loading}
                className="bg-green-600 p-4 rounded-lg"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold text-center">
                    Generate Access Token
                  </Text>
                )}
              </TouchableOpacity>

              <Text className="text-gray-400 text-xs text-center mt-4">
                After payment, your token will be automatically generated
              </Text>
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  return null;
}
