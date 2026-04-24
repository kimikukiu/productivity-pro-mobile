import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface Tool {
  name: string;
  description: string;
}

interface ToolResult {
  success: boolean;
  toolName: string;
  result: any;
  executionTime: number;
  timestamp: string;
}

export default function IntegratedToolsPanel() {
  const colors = useColors();
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ToolResult | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const response = await fetch("/api/trpc/integratedTools.list");
      const data = await response.json();
      setTools(data.result || []);
    } catch (error) {
      console.error("Failed to load tools:", error);
    }
  };

  const executeTool = async () => {
    if (!selectedTool || !input.trim()) {
      alert("Please select a tool and provide input");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/trpc/integratedTools.execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedTool,
          input: { query: input },
        }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error("Tool execution failed:", error);
      alert("Tool execution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              🔧 Integrated Tools
            </Text>
            <Text className="text-sm text-muted">
              Execute integrated repositories and tools
            </Text>
          </View>

          {/* Tool Selection */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Select Tool
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-2"
              contentContainerStyle={{ gap: 8 }}
            >
              {tools.map((tool, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setSelectedTool(tool.name)}
                  style={({ pressed }) => [
                    {
                      backgroundColor:
                        selectedTool === tool.name
                          ? colors.primary
                          : colors.surface,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                  className="px-4 py-3 rounded-lg min-w-max border border-border"
                >
                  <Text
                    className={cn(
                      "font-semibold text-sm",
                      selectedTool === tool.name
                        ? "text-background"
                        : "text-foreground"
                    )}
                  >
                    {tool.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Tool Description */}
          {selectedTool && (
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-sm text-muted">
                {tools.find((t) => t.name === selectedTool)?.description ||
                  "No description available"}
              </Text>
            </View>
          )}

          {/* Input */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Input
            </Text>
            <TextInput
              placeholder="Enter query or parameters..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-lg p-4 text-foreground"
              style={{ color: colors.foreground }}
            />
          </View>

          {/* Execute Button */}
          <Pressable
            onPress={executeTool}
            disabled={loading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            className="py-4 rounded-lg items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-background font-bold text-lg">
                Execute Tool
              </Text>
            )}
          </Pressable>

          {/* Results */}
          {result && (
            <View className="bg-surface rounded-lg p-4 border border-border gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-bold text-foreground">
                  Results
                </Text>
                <View
                  className={cn(
                    "px-3 py-1 rounded-full",
                    result.success
                      ? "bg-success/20"
                      : "bg-error/20"
                  )}
                >
                  <Text
                    className={cn(
                      "text-xs font-semibold",
                      result.success ? "text-success" : "text-error"
                    )}
                  >
                    {result.success ? "SUCCESS" : "FAILED"}
                  </Text>
                </View>
              </View>

              <View className="gap-2">
                <View>
                  <Text className="text-xs text-muted">Tool</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {result.toolName}
                  </Text>
                </View>

                <View>
                  <Text className="text-xs text-muted">Execution Time</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {result.executionTime}ms
                  </Text>
                </View>

                <View>
                  <Text className="text-xs text-muted">Timestamp</Text>
                  <Text className="text-xs text-foreground">
                    {result.timestamp}
                  </Text>
                </View>

                <View>
                  <Text className="text-xs text-muted">Result</Text>
                  <Text className="text-sm text-foreground font-mono">
                    {JSON.stringify(result.result, null, 2)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
