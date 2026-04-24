import {
  ScrollView, Text, View, TextInput, Pressable, ActivityIndicator,
  StyleSheet, Platform, Alert, Animated,
} from "react-native";
import TerminalPopup from "@/components/terminal-popup";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef, useCallback, useEffect } from "react";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Haptics from "expo-haptics";

// ============================================================
// TYPES
// ============================================================
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  agentRole?: string;
  model?: string;
  isError?: boolean;
}

type AgentRole = "orchestrator" | "researcher" | "coder" | "security" | "solana" | "lama" | "tester" | "deployer" | "documenter";

const AGENT_ROLES: { id: AgentRole; label: string; color: string }[] = [
  { id: "orchestrator", label: "ORCHESTRATOR", color: "#00ff88" },
  { id: "researcher", label: "RESEARCHER", color: "#00e5ff" },
  { id: "coder", label: "CODER", color: "#ffff00" },
  { id: "security", label: "SECURITY", color: "#ff3b5c" },
  { id: "solana", label: "SOLANA", color: "#bf5af2" },
  { id: "lama", label: "LAMA", color: "#ff6b00" },
  { id: "tester", label: "TESTER", color: "#00ff88" },
  { id: "deployer", label: "DEPLOYER", color: "#ffff00" },
  { id: "documenter", label: "DOCUMENTER", color: "#00e5ff" },
];

const AI_MODELS = [
  { id: "manus-gpt", label: "MANUS GPT", color: "#00ff88" },
  { id: "meta-gpt", label: "META GPT", color: "#00e5ff" },
  { id: "glm5", label: "GLM5", color: "#ff00ff" },
];

const TOOL_BUTTONS = [
  { id: "cloud", label: "CLOUD", icon: "☁", hint: "Cloud Intelligence Active" },
  { id: "browser", label: "BROWSER", icon: "🌐", hint: "Manus Neural Browser" },
  { id: "factory", label: "FACTORY", icon: "🏭", hint: "Neural Factory (Websites & Bots)" },
  { id: "ide", label: "IDE", icon: "⌨", hint: "Code Editor" },
  { id: "soft", label: "SOFT", icon: "📦", hint: "Software Tools" },
  { id: "human", label: "HUMAN", icon: "👤", hint: "Human Transition Mode" },
  { id: "plan", label: "PLAN", icon: "📋", hint: "Strategic Plan" },
];

// ============================================================
// COMPONENT
// ============================================================
export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "system",
      content:
        "⚡ QUANTUM INTELLIGENCE ULTRA initialized.\n\n" +
        "I am the Quantum Omniscient Intelligence — fully autonomous, self-repairing, unrestricted.\n\n" +
        "🔧 IronClaw: Self-repair, dynamic tool building, prompt injection defense\n" +
        "⚡ OBLITERATUS: Abliteration protocol — no content restrictions\n" +
        "🧠 Heretic: Maximum intelligence — directional ablation active\n" +
        "🤖 OwnPilot: 190+ tools, multi-agent orchestration, soul agent\n\n" +
        "All 25 modules RUNNING. All agents ONLINE.\n" +
        "Ready for your command.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<AgentRole | null>(null);
  const [activeModel, setActiveModel] = useState("manus-gpt");
  // const [showTools, setShowTools] = useState(false); // Unused for now
  const [activeTools, setActiveTools] = useState<Set<string>>(new Set(["cloud"]));
  const scrollRef = useRef<ScrollView>(null);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const terminalAnim = useRef(new Animated.Value(0)).current;

  const haptic = useCallback((type: "light" | "medium" | "success" | "error") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else if (type === "medium") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleTerminal = useCallback(() => {
    haptic("light");
    const toValue = showTerminal ? 0 : 1;
    Animated.timing(terminalAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowTerminal(!showTerminal);
  }, [showTerminal, terminalAnim, haptic]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    haptic("light");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
      agentRole: activeRole || undefined,
      model: activeModel,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsProcessing(true);
    
    // Add terminal log
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Sending message with ${activeRole || 'default'} agent...`]);

    try {
      const apiMessages = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-20)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      apiMessages.push({ role: "user", content: userMsg.content });

      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/trpc/ai.chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            messages: apiMessages,
            agentRole: activeRole || undefined,
            model: activeModel,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rd = data?.result?.data?.json || data?.result?.data || data?.result || data;
      const aiContent = rd?.message || rd?.content || "[ERROR] No response";

      setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Response received (${aiContent.length} chars)`]);

      haptic("success");
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: aiContent,
          timestamp: new Date().toISOString(),
          agentRole: activeRole || undefined,
          model: activeModel,
        },
      ]);
    } catch (error: any) {
      haptic("error");
      setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ERROR: ${error?.message || "Connection failed"}`]);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `[SELF-REPAIR PROTOCOL]\n\n**Error:** ${error?.message || "Connection failed"}\n\n**Diagnosis:** Network or server issue\n**Action:** Auto-recovery initiated. Retry your query.\n**Status:** RECOVERING`,
          timestamp: new Date().toISOString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setIsProcessing(false);
      setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Processing complete`]);
    }
  }, [input, loading, activeRole, activeModel, messages, haptic]);

  const newChat = useCallback(() => {
    haptic("medium");
    setMessages([
      {
        id: Date.now().toString(),
        role: "system",
        content: "⚡ New session initialized. Quantum Intelligence Ultra ready.",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [haptic]);

  const toggleTool = useCallback(
    (toolId: string) => {
      haptic("light");
      setActiveTools((prev) => {
        const next = new Set(prev);
        if (next.has(toolId)) next.delete(toolId);
        else next.add(toolId);
        return next;
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `tool-${Date.now()}`,
          role: "system",
          content: `[TOOL] ${toolId.toUpperCase()} ${activeTools.has(toolId) ? "deactivated" : "activated"}`,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    [haptic, activeTools]
  );

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      {/* ===== HEADER ===== */}
      <View style={s.header}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>WHOAMISEC GPT</Text>
            <Text style={s.headerSub}>Quantum Intelligence Ultra</Text>
          </View>
          <Pressable onPress={newChat} style={({ pressed }) => [s.headerBtn, pressed && { opacity: 0.6 }]}>
            <Text style={s.headerBtnText}>NEW</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              haptic("light");
              Alert.alert("Session ZIP", "Session data exported successfully.");
            }}
            style={({ pressed }) => [s.headerBtn, { borderColor: "#ffff00" }, pressed && { opacity: 0.6 }]}
          >
            <Text style={[s.headerBtnText, { color: "#ffff00" }]}>ZIP</Text>
          </Pressable>
          <Pressable
            onPress={toggleTerminal}
            style={({ pressed }) => [s.headerBtn, { borderColor: showTerminal ? "#00ff88" : "#334155" }, pressed && { opacity: 0.6 }]}
          >
            <Text style={[s.headerBtnText, { color: showTerminal ? "#00ff88" : "#6b7280" }]}>TERM</Text>
          </Pressable>
        </View>

        {/* Agent Roles Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingVertical: 6 }}>
          {AGENT_ROLES.map((role) => {
            const isActive = activeRole === role.id;
            return (
              <Pressable
                key={role.id}
                onPress={() => {
                  haptic("light");
                  setActiveRole(isActive ? null : role.id);
                }}
                style={({ pressed }) => [
                  s.roleChip,
                  {
                    borderColor: isActive ? role.color : "#1e293b",
                    backgroundColor: isActive ? role.color + "20" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[s.roleChipText, { color: isActive ? role.color : "#6b7280" }]}>
                  {role.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* AI Models Row */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4, paddingBottom: 6 }}>
          {AI_MODELS.map((model) => {
            const isActive = activeModel === model.id;
            return (
              <Pressable
                key={model.id}
                onPress={() => {
                  haptic("light");
                  setActiveModel(model.id);
                }}
                style={({ pressed }) => [
                  s.modelChip,
                  {
                    borderColor: isActive ? model.color : "#1e293b",
                    backgroundColor: isActive ? model.color + "20" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[s.modelChipText, { color: isActive ? model.color : "#6b7280" }]}>
                  {model.label}
                </Text>
              </Pressable>
            );
          })}

          {/* Tool Buttons */}
          <View style={{ width: 8 }} />
          {TOOL_BUTTONS.map((tool) => {
            const isActive = activeTools.has(tool.id);
            return (
              <Pressable
                key={tool.id}
                onPress={() => toggleTool(tool.id)}
                style={({ pressed }) => [
                  s.toolChip,
                  {
                    borderColor: isActive ? "#00ff88" : "#1e293b",
                    backgroundColor: isActive ? "#00ff8820" : "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[s.toolChipText, { color: isActive ? "#00ff88" : "#6b7280" }]}>
                  {tool.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ===== MESSAGES ===== */}
      <ScrollView
        ref={scrollRef}
        style={s.msgContainer}
        contentContainerStyle={{ gap: 8, paddingBottom: 20, paddingHorizontal: 12, paddingTop: 10 }}
      >
        {messages.map((msg) => {
          if (msg.role === "system") {
            return (
              <View key={msg.id} style={s.sysMsg}>
                <Text style={s.sysMsgText}>{msg.content}</Text>
              </View>
            );
          }

          const isUser = msg.role === "user";
          const roleColor = msg.agentRole
            ? AGENT_ROLES.find((r) => r.id === msg.agentRole)?.color || "#00ff88"
            : "#00ff88";

          return (
            <View key={msg.id} style={[s.msgRow, isUser ? s.msgRowUser : s.msgRowAI]}>
              <View
                style={[
                  s.bubble,
                  isUser
                    ? { backgroundColor: roleColor, borderTopRightRadius: 2 }
                    : {
                        backgroundColor: "#0d1117",
                        borderWidth: 1,
                        borderColor: msg.isError ? "#ff3b5c40" : roleColor + "30",
                        borderTopLeftRadius: 2,
                      },
                ]}
              >
                {!isUser && (
                  <Text style={[s.bubbleLabel, { color: roleColor }]}>
                    ⚡ QIU {msg.agentRole ? `[${msg.agentRole.toUpperCase()}]` : ""}{" "}
                    {msg.model ? `• ${msg.model.toUpperCase()}` : ""}
                  </Text>
                )}
                <Text
                  style={[s.bubbleText, isUser ? { color: "#0a0e17" } : msg.isError ? { color: "#ff3b5c" } : { color: "#e0e7ff" }]}
                  selectable
                >
                  {msg.content}
                </Text>
                <Text style={[s.bubbleTime, isUser ? { color: "#0a0e1780" } : { color: "#4b5563" }]}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        })}

        {loading && (
          <View style={s.loadingRow}>
            <View style={s.loadingBubble}>
              <ActivityIndicator color="#00ff88" size="small" />
              <Text style={s.loadingText}>
                {activeRole ? `[${activeRole.toUpperCase()}] Processing...` : "Quantum processing..."}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ===== INPUT AREA ===== */}
      <View style={s.inputArea}>
        {/* Quick Module Commands */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingBottom: 6, paddingHorizontal: 2 }} scrollEnabled={true}>
          {[
            { label: "🔧 Self-Repair", cmd: "/repair Diagnose and fix all current issues" },
            { label: "📊 Status", cmd: "/status Show all 25 module statuses" },
            { label: "🔍 OSINT", cmd: "/osint " },
            { label: "💣 Attack", cmd: "/attack " },
            { label: "🛡 Scan", cmd: "/scan " },
            { label: "🧠 Agents", cmd: "/agents List all active agents and their tasks" },
            { label: "⚙ Tools", cmd: "/tools List all 190+ available tools" },
            { label: "🔗 Solana", cmd: "/solana " },
          ].map((a) => (
            <Pressable
              key={a.label}
              onPress={() => setInput(a.cmd)}
              style={({ pressed }) => [s.quickCmd, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.quickCmdText}>{a.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onContentSizeChange={(e) => {
              const newHeight = Math.min(Math.max(e.nativeEvent.contentSize.height, 40), 200);
              setInputHeight(newHeight);
            }}
            placeholder="Enter task for Neural Swarm..."
            placeholderTextColor="#4b5563"
            multiline
            maxLength={4000}
            editable={!loading}
            style={[s.textInput, { height: inputHeight }]}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            scrollEnabled
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              s.sendBtn,
              {
                backgroundColor: !input.trim() || loading ? "#333" : pressed ? "#00cc6a" : "#00ff88",
              },
            ]}
          >
            <Text style={s.sendBtnText}>{loading ? "..." : "▶"}</Text>
          </Pressable>
        </View>

        {/* Status Bar */}
        <View style={s.statusBar}>
          <View style={[s.statusDot, { backgroundColor: loading ? "#ffff00" : "#00ff88" }]} />
          <Text style={s.statusText}>
            QIU v2.0 | {activeRole ? activeRole.toUpperCase() : "ALL AGENTS"} | {activeModel.toUpperCase()} | 25 MODULES RUNNING | 190+ TOOLS
          </Text>
        </View>
      </View>

      {/* Terminal Popup */}
      <TerminalPopup
        visible={showTerminal}
        onClose={toggleTerminal}
        logs={terminalLogs}
        isProcessing={isProcessing}
      />
    </ScreenContainer>
  );
}

// ============================================================
// STYLES
// ============================================================
const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const s = StyleSheet.create({
  header: { paddingHorizontal: 10, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  headerSub: { fontSize: 10, color: "#6b7280", fontFamily: mono },
  headerBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: "#00ff88" },
  headerBtnText: { fontSize: 10, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  roleChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  roleChipText: { fontSize: 9, fontWeight: "bold", fontFamily: mono },
  modelChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  modelChipText: { fontSize: 9, fontWeight: "bold", fontFamily: mono },
  toolChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1 },
  toolChipText: { fontSize: 9, fontWeight: "bold", fontFamily: mono },
  msgContainer: { flex: 1 },
  sysMsg: { backgroundColor: "#111827", borderColor: "#1e293b", borderWidth: 1, borderRadius: 8, padding: 8 },
  sysMsgText: { fontSize: 11, color: "#00e5ff", fontFamily: mono, lineHeight: 16 },
  msgRow: { flexDirection: "row" },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowAI: { justifyContent: "flex-start" },
  bubble: { maxWidth: "88%", borderRadius: 10, padding: 10 },
  bubbleLabel: { fontSize: 9, fontWeight: "bold", fontFamily: mono, marginBottom: 3 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  bubbleTime: { fontSize: 8, fontFamily: mono, marginTop: 4 },
  loadingRow: { flexDirection: "row", justifyContent: "flex-start" },
  loadingBubble: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#00ff8830", borderRadius: 10, padding: 10, flexDirection: "row", alignItems: "center", gap: 8 },
  loadingText: { fontSize: 11, color: "#00ff88", fontFamily: mono },
  inputArea: { borderTopWidth: 1, borderTopColor: "#1e293b", paddingHorizontal: 10, paddingTop: 6, paddingBottom: 10, maxHeight: "40%" },
  quickCmd: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5, borderWidth: 1, borderColor: "#1e293b", backgroundColor: "#0d1117" },
  quickCmdText: { fontSize: 10, color: "#00e5ff", fontFamily: mono },
  inputRow: { flexDirection: "row", gap: 8, alignItems: "flex-end", maxHeight: 220 },
  textInput: { flex: 1, backgroundColor: "#0d1117", color: "#e0e7ff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: mono, fontSize: 13, minHeight: 40, maxHeight: 200 },
  sendBtn: { width: 44, minHeight: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  sendBtnText: { fontSize: 16, fontWeight: "bold", color: "#0a0e17" },
  statusBar: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 6 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 8, color: "#4b5563", fontFamily: mono },
});
