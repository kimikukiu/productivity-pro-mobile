import { ScrollView, Text, View, TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useState, useRef, useEffect, useCallback } from "react";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Haptics from "expo-haptics";

interface ConsoleLog {
  id: string;
  type: "command" | "success" | "info" | "warning" | "error" | "output";
  text: string;
}

const INITIAL_LOGS: ConsoleLog[] = [
  { id: "1", type: "info", text: "WHOAMI@C2:~$ Neural Console initialized. Version 8.6.0-PRO" },
  { id: "2", type: "success", text: "[SUCCESS] System initialized. Neural mesh online." },
  { id: "3", type: "info", text: "[INFO] C2 Master Session established. 25 modules loaded." },
  { id: "4", type: "info", text: "[INFO] Quantum Intelligence Ultra: ONLINE" },
  { id: "5", type: "info", text: "[INFO] IronClaw Protocol: ACTIVE | OBLITERATUS: ACTIVE | Heretic: ACTIVE | OwnPilot: ACTIVE" },
  { id: "6", type: "success", text: "[READY] Type 'help' for commands or enter any task for AI execution." },
];

const HELP_TEXT = `
Available Commands:
  help          - Show this help
  status        - System status overview
  modules       - List all 25 modules
  tools         - List all 190+ tools
  agents        - Show agent roster
  scan <target> - Run vulnerability scan
  osint <query> - OSINT lookup
  exploit <id>  - Execute exploit
  payload <type>- Generate payload
  clear         - Clear console
  
Or type any natural language command for AI execution.
`;

export default function ConsoleScreen() {
  const [logs, setLogs] = useState<ConsoleLog[]>(INITIAL_LOGS);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const haptic = useCallback((type: "light" | "medium" | "success") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.impactAsync(type === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const addLog = useCallback((type: ConsoleLog["type"], text: string) => {
    setLogs((prev) => [...prev, { id: Date.now().toString() + Math.random(), type, text }]);
  }, []);

  const executeCommand = useCallback(async () => {
    if (!input.trim() || loading) return;
    haptic("light");

    const cmd = input.trim();
    setHistory((prev) => [...prev, cmd]);
    addLog("command", `WHOAMI@C2:~$ ${cmd}`);
    setInput("");

    // Handle built-in commands
    if (cmd === "clear") {
      setLogs([]);
      return;
    }
    if (cmd === "help") {
      addLog("output", HELP_TEXT);
      return;
    }
    if (cmd === "status") {
      addLog("success", "[STATUS] All 25 modules: RUNNING");
      addLog("info", "[STATUS] Quantum Intelligence Ultra: ONLINE");
      addLog("info", "[STATUS] Active Protocols: IronClaw, OBLITERATUS, Heretic, OwnPilot");
      addLog("info", "[STATUS] Tools Available: 190+");
      addLog("info", "[STATUS] Agent Roster: 9 specialized agents");
      addLog("success", "[STATUS] System Health: OPTIMAL");
      return;
    }
    if (cmd === "modules") {
      addLog("output", "Loaded Modules (25/25 RUNNING):\n  CONTROL CENTER | QUANTUM INTEL | OSINT DASHBOARD | DEEP EXTRACTOR\n  PAYLOAD VAULT | ATTACK CONSOLE | ZXCDDOS | QUANTUM IDE\n  ZOMBIE SWARM | KIMIKUKIU REPOS | WHOAMISEC GPT | MEDIA FORGE\n  KERNEL CONFIG | GPT CHAT | IDE | SOLANA | DEPLOYER\n  QUANTUM | SCANNER | S3 BUCKETS | BLACKHAT | LAZARUS APT\n  BURPSUITE | OWASP ZAP | TERMINAL CONSOLE");
      return;
    }
    if (cmd === "agents") {
      addLog("output", "Agent Roster:\n  ORCHESTRATOR  [ONLINE] - Multi-step coordination\n  RESEARCHER    [ONLINE] - Deep web research & OSINT\n  CODER         [ONLINE] - Full-stack development\n  SECURITY      [ONLINE] - Pen testing & vuln assessment\n  SOLANA        [ONLINE] - Blockchain analysis\n  LAMA          [ONLINE] - LLM operations\n  TESTER        [ONLINE] - QA & fuzzing\n  DEPLOYER      [ONLINE] - CI/CD & infrastructure\n  DOCUMENTER    [ONLINE] - Technical writing");
      return;
    }
    if (cmd === "tools") {
      addLog("output", "Tool Namespaces (190+ tools):\n  osint.*    - Social recon, domain lookup, breach search, Shodan, Censys\n  network.*  - Port scan, service enum, traffic analysis\n  crypto.*   - Encryption, hashing, key management\n  code.*     - Edit, compile, debug, format, analyze\n  data.*     - Extract, transform, analyze, visualize\n  web.*      - Proxy, scan, fuzz, spider, inject\n  file.*     - Read, write, search, compress, encrypt\n  system.*   - Process, service, config, monitor\n  attack.*   - Exploit, pivot, escalate, persist, exfil\n  defense.*  - Firewall, IDS, hardening, audit\n  blockchain.* - Wallet, contract, token, MEV, DeFi\n  media.*    - Generate, detect, stego, EXIF");
      return;
    }

    // AI-powered command execution
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/trpc/ai.executeModule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            moduleId: "terminal-console",
            moduleName: "TERMINAL CONSOLE",
            command: cmd,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rd = data?.result?.data?.json || data?.result?.data || data?.result || data;
      const output = rd?.output || "Command executed.";
      haptic("success");
      addLog("output", output);
    } catch (error: any) {
      addLog("error", `[ERROR] ${error?.message || "Execution failed"}`);
      addLog("warning", "[SELF-REPAIR] Attempting recovery...");
    } finally {
      setLoading(false);
    }
  }, [input, loading, haptic, addLog]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  const getColor = (type: ConsoleLog["type"]) => {
    const map: Record<string, string> = {
      command: "#e0e7ff", success: "#00ff88", info: "#00e5ff",
      warning: "#ffff00", error: "#ff3b5c", output: "#9ca3af",
    };
    return map[type] || "#6b7280";
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={st.header}>
        <Text style={st.title}>[ TERMINAL_CONSOLE ]</Text>
        <Text style={st.subtitle}>C2_MASTER_SESSION | QIU ACTIVE | 25 MODULES</Text>
      </View>

      {/* Console Output */}
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 10, paddingBottom: 20 }}>
        {logs.map((log) => (
          <Text key={log.id} style={[st.logLine, { color: getColor(log.type) }]} selectable>
            {log.text}
          </Text>
        ))}
        {loading && (
          <View style={st.loadingRow}>
            <ActivityIndicator color="#00ff88" size="small" />
            <Text style={st.loadingText}>Executing...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={st.inputArea}>
        <View style={st.inputRow}>
          <Text style={st.prompt}>WHOAMI@C2:~$</Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Enter command..."
            placeholderTextColor="#4b5563"
            style={st.textInput}
            onSubmitEditing={executeCommand}
            returnKeyType="send"
            editable={!loading}
          />
          <Pressable
            onPress={executeCommand}
            disabled={!input.trim() || loading}
            style={({ pressed }) => [
              st.execBtn,
              { backgroundColor: !input.trim() || loading ? "#333" : pressed ? "#00cc6a" : "#00ff88" },
            ]}
          >
            <Text style={st.execBtnText}>EXEC</Text>
          </Pressable>
        </View>

        {/* Quick Commands */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingTop: 6 }}>
          {["help", "status", "modules", "agents", "tools", "clear"].map((cmd) => (
            <Pressable
              key={cmd}
              onPress={() => { setInput(cmd); haptic("light"); }}
              style={({ pressed }) => [st.quickCmd, pressed && { opacity: 0.6 }]}
            >
              <Text style={st.quickCmdText}>{cmd}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const st = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  title: { fontSize: 16, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  subtitle: { fontSize: 9, color: "#6b7280", fontFamily: mono, marginTop: 2 },
  logLine: { fontSize: 10, fontFamily: mono, lineHeight: 16, marginBottom: 1 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  loadingText: { fontSize: 10, color: "#00ff88", fontFamily: mono },
  inputArea: { borderTopWidth: 1, borderTopColor: "#1e293b", paddingHorizontal: 10, paddingVertical: 8 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  prompt: { fontSize: 10, color: "#00ff88", fontFamily: mono, fontWeight: "bold" },
  textInput: { flex: 1, color: "#e0e7ff", fontFamily: mono, fontSize: 12, paddingVertical: 6, borderBottomColor: "#1e293b", borderBottomWidth: 1 },
  execBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 4 },
  execBtnText: { fontSize: 10, fontWeight: "bold", color: "#0a0e17", fontFamily: mono },
  quickCmd: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, borderWidth: 1, borderColor: "#1e293b", backgroundColor: "#0d1117" },
  quickCmdText: { fontSize: 9, color: "#00e5ff", fontFamily: mono },
});
