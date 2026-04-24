import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useAuth } from "@/lib/auth-context";

interface Token {
  token: string;
  email: string;
  plan: string;
  expiresAt: string;
}

const PLANS = [
  { id: "test", name: "Test", duration: "12h", price: "Free" },
  { id: "weekly", name: "Weekly", duration: "7 days", price: "$30" },
  { id: "monthly", name: "Monthly", duration: "30 days", price: "$300" },
  { id: "yearly", name: "Yearly", duration: "365 days", price: "$1000" },
];

export function AdminTokenPanel() {
  const { generateToken } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("test");
  const [userEmail, setUserEmail] = useState("");
  const [generatedTokens, setGeneratedTokens] = useState<any[]>([]);

  const handleGenerateToken = () => {
    if (!userEmail) return;
    const token = generateToken(selectedPlan as "12h" | "weekly" | "monthly" | "yearly");
    setGeneratedTokens([...generatedTokens, { token, email: userEmail, plan: selectedPlan, expiresAt: new Date().toISOString() }]);
    setUserEmail("");
  };

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-foreground mb-6">Token Generation</Text>

      {/* Plan Selection */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">Select Plan</Text>
        <View className="flex-row flex-wrap gap-2">
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              className={`p-3 rounded-lg ${
                selectedPlan === plan.id ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedPlan === plan.id ? "text-background" : "text-foreground"
                }`}
              >
                {plan.name}
              </Text>
              <Text className={`text-xs ${selectedPlan === plan.id ? "text-background" : "text-muted"}`}>
                {plan.duration} - {plan.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Email Input */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-2">User Email</Text>
        <TextInput
          placeholder="user@example.com"
          value={userEmail}
          onChangeText={setUserEmail}
          className="bg-surface border border-border p-3 rounded-lg text-foreground"
          placeholderTextColor="#687076"
        />
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        onPress={handleGenerateToken}
        className="bg-primary p-4 rounded-lg mb-6 active:opacity-80"
      >
        <Text className="text-background font-bold text-center">Generate Token</Text>
      </TouchableOpacity>

      {/* Generated Tokens */}
      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">Generated Tokens</Text>
        {generatedTokens.map((token, idx) => (
          <View key={idx} className="bg-surface border border-border p-3 rounded-lg mb-2">
            <Text className="text-sm text-muted">Email: {token.email}</Text>
            <Text className="text-sm text-muted">Plan: {token.plan}</Text>
            <Text className="text-xs text-foreground font-mono mt-2 break-all">{token.token}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
