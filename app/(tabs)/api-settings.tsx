import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import * as WebBrowser from "expo-web-browser";

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
  zaiConnected: boolean;
  githubConnected: boolean;
}

export default function ApiSettingsScreen() {
  const colors = useColors();
  const [settings, setSettings] = useState<ApiSettings>({
    zai: {
      name: "z.ai (GitHub OAuth)",
      key: "",
      models: ["GPT-4-Turbo", "Claude-3-Opus", "Llama-2-70b", "Mistral-7B"],
      selectedModel: "GPT-4-Turbo",
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
    zaiConnected: false,
    githubConnected: false,
  });

  const [loading, setLoading] = useState(false);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/trpc/zaiOAuth.getConnectionStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json());

      if (response?.result?.data) {
        setSettings((prev) => ({
          ...prev,
          zaiConnected: response.result.data.isConnected,
          githubConnected: response.result.data.hasGithubToken,
        }));
      }
    } catch (error) {
      console.log("No saved settings yet");
    }
  };

  const handleZaiOAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trpc/zaiOAuth.getOAuthUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).then((r) => r.json());

      if (response?.result?.data?.url) {
        const result = await WebBrowser.openBrowserAsync(response.result.data.url);

        if ((result as any).type === "success") {
          Alert.alert("Success", "Connected to z.ai with GitHub OAuth!");
          setSettings((prev) => ({
            ...prev,
            zai: { ...prev.zai, isActive: true },
            zaiConnected: true,
            githubConnected: true,
          }));
        }
      }
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "OAuth failed");
    } finally {
      setLoading(false);
    }
  };

  const trainProjectModels = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trpc/zaiOAuth.trainProjectModels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectPath: "/home/ubuntu/productivity-pro-mobile",
          models: settings.zai.models,
        }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        Alert.alert("Success", "Project models trained with z.ai!\n\nAll backend endpoints and tools are now trained.");
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
      const apiKey = settings.huggingface.key.trim();

      if (!apiKey) {
        Alert.alert("Error", "Please enter HuggingFace API key");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/trpc/apiSettings.saveApiKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "huggingface",
          apiKey,
          model: settings.huggingface.selectedModel,
        }),
      }).then((r) => r.json());

      if (response?.result?.data?.success) {
        setSettings((prev) => ({
          ...prev,
          huggingface: {
            ...prev.huggingface,
            isActive: true,
          },
        }));
        Alert.alert("Success", "HuggingFace API key saved!");
      } else {
        Alert.alert("Error", "Failed to save API key");
      }
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
            <Text className="text-sm text-muted">Connect z.ai with GitHub OAuth or use HuggingFace</Text>
          </View>

          {/* z.ai OAuth Section */}
          <View className="bg-surface border-2 border-primary rounded-lg p-4 gap-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-1 flex-1">
                <Text className="text-lg font-semibold text-foreground">z.ai (GitHub OAuth)</Text>
                <Text className="text-xs text-muted">Primary AI provider - trains entire project</Text>
              </View>
              {settings.zaiConnected && (
                <View className="bg-success/20 px-3 py-1 rounded-full">
                  <Text className="text-xs font-bold text-success">✓ Connected</Text>
                </View>
              )}
            </View>

            {!settings.zaiConnected ? (
              <>
                <TouchableOpacity
                  onPress={handleZaiOAuth}
                  disabled={loading}
                  className="bg-primary px-4 py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-background">
                    {loading ? "Connecting..." : "🔗 Connect with GitHub"}
                  </Text>
                </TouchableOpacity>
                <Text className="text-xs text-muted text-center">
                  Click to authenticate with GitHub and enable z.ai for your project
                </Text>
              </>
            ) : (
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
                  onPress={trainProjectModels}
                  disabled={loading}
                  className="bg-primary/80 px-4 py-3 rounded-lg"
                >
                  <Text className="text-center font-semibold text-background">
                    {loading ? "Training..." : "🚀 Train Project with z.ai"}
                  </Text>
                </TouchableOpacity>

                <Text className="text-xs text-success">
                  ✓ Project trained on all models, backend endpoints, and tools
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
                value={settings.huggingface.key}
                onChangeText={(key) =>
                  setSettings((prev) => ({
                    ...prev,
                    huggingface: { ...prev.huggingface, key },
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
              disabled={loading || !settings.huggingface.key.trim()}
              className={cn(
                "px-4 py-3 rounded-lg",
                settings.huggingface.key.trim() ? "bg-primary" : "bg-border opacity-50"
              )}
            >
              <Text className="text-center font-semibold text-background">
                {loading ? "Saving..." : "Save HuggingFace Key"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Box */}
          <View className="bg-primary/10 border border-primary rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-primary">💡 How it works:</Text>
            <Text className="text-xs text-foreground leading-relaxed">
              1. Connect z.ai with GitHub OAuth (primary){"\n"}
              2. Project auto-trains on all models{"\n"}
              3. Backend endpoints get trained{"\n"}
              4. All tools get trained{"\n"}
              5. Add HuggingFace as fallback (optional)
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
