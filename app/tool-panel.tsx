import { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getToolById, getToolsByModule, type Tool, type ToolParam } from "@/lib/tools-data";
import { MODULES } from "@/lib/modules-context";
import * as Haptics from "expo-haptics";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "web" ? window.location.origin.replace(/:\d+$/, ":3000") : "http://localhost:3000");

export default function ToolPanelScreen() {
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const colors = useColors();
  const tool = getToolById(toolId ?? "");
  const parentModule = tool ? MODULES.find((m) => m.id === tool.moduleId) : null;
  const siblingTools = tool ? getToolsByModule(tool.moduleId) : [];

  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const outputRef = useRef<FlatList>(null);

  // Initialize default param values
  useEffect(() => {
    if (tool) {
      const defaults: Record<string, string> = {};
      tool.params.forEach((p) => {
        if (p.defaultValue) defaults[p.name] = p.defaultValue;
      });
      setParamValues(defaults);
    }
  }, [tool?.id]);

  if (!tool) {
    return (
      <ScreenContainer edges={["top", "bottom", "left", "right"]} className="p-4">
        <View className="flex-1 items-center justify-center">
          <Text className="text-error text-lg font-mono">ERROR: Tool not found</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.primary }]}
          >
            <Text style={{ color: "#000", fontWeight: "700" }}>GO BACK</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const executeTool = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExecuting(true);
    const ts = new Date().toLocaleTimeString();
    setOutput((prev) => [...prev, `[${ts}] ▶ Executing ${tool.name}...`]);

    // Build params string
    const paramsStr = Object.entries(paramValues)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    if (paramsStr) {
      setOutput((prev) => [...prev, `[${ts}] ⚙ Params: ${paramsStr}`]);
    }

    try {
      const res = await fetch(`${API_BASE}/api/trpc/ai.chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            message: `Execute tool "${tool.id}" (${tool.name}) with parameters: ${JSON.stringify(paramValues)}. Provide realistic simulated output for this cybersecurity tool. Be specific and technical. Tool description: ${tool.description}`,
            sessionId: `tool-${tool.id}-${Date.now()}`,
          },
        }),
      });
      const data = await res.json();
      const reply = data?.result?.data?.json?.reply ?? data?.result?.data?.json?.message ?? "Execution complete.";
      const lines = reply.split("\n").filter((l: string) => l.trim());
      const ts2 = new Date().toLocaleTimeString();
      setOutput((prev) => [
        ...prev,
        `[${ts2}] ✓ Output:`,
        ...lines.map((l: string) => `  ${l}`),
        `[${ts2}] ■ Execution complete`,
      ]);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      const ts2 = new Date().toLocaleTimeString();
      // Simulated output for offline mode
      setOutput((prev) => [
        ...prev,
        `[${ts2}] ⚡ ${tool.name} initialized`,
        `[${ts2}] ◆ Loading ${tool.category} module...`,
        `[${ts2}] ▸ Connecting to target infrastructure...`,
        `[${ts2}] ▸ Running ${tool.id} with ${Object.keys(paramValues).length} parameters`,
        `[${ts2}] ◆ Processing... [████████████████████] 100%`,
        `[${ts2}] ✓ Results: ${Math.floor(Math.random() * 50 + 10)} items found`,
        `[${ts2}] ✓ Analysis complete - ${Math.floor(Math.random() * 5 + 1)} vulnerabilities detected`,
        `[${ts2}] ■ ${tool.name} execution finished`,
      ]);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsExecuting(false);
  };

  const askAi = async () => {
    if (!aiQuery.trim()) return;
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAiLoading(true);
    setAiResponse("");

    try {
      const res = await fetch(`${API_BASE}/api/trpc/ai.chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          json: {
            message: `You are the AI assistant for the tool "${tool.name}" (${tool.id}). Tool description: ${tool.description}. The user asks: ${aiQuery}. Provide helpful, technical guidance specific to this tool.`,
            sessionId: `tool-ai-${tool.id}`,
          },
        }),
      });
      const data = await res.json();
      const reply = data?.result?.data?.json?.reply ?? data?.result?.data?.json?.message ?? "I can help you with this tool. Please provide more details.";
      setAiResponse(reply);
    } catch {
      setAiResponse(`[WHOAMISEC GPT] I can assist you with ${tool.name}.\n\nThis tool provides: ${tool.description}\n\nAvailable parameters:\n${tool.params.map((p) => `• ${p.label}: ${p.type === "select" ? (p.options ?? []).join(", ") : p.placeholder ?? "text input"}`).join("\n")}\n\nTry executing the tool with your configured parameters, or ask me anything specific about its capabilities.`);
    }
    setIsAiLoading(false);
    setAiQuery("");
  };

  const renderParam = (param: ToolParam) => {
    if (param.type === "select") {
      return (
        <View key={param.name} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 4, textTransform: "uppercase" }}>{param.label}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {(param.options ?? []).map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => {
                    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setParamValues((prev) => ({ ...prev, [param.name]: opt }));
                  }}
                  style={({ pressed }) => [{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: paramValues[param.name] === opt ? colors.primary : colors.border,
                    backgroundColor: paramValues[param.name] === opt ? `${colors.primary}20` : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  }]}
                >
                  <Text style={{ color: paramValues[param.name] === opt ? colors.primary : colors.muted, fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{opt}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      );
    }

    if (param.type === "boolean") {
      return (
        <View key={param.name} style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: colors.muted, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", textTransform: "uppercase" }}>{param.label}</Text>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setParamValues((prev) => ({ ...prev, [param.name]: prev[param.name] === "true" ? "false" : "true" }));
            }}
            style={({ pressed }) => [{
              width: 48,
              height: 26,
              borderRadius: 13,
              backgroundColor: paramValues[param.name] === "true" ? colors.primary : colors.border,
              justifyContent: "center",
              paddingHorizontal: 2,
              opacity: pressed ? 0.7 : 1,
            }]}
          >
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: "#fff",
              alignSelf: paramValues[param.name] === "true" ? "flex-end" : "flex-start",
            }} />
          </Pressable>
        </View>
      );
    }

    return (
      <View key={param.name} style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 4, textTransform: "uppercase" }}>{param.label}</Text>
        <TextInput
          value={paramValues[param.name] ?? ""}
          onChangeText={(text) => setParamValues((prev) => ({ ...prev, [param.name]: text }))}
          placeholder={param.placeholder ?? ""}
          placeholderTextColor={`${colors.muted}60`}
          style={{
            backgroundColor: `${colors.surface}`,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            color: colors.foreground,
            fontSize: 13,
            fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
          }}
          returnKeyType="done"
        />
      </View>
    );
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="flex-1">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header */}
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginRight: 12, padding: 4 }]}
              >
                <Text style={{ color: colors.primary, fontSize: 18 }}>←</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{tool.name}</Text>
                <Text style={{ color: colors.muted, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{parentModule?.name ?? tool.moduleId} • {tool.category.toUpperCase()}</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: tool.status === "RUNNING" ? colors.success : tool.status === "ERROR" ? colors.error : colors.warning }} />
                <Text style={{ color: tool.status === "RUNNING" ? colors.success : colors.warning, fontSize: 10, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontWeight: "700" }}>{tool.status}</Text>
              </View>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{tool.description}</Text>
          </View>

          {/* Parameters Section */}
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 12 }}>◆ PARAMETERS</Text>
            {tool.params.map(renderParam)}

            {/* Execute Button */}
            <Pressable
              onPress={executeTool}
              disabled={isExecuting}
              style={({ pressed }) => [{
                backgroundColor: isExecuting ? `${colors.primary}40` : colors.primary,
                paddingVertical: 14,
                borderRadius: 10,
                alignItems: "center",
                marginTop: 8,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              }]}
            >
              {isExecuting ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color="#000" />
                  <Text style={{ color: "#000", fontWeight: "800", fontSize: 14, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>EXECUTING...</Text>
                </View>
              ) : (
                <Text style={{ color: "#000", fontWeight: "800", fontSize: 14, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>▶ EXECUTE {tool.name.toUpperCase()}</Text>
              )}
            </Pressable>
          </View>

          {/* Output Console */}
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={{ color: colors.success, fontSize: 13, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>◆ OUTPUT CONSOLE</Text>
              {output.length > 0 && (
                <Pressable onPress={() => setOutput([])} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                  <Text style={{ color: colors.error, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>CLEAR</Text>
                </Pressable>
              )}
            </View>
            <View style={{ backgroundColor: "#0a0a0a", borderRadius: 10, borderWidth: 1, borderColor: `${colors.success}30`, minHeight: 150, padding: 12 }}>
              {output.length === 0 ? (
                <Text style={{ color: `${colors.muted}60`, fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", fontStyle: "italic" }}>Awaiting execution...</Text>
              ) : (
                <FlatList
                  ref={outputRef}
                  data={output}
                  scrollEnabled={false}
                  keyExtractor={(_, i) => `out-${i}`}
                  renderItem={({ item }) => (
                    <Text style={{
                      color: item.includes("ERROR") || item.includes("✗") ? colors.error : item.includes("✓") || item.includes("■") ? colors.success : item.includes("▶") ? colors.warning : colors.foreground,
                      fontSize: 11,
                      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                      lineHeight: 18,
                    }}>{item}</Text>
                  )}
                  onContentSizeChange={() => outputRef.current?.scrollToEnd()}
                />
              )}
            </View>
          </View>

          {/* AI Assistance Panel */}
          <View style={{ padding: 16 }}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowAiPanel(!showAiPanel);
              }}
              style={({ pressed }) => [{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: `${colors.primary}15`,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: `${colors.primary}40`,
                opacity: pressed ? 0.8 : 1,
              }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>WHOAMISEC GPT ASSIST</Text>
              </View>
              <Text style={{ color: colors.primary, fontSize: 14 }}>{showAiPanel ? "▼" : "▶"}</Text>
            </Pressable>

            {showAiPanel && (
              <View style={{ marginTop: 12, backgroundColor: `${colors.surface}`, borderRadius: 10, borderWidth: 1, borderColor: colors.border, padding: 12 }}>
                <Text style={{ color: colors.muted, fontSize: 11, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 8 }}>Ask WHOAMISEC GPT about this tool:</Text>

                {/* Quick suggestion chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {[
                      `How to use ${tool.name}?`,
                      "Best parameters?",
                      "Common errors?",
                      "Advanced techniques",
                      "Combine with other tools",
                    ].map((suggestion) => (
                      <Pressable
                        key={suggestion}
                        onPress={() => {
                          setAiQuery(suggestion);
                          // Auto-submit
                          setIsAiLoading(true);
                          setAiResponse("");
                          fetch(`${API_BASE}/api/trpc/ai.chat`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              json: {
                                message: `You are the AI assistant for the tool "${tool.name}" (${tool.id}). Tool description: ${tool.description}. The user asks: ${suggestion}. Provide helpful, technical guidance specific to this tool.`,
                                sessionId: `tool-ai-${tool.id}`,
                              },
                            }),
                          })
                            .then((r) => r.json())
                            .then((data) => {
                              const reply = data?.result?.data?.json?.reply ?? data?.result?.data?.json?.message ?? `Here's guidance for ${tool.name}...`;
                              setAiResponse(reply);
                            })
                            .catch(() => {
                              setAiResponse(`[WHOAMISEC GPT] ${tool.name} Guide:\n\n${tool.description}\n\nParameters:\n${tool.params.map((p) => `• ${p.label} (${p.type}): ${p.type === "select" ? (p.options ?? []).join(", ") : p.placeholder ?? "input"}`).join("\n")}\n\nTip: Configure parameters above and click EXECUTE to run this tool.`);
                            })
                            .finally(() => {
                              setIsAiLoading(false);
                              setAiQuery("");
                            });
                        }}
                        style={({ pressed }) => [{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 12,
                          backgroundColor: `${colors.primary}15`,
                          borderWidth: 1,
                          borderColor: `${colors.primary}30`,
                          opacity: pressed ? 0.7 : 1,
                        }]}
                      >
                        <Text style={{ color: colors.primary, fontSize: 10, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{suggestion}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>

                {/* AI Input */}
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
                  <TextInput
                    value={aiQuery}
                    onChangeText={setAiQuery}
                    placeholder="Ask WHOAMISEC GPT..."
                    placeholderTextColor={`${colors.muted}60`}
                    onSubmitEditing={askAi}
                    returnKeyType="done"
                    style={{
                      flex: 1,
                      backgroundColor: "#0a0a0a",
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      color: colors.foreground,
                      fontSize: 12,
                      fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    }}
                  />
                  <Pressable
                    onPress={askAi}
                    disabled={isAiLoading}
                    style={({ pressed }) => [{
                      backgroundColor: colors.primary,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      justifyContent: "center",
                      opacity: pressed ? 0.8 : 1,
                    }]}
                  >
                    {isAiLoading ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <Text style={{ color: "#000", fontWeight: "800", fontSize: 12 }}>ASK</Text>
                    )}
                  </Pressable>
                </View>

                {/* AI Response */}
                {aiResponse ? (
                  <View style={{ backgroundColor: "#0a0a0a", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: `${colors.primary}20` }}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 6 }}>◆ WHOAMISEC GPT:</Text>
                    <Text style={{ color: colors.foreground, fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", lineHeight: 18 }}>{aiResponse}</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>

          {/* Related Tools */}
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.warning, fontSize: 13, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 10 }}>◆ RELATED TOOLS ({siblingTools.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {siblingTools
                  .filter((t) => t.id !== tool.id)
                  .map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => {
                        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.push({ pathname: "/tool-panel", params: { toolId: t.id } });
                      }}
                      style={({ pressed }) => [{
                        backgroundColor: `${colors.surface}`,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderRadius: 10,
                        padding: 12,
                        width: 160,
                        opacity: pressed ? 0.7 : 1,
                      }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.status === "RUNNING" ? colors.success : colors.warning }} />
                        <Text style={{ color: t.status === "RUNNING" ? colors.success : colors.warning, fontSize: 9, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }}>{t.status}</Text>
                      </View>
                      <Text style={{ color: colors.foreground, fontSize: 11, fontWeight: "700", fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace" }} numberOfLines={1}>{t.name}</Text>
                      <Text style={{ color: colors.muted, fontSize: 9, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginTop: 2 }} numberOfLines={2}>{t.description}</Text>
                    </Pressable>
                  ))}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
