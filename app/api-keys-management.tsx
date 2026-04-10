import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

/**
 * API Keys Management Screen
 * Configure all LLM provider API keys for autonomous execution
 */

interface APIKeyEntry {
  id: string;
  provider: string;
  masked: string;
  isActive: boolean;
  priority: number;
  lastValidated?: string;
  modelId?: string;
}

interface ProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  placeholder: string;
  description: string;
  icon: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI GPT",
    endpoint: "https://api.openai.com/v1",
    placeholder: "sk-...",
    description: "GPT-4, GPT-3.5-turbo, and other OpenAI models",
    icon: "🤖",
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    endpoint: "https://api.anthropic.com/v1",
    placeholder: "sk-ant-...",
    description: "Claude 3 Opus, Sonnet, Haiku models",
    icon: "🧠",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    endpoint: "https://api.deepseek.com/v1",
    placeholder: "sk-...",
    description: "DeepSeek reasoning and code models",
    icon: "🔍",
  },
  {
    id: "groq",
    name: "Groq",
    endpoint: "https://api.groq.com/v1",
    placeholder: "gsk_...",
    description: "Fast inference with Groq's LPU",
    icon: "⚡",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    placeholder: "AIza...",
    description: "Google's Gemini Pro and Vision models",
    icon: "🔮",
  },
  {
    id: "mistral",
    name: "Mistral AI",
    endpoint: "https://api.mistral.ai/v1",
    placeholder: "eyJ...",
    description: "Mistral 7B, 8x7B, and Large models",
    icon: "🌟",
  },
  {
    id: "meta",
    name: "Meta LLaMA",
    endpoint: "https://api.llama.ai/v1",
    placeholder: "llama-...",
    description: "LLaMA 2 and LLaMA 3 models",
    icon: "🦙",
  },
  {
    id: "grok",
    name: "xAI Grok",
    endpoint: "https://api.x.ai/v1",
    placeholder: "xai-...",
    description: "Grok-1 and Grok-1.5 models",
    icon: "🎯",
  },
  {
    id: "cohere",
    name: "Cohere",
    endpoint: "https://api.cohere.ai/v1",
    placeholder: "co_...",
    description: "Command, Embed, and Rerank models",
    icon: "🌐",
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    endpoint: "https://api.perplexity.ai/v1",
    placeholder: "pplx-...",
    description: "Perplexity online search models",
    icon: "🔎",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    placeholder: "sk-or-...",
    description: "Access 100+ models through OpenRouter",
    icon: "🛣️",
  },
  {
    id: "together",
    name: "Together AI",
    endpoint: "https://api.together.xyz/v1",
    placeholder: "...",
    description: "Open-source and proprietary models",
    icon: "👥",
  },
];

export default function APIKeysManagementScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKeyEntry[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [modelIdInput, setModelIdInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("5");
  const [systemStatus, setSystemStatus] = useState<{
    ready: boolean;
    activeKeys: number;
    providers: string[];
  } | null>(null);

  // Load API keys on mount
  useEffect(() => {
    loadAPIKeys();
    checkSystemStatus();
  }, []);

  /**
   * Load existing API keys
   */
  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      // In production, this would call the actual API
      // const response = await fetch('/api/trpc/apiKeys.getAPIKeys');
      // const data = await response.json();
      // setApiKeys(data);
      setApiKeys([]); // Empty for now
    } catch (error) {
      console.error("Error loading API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check system status
   */
  const checkSystemStatus = async () => {
    try {
      // In production, this would call the actual API
      setSystemStatus({
        ready: apiKeys.length > 0,
        activeKeys: apiKeys.filter((k) => k.isActive).length,
        providers: [...new Set(apiKeys.map((k) => k.provider))],
      });
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  /**
   * Add new API key
   */
  const addAPIKey = async () => {
    if (!selectedProvider || !apiKeyInput.trim()) {
      Alert.alert("Error", "Please select a provider and enter an API key");
      return;
    }

    try {
      setLoading(true);

      // In production, this would call the actual API
      // const response = await fetch('/api/trpc/apiKeys.addAPIKey', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     apiKey: apiKeyInput,
      //     provider: selectedProvider,
      //     modelId: modelIdInput || undefined,
      //     priority: parseInt(priorityInput),
      //   }),
      // });

      // Simulate adding key
      const newKey: APIKeyEntry = {
        id: `${selectedProvider}-${Date.now()}`,
        provider: selectedProvider,
        masked: `${apiKeyInput.substring(0, 8)}...${apiKeyInput.substring(apiKeyInput.length - 4)}`,
        isActive: true,
        priority: parseInt(priorityInput),
        modelId: modelIdInput || undefined,
        lastValidated: new Date().toISOString(),
      };

      setApiKeys([...apiKeys, newKey]);
      setApiKeyInput("");
      setModelIdInput("");
      setPriorityInput("5");
      setSelectedProvider(null);

      Alert.alert("Success", `API key for ${selectedProvider} added successfully`);
      await checkSystemStatus();
    } catch (error) {
      Alert.alert("Error", "Failed to add API key");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete API key
   */
  const deleteAPIKey = async (keyId: string) => {
    try {
      setLoading(true);
      setApiKeys(apiKeys.filter((k) => k.id !== keyId));
      Alert.alert("Success", "API key deleted");
      await checkSystemStatus();
    } catch (error) {
      Alert.alert("Error", "Failed to delete API key");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle API key active status
   */
  const toggleAPIKeyStatus = async (keyId: string) => {
    setApiKeys(
      apiKeys.map((k) => (k.id === keyId ? { ...k, isActive: !k.isActive } : k))
    );
    await checkSystemStatus();
  };

  /**
   * Update API key priority
   */
  const updatePriority = (keyId: string, newPriority: number) => {
    setApiKeys(
      apiKeys.map((k) => (k.id === keyId ? { ...k, priority: newPriority } : k))
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              🔑 API Keys Management
            </Text>
            <Text className="text-base text-muted">
              Configure LLM provider API keys for autonomous execution
            </Text>
          </View>

          {/* System Status */}
          {systemStatus && (
            <View
              className={cn(
                "rounded-lg p-4 gap-2",
                systemStatus.ready ? "bg-success/10 border border-success" : "bg-warning/10 border border-warning"
              )}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">
                  System Status
                </Text>
                <View
                  className={cn(
                    "px-3 py-1 rounded-full",
                    systemStatus.ready ? "bg-success" : "bg-warning"
                  )}
                >
                  <Text className="text-xs font-bold text-background">
                    {systemStatus.ready ? "Ready" : "Incomplete"}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-muted">
                {systemStatus.activeKeys} active key{systemStatus.activeKeys !== 1 ? "s" : ""} •{" "}
                {systemStatus.providers.length} provider{systemStatus.providers.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Add New API Key Section */}
          <View className="bg-surface border border-border rounded-lg p-4 gap-4">
            <Text className="text-lg font-bold text-foreground">Add New API Key</Text>

            {/* Provider Selection */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">Select Provider</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="gap-2"
              >
                {PROVIDERS.map((provider) => (
                  <TouchableOpacity
                    key={provider.id}
                    onPress={() => setSelectedProvider(provider.id)}
                    className={cn(
                      "px-4 py-3 rounded-lg border gap-1",
                      selectedProvider === provider.id
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <Text className="text-lg">{provider.icon}</Text>
                    <Text
                      className={cn(
                        "text-xs font-semibold",
                        selectedProvider === provider.id
                          ? "text-background"
                          : "text-foreground"
                      )}
                    >
                      {provider.name.split(" ")[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Selected Provider Details */}
            {selectedProvider && (
              <View className="bg-background rounded-lg p-3 gap-1">
                <Text className="text-xs font-semibold text-muted">
                  {PROVIDERS.find((p) => p.id === selectedProvider)?.description}
                </Text>
              </View>
            )}

            {/* API Key Input */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">API Key</Text>
              <TextInput
                placeholder={
                  selectedProvider
                    ? PROVIDERS.find((p) => p.id === selectedProvider)?.placeholder
                    : "Select a provider first"
                }
                placeholderTextColor={colors.muted}
                value={apiKeyInput}
                onChangeText={setApiKeyInput}
                secureTextEntry
                editable={!!selectedProvider}
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>

            {/* Model ID Input (Optional) */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                Model ID (Optional)
              </Text>
              <TextInput
                placeholder="e.g., gpt-4, claude-3-opus, llama-2-70b"
                placeholderTextColor={colors.muted}
                value={modelIdInput}
                onChangeText={setModelIdInput}
                className="bg-background border border-border rounded-lg px-4 py-3 text-foreground"
              />
            </View>

            {/* Priority Input */}
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-foreground">Priority</Text>
                <Text className="text-lg font-bold text-primary">{priorityInput}</Text>
              </View>
              <View className="flex-row gap-2">
                {[1, 3, 5, 7, 9, 10].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    onPress={() => setPriorityInput(priority.toString())}
                    className={cn(
                      "flex-1 py-2 rounded-lg border",
                      priorityInput === priority.toString()
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    )}
                  >
                    <Text
                      className={cn(
                        "text-center font-semibold text-xs",
                        priorityInput === priority.toString()
                          ? "text-background"
                          : "text-foreground"
                      )}
                    >
                      {priority}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Add Button */}
            <TouchableOpacity
              onPress={addAPIKey}
              disabled={loading || !selectedProvider}
              className={cn(
                "bg-primary rounded-lg py-3 items-center justify-center",
                (loading || !selectedProvider) && "opacity-50"
              )}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-bold">Add API Key</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Active API Keys List */}
          {apiKeys.length > 0 && (
            <View className="gap-3">
              <Text className="text-lg font-bold text-foreground">
                Active API Keys ({apiKeys.filter((k) => k.isActive).length})
              </Text>

              {apiKeys.map((key) => (
                <View
                  key={key.id}
                  className="bg-surface border border-border rounded-lg p-4 gap-3"
                >
                  {/* Header */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2 flex-1">
                      <Text className="text-2xl">
                        {PROVIDERS.find((p) => p.id === key.provider)?.icon}
                      </Text>
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">
                          {PROVIDERS.find((p) => p.id === key.provider)?.name}
                        </Text>
                        <Text className="text-xs text-muted">{key.masked}</Text>
                      </View>
                    </View>
                    <Switch
                      value={key.isActive}
                      onValueChange={() => toggleAPIKeyStatus(key.id)}
                    />
                  </View>

                  {/* Details */}
                  <View className="gap-2 bg-background rounded-lg p-3">
                    {key.modelId && (
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Model:</Text>
                        <Text className="text-xs font-semibold text-foreground">
                          {key.modelId}
                        </Text>
                      </View>
                    )}
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-muted">Priority:</Text>
                      <View className="flex-row gap-1">
                        {[1, 3, 5, 7, 9, 10].map((p) => (
                          <TouchableOpacity
                            key={p}
                            onPress={() => updatePriority(key.id, p)}
                            className={cn(
                              "w-6 h-6 rounded items-center justify-center",
                              key.priority === p ? "bg-primary" : "bg-border"
                            )}
                          >
                            <Text
                              className={cn(
                                "text-xs font-bold",
                                key.priority === p ? "text-background" : "text-muted"
                              )}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    {key.lastValidated && (
                      <View className="flex-row justify-between">
                        <Text className="text-xs text-muted">Validated:</Text>
                        <Text className="text-xs text-success">
                          {new Date(key.lastValidated).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Delete API Key",
                        "Are you sure?",
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => deleteAPIKey(key.id),
                          },
                        ]
                      )
                    }
                    className="bg-error/10 rounded-lg py-2 items-center border border-error"
                  >
                    <Text className="text-error font-semibold text-sm">Remove Key</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {apiKeys.length === 0 && (
            <View className="flex-1 items-center justify-center gap-4 py-12">
              <Text className="text-4xl">🔑</Text>
              <Text className="text-lg font-semibold text-foreground text-center">
                No API Keys Configured
              </Text>
              <Text className="text-sm text-muted text-center">
                Add your first API key to enable autonomous execution
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
