import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

/**
 * Personal Productivity Tool Designer
 * Integrates with external AI service to create custom productivity tools
 */

interface ToolDesign {
  name: string;
  description: string;
  features: string[];
  taskManagement: boolean;
  automation: boolean;
  integration: string[];
  estimatedTime: string;
}

export default function ProductivityDesigner() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [toolName, setToolName] = useState("");
  const [requirements, setRequirements] = useState("");
  const [generatedTool, setGeneratedTool] = useState<ToolDesign | null>(null);
  const [activeTab, setActiveTab] = useState<"designer" | "preview">("designer");

  /**
   * Generate tool design using AI service
   */
  const generateToolDesign = async () => {
    if (!toolName.trim() || !requirements.trim()) {
      alert("Please fill in tool name and requirements");
      return;
    }

    setLoading(true);
    try {
      // Call external AI service
      const response = await fetch(
        "https://ais-dev-s7gdrealk6zdl4h3qlhzkp-163936943376.europe-west1.run.app/api/design-tool",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            toolName,
            requirements,
            taskManagement: true,
            type: "productivity",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate tool design");
      }

      const design = await response.json();
      setGeneratedTool(design);
      setActiveTab("preview");
    } catch (error) {
      console.error("Error generating tool:", error);
      alert("Failed to generate tool design. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deploy generated tool
   */
  const deployTool = async () => {
    if (!generatedTool) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://ais-dev-s7gdrealk6zdl4h3qlhzkp-163936943376.europe-west1.run.app/api/deploy-tool",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(generatedTool),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to deploy tool");
      }

      alert("Tool deployed successfully!");
      setToolName("");
      setRequirements("");
      setGeneratedTool(null);
      setActiveTab("designer");
    } catch (error) {
      console.error("Error deploying tool:", error);
      alert("Failed to deploy tool. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">
              🛠️ Productivity Tool Designer
            </Text>
            <Text className="text-base text-muted">
              Create your personal productivity tool with AI assistance
            </Text>
          </View>

          {/* Tabs */}
          <View className="flex-row gap-2 border-b border-border pb-2">
            <TouchableOpacity
              onPress={() => setActiveTab("designer")}
              className={cn(
                "px-4 py-2 rounded-lg",
                activeTab === "designer" ? "bg-primary" : "bg-surface"
              )}
            >
              <Text
                className={cn(
                  "font-semibold",
                  activeTab === "designer" ? "text-background" : "text-foreground"
                )}
              >
                Designer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("preview")}
              className={cn(
                "px-4 py-2 rounded-lg",
                activeTab === "preview" ? "bg-primary" : "bg-surface"
              )}
            >
              <Text
                className={cn(
                  "font-semibold",
                  activeTab === "preview" ? "text-background" : "text-foreground"
                )}
              >
                Preview
              </Text>
            </TouchableOpacity>
          </View>

          {/* Designer Tab */}
          {activeTab === "designer" && (
            <View className="gap-4">
              {/* Tool Name Input */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Tool Name</Text>
                <TextInput
                  placeholder="e.g., Task Sync Pro, Focus Timer, Daily Planner"
                  placeholderTextColor={colors.muted}
                  value={toolName}
                  onChangeText={setToolName}
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                />
              </View>

              {/* Requirements Input */}
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Requirements</Text>
                <TextInput
                  placeholder="Describe what you want your tool to do..."
                  placeholderTextColor={colors.muted}
                  value={requirements}
                  onChangeText={setRequirements}
                  multiline
                  numberOfLines={6}
                  className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              {/* Features Checklist */}
              <View className="gap-3">
                <Text className="text-sm font-semibold text-foreground">Features</Text>

                <View className="flex-row items-center gap-3 bg-surface p-3 rounded-lg border border-border">
                  <View className="w-5 h-5 bg-primary rounded" />
                  <Text className="text-foreground flex-1">Task Management</Text>
                </View>

                <View className="flex-row items-center gap-3 bg-surface p-3 rounded-lg border border-border">
                  <View className="w-5 h-5 bg-primary rounded" />
                  <Text className="text-foreground flex-1">Automation</Text>
                </View>

                <View className="flex-row items-center gap-3 bg-surface p-3 rounded-lg border border-border">
                  <View className="w-5 h-5 bg-primary rounded" />
                  <Text className="text-foreground flex-1">Real-time Sync</Text>
                </View>
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                onPress={generateToolDesign}
                disabled={loading}
                className={cn(
                  "bg-primary rounded-lg py-4 items-center justify-center",
                  loading && "opacity-50"
                )}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-bold text-lg">Generate Tool Design</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && generatedTool && (
            <View className="gap-4">
              {/* Tool Preview */}
              <View className="bg-surface border border-border rounded-lg p-4 gap-3">
                <Text className="text-2xl font-bold text-foreground">{generatedTool.name}</Text>
                <Text className="text-base text-muted">{generatedTool.description}</Text>

                {/* Features */}
                <View className="gap-2">
                  <Text className="text-sm font-semibold text-foreground">Features:</Text>
                  {generatedTool.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center gap-2">
                      <View className="w-2 h-2 bg-primary rounded-full" />
                      <Text className="text-foreground">{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Integrations */}
                {generatedTool.integration.length > 0 && (
                  <View className="gap-2">
                    <Text className="text-sm font-semibold text-foreground">Integrations:</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {generatedTool.integration.map((integration, index) => (
                        <View
                          key={index}
                          className="bg-primary rounded-full px-3 py-1"
                        >
                          <Text className="text-background text-xs font-semibold">
                            {integration}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Estimated Time */}
                <View className="bg-background rounded-lg p-3 flex-row items-center justify-between">
                  <Text className="text-foreground font-semibold">Estimated Build Time:</Text>
                  <Text className="text-primary font-bold">{generatedTool.estimatedTime}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setActiveTab("designer")}
                  className="flex-1 bg-surface border border-border rounded-lg py-3 items-center"
                >
                  <Text className="text-foreground font-semibold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={deployTool}
                  disabled={loading}
                  className={cn(
                    "flex-1 bg-primary rounded-lg py-3 items-center",
                    loading && "opacity-50"
                  )}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text className="text-background font-bold">Deploy Tool</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Empty State */}
          {activeTab === "preview" && !generatedTool && (
            <View className="flex-1 items-center justify-center gap-4">
              <Text className="text-lg text-muted text-center">
                Generate a tool design to see preview
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
