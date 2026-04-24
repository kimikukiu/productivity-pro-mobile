import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"admin" | "subscriber">("admin");
  const router = useRouter();
  const { login, setUserToken } = useAuth();
  const colors = useColors();

  const handleAdminLogin = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(password, true);
      if (success) {
        setPassword("");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Error", "Invalid admin password");
      }
    } catch (_error) {
      Alert.alert("Error", "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscriberLogin = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter token");
      return;
    }

    setIsLoading(true);
    try {
      await setUserToken(password);
      setPassword("");
      router.replace("/(tabs)");
    } catch (_error) {
      Alert.alert("Error", "Invalid token");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="flex-1 justify-center gap-8">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-4xl font-bold text-primary">WHOAMISec Pro</Text>
            <Text className="text-base text-muted">v8.6.0-PRO</Text>
          </View>

          {/* Mode Selector */}
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setMode("admin")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                mode === "admin"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  mode === "admin" ? "text-background" : "text-foreground"
                }`}
              >
                Admin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("subscriber")}
              className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                mode === "subscriber"
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  mode === "subscriber" ? "text-background" : "text-foreground"
                }`}
              >
                Subscriber
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Form */}
          <View className="gap-4">
            <View>
              <Text className="text-sm font-semibold text-muted mb-2">
                {mode === "admin" ? "Admin Password" : "Subscription Token"}
              </Text>
              <TextInput
                placeholder={mode === "admin" ? "Enter password" : "Enter token"}
                placeholderTextColor={colors.muted}
                secureTextEntry={mode === "admin"}
                value={password}
                onChangeText={setPassword}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              onPress={mode === "admin" ? handleAdminLogin : handleSubscriberLogin}
              disabled={isLoading}
              className={`py-3 px-4 rounded-lg ${
                isLoading ? "bg-muted opacity-50" : "bg-primary"
              }`}
            >
              <Text className="text-center font-semibold text-background">
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-sm text-muted">
              {mode === "admin"
                ? "Admin access required to manage system and generate tokens"
                : "Enter your subscription token to access WHOAMISec Pro features"}
            </Text>
          </View>

          {/* System Status */}
          <View className="gap-2">
            <Text className="text-xs text-muted text-center">SYSTEM STATUS</Text>
            <View className="flex-row justify-around">
              <View className="items-center">
                <View className="w-3 h-3 rounded-full bg-success mb-1" />
                <Text className="text-xs text-muted">Quantum Online</Text>
              </View>
              <View className="items-center">
                <View className="w-3 h-3 rounded-full bg-success mb-1" />
                <Text className="text-xs text-muted">IronClaw Active</Text>
              </View>
              <View className="items-center">
                <View className="w-3 h-3 rounded-full bg-success mb-1" />
                <Text className="text-xs text-muted">Protocols Ready</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
