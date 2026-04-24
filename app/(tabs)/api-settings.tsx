import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface ProviderConfig {
  name: string;
  apiKey: string;
  models: string[];
  selectedModel: string;
  isActive: boolean;
}

interface ApiSettings {
  zai: ProviderConfig;
  huggingface: ProviderConfig;
  selectedProvider: "zai" | "huggingface";
  zaiConnected: boolean;
}

export default function ApiSettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<ApiSettings>({
    zai: {
      name: "z.ai",
      apiKey: "",
      models: ["GPT-4-Turbo", "Claude-3-Opus", "Llama-2-70b", "Mistral-7B"],
      selectedModel: "GPT-4-Turbo",
      isActive: false,
    },
    huggingface: {
      name: "HuggingFace",
      apiKey: "",
      models: ["meta-llama/Llama-2-70b", "mistralai/Mistral-7B", "NousResearch/Hermes-2-Theta"],
      selectedModel: "meta-llama/Llama-2-70b",
      isActive: false,
    },
    selectedProvider: "zai",
    zaiConnected: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkZaiStatus();
  }, []);

  const checkZaiStatus = async () => {
    try {
      const response = await fetch("/api/trpc/zaiApi.getStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json());

      if (response?.result?.data?.isAuthenticated) {
        setSettings((prev) => ({
          ...prev,
          zai: { ...prev.zai, isActive: true },
          zaiConnected: true,
        }));

        // Fetch available models
        fetchZaiModels();
      }
    } catch (error) {
      console.log("z.ai status check failed");
    }
  };

  const fetchZaiModels = async () => {
    try {
      const response = await fetch("/api/trpc/zaiApi.getModels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json());

      if (response?.result?.data?.models?.length > 0) {
        setSettings((prev) => ({
          ...prev,
          zai: {
            ...prev.zai,
            models: response.result.data.models,
          },
        }));
      }
    } catch (error) {
      console.log("Failed to fetch z.ai models");
    }
  };

  const saveZaiApiKey = async () => {
    setLoading(true);
    try {
      const apiKey = settings.zai.apiKey.trim();

      if (!apiKey) {
        Alert.alert("Error", "Please enter z.ai API key");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/trpc/zaiApi.setApiKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        setSettings((prev) => ({
          ...prev,
          zai: { ...prev.zai, isActive: true },
          zaiConnected: true,
        }));
        Alert.alert("Success", "z.ai API key saved and authenticated!");
        fetchZaiModels();
      } else {
        Alert.alert("Error", response?.result?.data?.error || "Failed to save API key");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const trainProjectWithZai = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trpc/zaiApi.trainProject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "productivity-pro-mobile",
          models: settings.zai.models,
        }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        Alert.alert("Success", `✓ Project training started!\n\nTraining ID: ${response.result.data.trainingId}\n\nYour entire project is now being trained on all z.ai models.`);
      } else {
        Alert.alert("Error", response?.result?.data?.error || "Training failed");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Training failed");
    } finally {
      setLoading(false);
    }
  };

  const saveHuggingFaceKey = async () => {
    setLoading(true);
    try {
      const apiKey = settings.huggingface.apiKey.trim();

      if (!apiKey) {
        Alert.alert("Error", "Please enter HuggingFace API key");
        setLoading(false);
        return;
      }

      // Store HuggingFace key (implement your storage logic)
      setSettings((prev) => ({
        ...prev,
        huggingface: { ...prev.huggingface, isActive: true },
      }));
      Alert.alert("Success", "HuggingFace API key saved!");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">LLM Configuration</Text>
            <Text className="text-sm text-muted">Connect z.ai or use HuggingFace</Text>
          </View>

          {/* z.ai Section */}
          <View className="bg-surface border-2 border-primary rounded-lg p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-1 flex-1">
                <Text className="text-lg font-semibold text-foreground">z.ai</Text>
                <Text className="text-xs text-muted">Primary AI provider - real API integration</Text>
              </View>
              {settings.zaiConnected && (
                <View className="bg-success/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-success">✓ Connected</Text>
                </View>
              )}
            </View>

            {/* API Key Input */}
            <View className="gap-2">
              <Text className="text-sm text-muted">API Key</Text>
              <TextInput
                placeholder="Enter your z.ai API key..."
                placeholderTextColor={colors.muted}
                value={settings.zai.apiKey}
                onChangeText={(key) =>
                  setSettings((prev) => ({
                    ...prev,
                    zai: { ...prev.zai, apiKey: key },
                  }))
                }
                secureTextEntry={true}
                editable={!loading}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                style={{ color: colors.foreground }}
              />
              <Text className="text-xs text-muted">Get your key from: https://z-ai.dev/api</Text>
            </View>

            {/* Save API Key Button */}
            <TouchableOpacity
              onPress={saveZaiApiKey}
              disabled={loading || !settings.zai.apiKey.trim()}
              className={cn(
                "px-4 py-3 rounded-lg",
                settings.zai.apiKey.trim() ? "bg-primary" : "bg-border opacity-50"
              )}
            >
              <Text className="text-center font-semibold text-background">
                {loading ? "Authenticating..." : "🔑 Save & Authenticate"}
              </Text>
            </TouchableOpacity>

            {settings.zaiConnected && (
              <>
                {/* Model Selection */}
                <View className="gap-2">
                  <Text className="text-sm text-muted">Available Models</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                    {settings.zai.models.map((model) => (
                      <TouchableOpacity
                        key={model}
                        onPress={() =>
                          setSettings((prev) => ({
                            ...prev,
                            zai: { ...prev.zai, selectedModel: model },
                          }))
                        }
                        className={cn(
                          "px-3 py-2 rounded-lg border",
                          settings.zai.selectedModel === model
                            ? "bg-primary border-primary"
                            : "bg-background border-border"
                        )}
                      >
                        <Text
                          className={cn(
                            "text-xs font-semibold",
                            settings.zai.selectedModel === model ? "text-background" : "text-foreground"
                          )}
                        >
                          {model}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Train Project Button */}
                <TouchableOpacity
                  onPress={trainProjectWithZai}
                  disabled={loading}
                  className="bg-primary/80 px-4 py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-background">
                    {loading ? "Training..." : "🚀 Train Entire Project"}
                  </Text>
                </TouchableOpacity>

                <Text className="text-xs text-success">
                  ✓ All models, backend endpoints, and tools will be trained
                </Text>
              </>
            )}
          </View>

          {/* HuggingFace Section */}
          <View className="bg-surface border-2 border-border rounded-lg p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-1 flex-1">
                <Text className="text-lg font-semibold text-foreground">HuggingFace (Fallback)</Text>
                <Text className="text-xs text-muted">Backup provider for additional models</Text>
              </View>
              {settings.huggingface.isActive && (
                <View className="bg-success/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-success">✓ Active</Text>
                </View>
              )}
            </View>

            {/* API Key Input */}
            <View className="gap-2">
              <Text className="text-sm text-muted">API Key</Text>
              <TextInput
                placeholder="Enter HuggingFace API key..."
                placeholderTextColor={colors.muted}
                value={settings.huggingface.apiKey}
                onChangeText={(key) =>
                  setSettings((prev) => ({
                    ...prev,
                    huggingface: { ...prev.huggingface, apiKey: key },
                  }))
                }
                secureTextEntry={true}
                editable={!loading}
                className="bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Model Selection */}
            <View className="gap-2">
              <Text className="text-sm text-muted">Model</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
                {settings.huggingface.models.map((model) => (
                  <TouchableOpacity
                    key={model}
                    onPress={() =>
                      setSettings((prev) => ({
                        ...prev,
                        huggingface: { ...prev.huggingface, selectedModel: model },
                      }))
                    }
                    className={cn(
                      "px-3 py-2 rounded-lg border",
                      settings.huggingface.selectedModel === model
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-xs font-semibold",
                        settings.huggingface.selectedModel === model ? "text-background" : "text-foreground"
                      )}
                    >
                      {model.split("/")[1] || model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={saveHuggingFaceKey}
              disabled={loading || !settings.huggingface.apiKey.trim()}
              className={cn(
                "px-4 py-3 rounded-lg",
                settings.huggingface.apiKey.trim() ? "bg-primary" : "bg-border opacity-50"
              )}
            >
              <Text className="text-center font-semibold text-background">
                {loading ? "Saving..." : "Save HuggingFace Key"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 Setup Instructions:</Text>
            <Text className="text-xs text-foreground leading-relaxed">
              1. Get z.ai API key from https://z-ai.dev/api{"\n"}
              2. Paste key and click "Save & Authenticate"{"\n"}
              3. Click "Train Entire Project" to train all models{"\n"}
              4. (Optional) Add HuggingFace as fallback
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
