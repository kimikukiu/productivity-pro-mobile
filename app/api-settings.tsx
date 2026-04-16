import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface ProviderConfig {
  name: string;
  key: string;
  models: string[];
  selectedModel: string;
  isActive: boolean;
}

interface ApiSettings {
  zai: ProviderConfig;
  huggingface: ProviderConfig;
  selectedProvider: "zai" | "huggingface";
}

export default function ApiSettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<ApiSettings>({
    zai: {
      name: "z-ai-web-dev-sdk",
      key: "",
      models: ["GLM-5.1-Turbo", "GPT-4-Turbo", "Claude-3-Opus"],
      selectedModel: "GLM-5.1-Turbo",
      isActive: false,
    },
    huggingface: {
      name: "HuggingFace",
      key: "",
      models: ["meta-llama/Llama-2-70b", "mistralai/Mistral-7B", "NousResearch/Hermes-2-Theta"],
      selectedModel: "meta-llama/Llama-2-70b",
      isActive: false,
    },
    selectedProvider: "zai",
  });

  const [loading, setLoading] = useState(false);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await fetch("/api/trpc/system.getApiSettings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json());

      if (stored?.result?.data) {
        setSettings(stored.result.data);
      }
    } catch (error) {
      console.log("No saved settings yet");
    }
  };

  const saveApiKey = async (provider: "zai" | "huggingface") => {
    setLoading(true);
    try {
      const apiKey = settings[provider].key.trim();

      if (!apiKey) {
        Alert.alert("Error", `Please enter ${settings[provider].name} API key`);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/trpc/system.saveApiKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          model: settings[provider].selectedModel,
        }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        setSettings((prev) => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            isActive: true,
          },
        }));
        Alert.alert("Success", `${settings[provider].name} API key saved!`);
      } else {
        Alert.alert("Error", "Failed to save API key");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const testProvider = async (provider: "zai" | "huggingface") => {
    setLoading(true);
    try {
      const response = await fetch("/api/trpc/multiModel.invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Say 'API connection successful' if you can read this.",
            },
          ],
          model: settings[provider].selectedModel,
          provider,
        }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        Alert.alert("Success", `${settings[provider].name} is working!\n\nResponse: ${response.result.data.content.substring(0, 100)}...`);
      } else {
        Alert.alert("Error", "API test failed. Check your key.");
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Test failed");
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
            <Text className="text-3xl font-bold text-foreground">API Settings</Text>
            <Text className="text-sm text-muted">Configure LLM providers and models</Text>
          </View>

          {/* Provider Selection */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Select Provider</Text>
            <View className="flex-row gap-2">
              {(["zai", "huggingface"] as const).map((provider) => (
                <TouchableOpacity
                  key={provider}
                  onPress={() => setSettings((prev) => ({ ...prev, selectedProvider: provider }))}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-lg border-2",
                    settings.selectedProvider === provider
                      ? "border-primary bg-primary"
                      : "border-border bg-surface"
                  )}
                >
                  <Text
                    className={cn(
                      "text-center font-semibold",
                      settings.selectedProvider === provider ? "text-background" : "text-foreground"
                    )}
                  >
                    {settings[provider].name}
                  </Text>
                  {settings[provider].isActive && (
                    <Text className={cn("text-xs text-center mt-1", settings.selectedProvider === provider ? "text-background" : "text-success")}>
                      ✓ Active
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* z-ai-web-dev-sdk Settings */}
          <ProviderCard
            provider={settings.zai}
            providerKey="zai"
            isSelected={settings.selectedProvider === "zai"}
            onKeyChange={(key) =>
              setSettings((prev) => ({
                ...prev,
                zai: { ...prev.zai, key },
              }))
            }
            onModelChange={(model) =>
              setSettings((prev) => ({
                ...prev,
                zai: { ...prev.zai, selectedModel: model },
              }))
            }
            onSave={() => saveApiKey("zai")}
            onTest={() => testProvider("zai")}
            loading={loading}
            colors={colors}
          />

          {/* HuggingFace Settings */}
          <ProviderCard
            provider={settings.huggingface}
            providerKey="huggingface"
            isSelected={settings.selectedProvider === "huggingface"}
            onKeyChange={(key) =>
              setSettings((prev) => ({
                ...prev,
                huggingface: { ...prev.huggingface, key },
              }))
            }
            onModelChange={(model) =>
              setSettings((prev) => ({
                ...prev,
                huggingface: { ...prev.huggingface, selectedModel: model },
              }))
            }
            onSave={() => saveApiKey("huggingface")}
            onTest={() => testProvider("huggingface")}
            loading={loading}
            colors={colors}
          />

          {/* Info Box */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">💡 How to get API keys:</Text>
            <Text className="text-xs text-muted">
              • z-ai-web-dev-sdk: Visit https://z-ai.dev and create an account{"\n"}
              • HuggingFace: Visit https://huggingface.co and generate API token
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

interface ProviderCardProps {
  provider: ProviderConfig;
  providerKey: "zai" | "huggingface";
  isSelected: boolean;
  onKeyChange: (key: string) => void;
  onModelChange: (model: string) => void;
  onSave: () => void;
  onTest: () => void;
  loading: boolean;
  colors: any;
}

function ProviderCard({
  provider,
  providerKey,
  isSelected,
  onKeyChange,
  onModelChange,
  onSave,
  onTest,
  loading,
  colors,
}: ProviderCardProps) {
  return (
    <View
      className={cn(
        "border-2 rounded-lg p-4 gap-3",
        isSelected ? "border-primary bg-surface" : "border-border bg-surface opacity-70"
      )}
    >
      {/* Provider Name */}
      <Text className="text-lg font-semibold text-foreground">{provider.name}</Text>

      {/* API Key Input */}
      <View className="gap-2">
        <Text className="text-sm text-muted">API Key</Text>
        <TextInput
          placeholder={`Enter ${provider.name} API key...`}
          placeholderTextColor={colors.muted}
          value={provider.key}
          onChangeText={onKeyChange}
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
          {provider.models.map((model) => (
            <TouchableOpacity
              key={model}
              onPress={() => onModelChange(model)}
              className={cn(
                "px-3 py-2 rounded-lg border",
                provider.selectedModel === model
                  ? "bg-primary border-primary"
                  : "bg-background border-border"
              )}
            >
              <Text
                className={cn(
                  "text-xs font-semibold",
                  provider.selectedModel === model ? "text-background" : "text-foreground"
                )}
              >
                {model}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onSave}
          disabled={loading || !provider.key.trim()}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg",
            provider.key.trim() ? "bg-primary" : "bg-border opacity-50"
          )}
        >
          <Text className="text-center font-semibold text-background">
            {loading ? "Saving..." : "Save API"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onTest}
          disabled={loading || !provider.isActive}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg border-2",
            provider.isActive ? "border-primary bg-background" : "border-border opacity-50"
          )}
        >
          <Text className={cn("text-center font-semibold", provider.isActive ? "text-primary" : "text-muted")}>
            {loading ? "Testing..." : "Test"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      {provider.isActive && (
        <View className="bg-success/10 border border-success rounded-lg p-2">
          <Text className="text-xs text-success font-semibold">✓ Connected</Text>
        </View>
      )}
    </View>
  );
}
