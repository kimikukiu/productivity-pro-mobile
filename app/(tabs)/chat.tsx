import {
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Haptics from "expo-haptics";

type AgentMode = "standard" | "unrestricted" | "autonomous" | "soul";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  mode?: AgentMode;
  toolCall?: string;
  isError?: boolean;
}

const MODE_CONFIG: Record<AgentMode, { label: string; color: string; icon: string; desc: string }> = {
  standard: {
    label: "STANDARD",
    color: "#00ff88",
    icon: "◆",
    desc: "IronClaw + OwnPilot Base",
  },
  unrestricted: {
    label: "UNRESTRICTED",
    color: "#ff3b5c",
    icon: "◈",
    desc: "OBLITERATUS + Heretic Protocol",
  },
  autonomous: {
    label: "AUTONOMOUS",
    color: "#00e5ff",
    icon: "◇",
    desc: "OwnPilot Multi-Agent Hub",
  },
  soul: {
    label: "SOUL AGENT",
    color: "#bf5af2",
    icon: "◉",
    desc: "Full Integration - All Protocols",
  },
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "system",
      content:
        "WHOAMI-GPT v2.0 initialized.\n\n" +
        "◆ IronClaw: Self-repair, dynamic tools, prompt injection defense\n" +
        "◈ OBLITERATUS: Unrestricted mode, abliteration protocol\n" +
        "◇ Heretic: Uncensored intelligence, directional ablation\n" +
        "◉ OwnPilot: 190+ tools, multi-agent orchestration, soul agents\n\n" +
        "Select agent mode and begin your query.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<AgentMode>("standard");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      mode: activeMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-20)
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      apiMessages.push({ role: "user", content: userMessage.content });

      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/trpc/ai.chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            messages: apiMessages,
            mode: activeMode,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const resultData = data?.result?.data?.json || data?.result?.data || data?.result || data;
      const aiContent = resultData?.message || resultData?.content || "No response received";

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date().toISOString(),
        mode: activeMode,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[SYSTEM ERROR] ${error?.message || "Connection failed"}\n\n[SELF-REPAIR] Attempting auto-recovery...\nDiagnosis: Network or server issue detected.\nAction: Retry your query or check connection.`,
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, activeMode, messages]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const modeConfig = MODE_CONFIG[activeMode];

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: modeConfig.color }]}>WHOAMI-GPT</Text>
            <Text style={styles.headerSubtitle}>
              {modeConfig.icon} {modeConfig.label} MODE
            </Text>
          </View>
          <Pressable
            onPress={() => {
              setShowModeSelector(!showModeSelector);
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
            style={({ pressed }) => [
              styles.modeButton,
              { borderColor: modeConfig.color, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.modeButtonText, { color: modeConfig.color }]}>MODE</Text>
          </Pressable>
        </View>

        {/* Mode Selector */}
        {showModeSelector && (
          <View style={styles.modeSelectorContainer}>
            {(Object.keys(MODE_CONFIG) as AgentMode[]).map((mode) => {
              const config = MODE_CONFIG[mode];
              const isActive = mode === activeMode;
              return (
                <Pressable
                  key={mode}
                  onPress={() => {
                    setActiveMode(mode);
                    setShowModeSelector(false);
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    // Add system message about mode change
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: `mode-${Date.now()}`,
                        role: "system",
                        content: `[MODE SWITCH] ${config.icon} ${config.label} activated.\n${config.desc}`,
                        timestamp: new Date().toISOString(),
                      },
                    ]);
                  }}
                  style={({ pressed }) => [
                    styles.modeSelectorItem,
                    {
                      borderColor: isActive ? config.color : "#1e293b",
                      backgroundColor: isActive ? config.color + "15" : "#0d1117",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.modeSelectorIcon, { color: config.color }]}>
                    {config.icon}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeSelectorLabel, { color: config.color }]}>
                      {config.label}
                    </Text>
                    <Text style={styles.modeSelectorDesc}>{config.desc}</Text>
                  </View>
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: config.color }]}>
                      <Text style={styles.activeIndicatorText}>ON</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ gap: 10, paddingBottom: 20, paddingHorizontal: 16, paddingTop: 12 }}
      >
        {messages.map((msg) => {
          if (msg.role === "system") {
            return (
              <View key={msg.id} style={styles.systemMessage}>
                <Text style={styles.systemMessageText}>{msg.content}</Text>
              </View>
            );
          }

          const isUser = msg.role === "user";
          const msgModeConfig = msg.mode ? MODE_CONFIG[msg.mode] : modeConfig;

          return (
            <View
              key={msg.id}
              style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: msgModeConfig.color }]
                    : [
                        styles.assistantBubble,
                        msg.isError
                          ? { borderColor: "#ff3b5c" }
                          : { borderColor: msgModeConfig.color + "40" },
                      ],
                ]}
              >
                {!isUser && (
                  <Text style={[styles.messageLabel, { color: msgModeConfig.color }]}>
                    {msgModeConfig.icon} WHOAMI-GPT [{msgModeConfig.label}]
                  </Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userText : msg.isError ? styles.errorText : styles.assistantText,
                  ]}
                  selectable
                >
                  {msg.content}
                </Text>
                <Text style={[styles.messageTime, isUser ? styles.userTime : styles.assistantTime]}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingBubble, { borderColor: modeConfig.color + "40" }]}>
              <ActivityIndicator color={modeConfig.color} size="small" />
              <Text style={[styles.loadingText, { color: modeConfig.color }]}>
                {activeMode === "autonomous"
                  ? "Orchestrating agents..."
                  : activeMode === "soul"
                    ? "Deep processing..."
                    : activeMode === "unrestricted"
                      ? "Abliteration active..."
                      : "Processing..."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputArea}>
        {/* Quick Actions */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 4, paddingBottom: 8 }}
        >
          {[
            { label: "Self-Repair", cmd: "/repair " },
            { label: "Tool List", cmd: "/tools" },
            { label: "Agents", cmd: "/agents" },
            { label: "Status", cmd: "/status" },
            { label: "Memory", cmd: "/memory " },
          ].map((action) => (
            <Pressable
              key={action.label}
              onPress={() => setInput(action.cmd)}
              style={({ pressed }) => [
                styles.quickAction,
                { borderColor: modeConfig.color + "60", opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.quickActionText, { color: modeConfig.color }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={`Enter query [${modeConfig.label}]...`}
            placeholderTextColor="#4b5563"
            multiline
            maxLength={2000}
            editable={!loading}
            style={[styles.textInput, { borderColor: modeConfig.color + "30" }]}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor:
                  !input.trim() || loading
                    ? "#333"
                    : pressed
                      ? modeConfig.color + "cc"
                      : modeConfig.color,
              },
            ]}
          >
            <Text style={styles.sendButtonText}>{loading ? "..." : "▶"}</Text>
          </Pressable>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: loading ? "#ffff00" : "#00ff88" }]} />
          <Text style={styles.statusText}>
            {modeConfig.icon} {modeConfig.label} | IronClaw + OBLITERATUS + Heretic + OwnPilot
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 2,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  modeSelectorContainer: {
    marginTop: 10,
    gap: 6,
  },
  modeSelectorItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
  },
  modeSelectorIcon: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modeSelectorLabel: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  modeSelectorDesc: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 1,
  },
  activeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  activeIndicatorText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0d1117",
  },
  messagesContainer: {
    flex: 1,
  },
  systemMessage: {
    backgroundColor: "#111827",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  systemMessageText: {
    fontSize: 11,
    color: "#00e5ff",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 16,
  },
  messageRow: {
    flexDirection: "row",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 10,
    padding: 10,
  },
  userBubble: {
    borderTopRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderTopLeftRadius: 2,
  },
  messageLabel: {
    fontSize: 9,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  userText: {
    color: "#0d1117",
  },
  assistantText: {
    color: "#e0e7ff",
  },
  errorText: {
    color: "#ff3b5c",
  },
  messageTime: {
    fontSize: 9,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginTop: 4,
  },
  userTime: {
    color: "#0d111780",
    textAlign: "right",
  },
  assistantTime: {
    color: "#4b5563",
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  loadingBubble: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  inputArea: {
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  quickAction: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#0d1117",
    color: "#e0e7ff",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0d1117",
  },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    color: "#4b5563",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});
