import { ScrollView, Text, View, Pressable, TextInput, StyleSheet, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { MODULES } from "@/lib/modules-context";
import { ALL_TOOLS } from "@/lib/tools-data";
import { useEffect, useState, useCallback, useRef } from "react";
import * as Haptics from "expo-haptics";

// ============================================================
// LIVE METRICS (simulated real-time)
// ============================================================
function useMetrics() {
  const [m, setM] = useState({
    activeNodes: 571828,
    networkLoad: 37.1,
    threatLevel: "HIGH",
    uptime: "91d 11h",
    cpu: 67,
    memory: 72,
    neuralSync: 99.8,
    firewallBypass: "ACTIVE",
    osintExtraction: "SYNCING",
    totalScans: 14892,
    breachesDetected: 47,
    payloadsDeployed: 312,
  });

  useEffect(() => {
    const iv = setInterval(() => {
      setM((prev) => ({
        ...prev,
        activeNodes: prev.activeNodes + Math.floor(Math.random() * 200 - 80),
        networkLoad: Math.max(5, Math.min(99, prev.networkLoad + (Math.random() * 6 - 3))),
        cpu: Math.max(10, Math.min(98, prev.cpu + Math.floor(Math.random() * 8 - 4))),
        memory: Math.max(30, Math.min(95, prev.memory + Math.floor(Math.random() * 4 - 2))),
        neuralSync: Math.max(98, Math.min(100, prev.neuralSync + (Math.random() * 0.4 - 0.2))),
        totalScans: prev.totalScans + Math.floor(Math.random() * 5),
        breachesDetected: prev.breachesDetected + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return m;
}

// ============================================================
// NEURAL CONSOLE LOGS
// ============================================================
function useConsole() {
  const [logs, setLogs] = useState<{ ts: string; level: string; msg: string }[]>([
    { ts: "09:30:01", level: "SYSTEM", msg: "Neural mesh synchronized with 842k nodes." },
    { ts: "09:31:45", level: "OSINT", msg: 'New breach detected: "Project_X_Internal".' },
    { ts: "09:33:12", level: "SCANNER", msg: "Port scan completed: 14,892 hosts enumerated." },
    { ts: "09:34:56", level: "QUANTUM", msg: "Quantum key distribution cycle complete." },
    { ts: "09:36:22", level: "SWARM", msg: "Zombie swarm: 312 nodes active in P2P mesh." },
  ]);

  useEffect(() => {
    const msgs = [
      "Firewall bypass: new route established via proxy chain.",
      "OSINT extraction: 47 new records from dark web sources.",
      "Payload vault: polymorphic engine generated 3 new variants.",
      "Attack console: lateral movement detected in target network.",
      "Scanner: CVE-2026-1234 matched on 12 hosts.",
      "Quantum Intel: encrypted channel established.",
      "S3 Buckets: misconfigured bucket found at target.",
      "Lazarus APT: campaign simulation phase 3 complete.",
      "BurpSuite: XSS vulnerability confirmed in target webapp.",
      "OWASP ZAP: active scan found 8 medium-risk issues.",
      "Deep Extractor: .onion service discovered and indexed.",
      "Media Forge: steganographic payload embedded successfully.",
      "Kernel Config: SELinux policy updated for stealth mode.",
      "Deployer: Docker container deployed to edge node.",
      "Solana: wallet transaction traced through 5 hops.",
    ];
    const levels = ["SYSTEM", "OSINT", "SCANNER", "QUANTUM", "SWARM", "ATTACK", "PAYLOAD", "INTEL", "DEPLOY"];

    const iv = setInterval(() => {
      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
      setLogs((prev) => [
        ...prev.slice(-20),
        {
          ts,
          level: levels[Math.floor(Math.random() * levels.length)],
          msg: msgs[Math.floor(Math.random() * msgs.length)],
        },
      ]);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return logs;
}

// ============================================================
// MAIN SCREEN
// ============================================================
export default function ControlCenterScreen() {
  const metrics = useMetrics();
  const logs = useConsole();
  const [target, setTarget] = useState("");
  const [targetLocked, setTargetLocked] = useState(false);
  const consoleRef = useRef<ScrollView>(null);

  const runningModules = MODULES.filter((m) => m.status === "RUNNING").length;
  const totalTools = ALL_TOOLS.length;
  const runningTools = ALL_TOOLS.filter((t) => t.status === "RUNNING").length;

  const haptic = useCallback((type: "light" | "medium") => {
    if (Platform.OS === "web") return;
    Haptics.impactAsync(type === "medium" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const lockTarget = useCallback(() => {
    if (!target.trim()) return;
    haptic("medium");
    setTargetLocked(true);
  }, [target, haptic]);

  const getThreatColor = (level: string) => {
    const map: Record<string, string> = { LOW: "#00ff88", MEDIUM: "#ffff00", ELEVATED: "#ff6b00", HIGH: "#ff3b5c", CRITICAL: "#ff0000" };
    return map[level] || "#00e5ff";
  };

  const getLevelColor = (level: string) => {
    const map: Record<string, string> = {
      SYSTEM: "#00ff88", OSINT: "#00e5ff", SCANNER: "#ffff00", QUANTUM: "#bf5af2",
      SWARM: "#ff00ff", ATTACK: "#ff3b5c", PAYLOAD: "#ff6b00", INTEL: "#00e5ff", DEPLOY: "#ffff00",
    };
    return map[level] || "#6b7280";
  };

  useEffect(() => {
    consoleRef.current?.scrollToEnd({ animated: true });
  }, [logs]);

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ===== HEADER ===== */}
        <View style={s.header}>
          <Text style={s.title}>WHOAMISEC PRO V8.6</Text>
          <Text style={s.subtitle}>COMMAND CENTER | {runningModules} MODULES | {runningTools}/{totalTools} TOOLS</Text>
        </View>

        {/* ===== TARGET ACQUISITION ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ TARGET ACQUISITION</Text>
          <View style={s.targetRow}>
            <TextInput
              value={target}
              onChangeText={(t) => { setTarget(t); setTargetLocked(false); }}
              placeholder="Enter target IP / domain / identifier..."
              placeholderTextColor="#4b5563"
              style={s.targetInput}
              editable={!targetLocked}
            />
            <Pressable
              onPress={lockTarget}
              style={({ pressed }) => [
                s.lockBtn,
                { backgroundColor: targetLocked ? "#ff3b5c" : pressed ? "#00cc6a" : "#00ff88" },
              ]}
            >
              <Text style={s.lockBtnText}>{targetLocked ? "LOCKED" : "LOCK_TARGET"}</Text>
            </Pressable>
          </View>
        </View>

        {/* ===== KEY METRICS ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ LIVE METRICS</Text>
          <View style={s.metricsGrid}>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>ACTIVE</Text>
              <Text style={[s.metricValue, { color: "#00ff88" }]}>{metrics.activeNodes.toLocaleString()}</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>LOAD</Text>
              <Text style={[s.metricValue, { color: "#00e5ff" }]}>{metrics.networkLoad.toFixed(1)}%</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>THREAT</Text>
              <Text style={[s.metricValue, { color: getThreatColor(metrics.threatLevel) }]}>{metrics.threatLevel}</Text>
            </View>
            <View style={s.metricCard}>
              <Text style={s.metricLabel}>UPTIME</Text>
              <Text style={[s.metricValue, { color: "#bf5af2" }]}>{metrics.uptime}</Text>
            </View>
          </View>
        </View>

        {/* ===== SYSTEM CORE STATUS ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ SYSTEM CORE STATUS</Text>
          <View style={s.coreBox}>
            {[
              { label: "CPU Usage", value: metrics.cpu, color: metrics.cpu > 80 ? "#ff3b5c" : "#00e5ff" },
              { label: "Memory Allocation", value: metrics.memory, color: metrics.memory > 85 ? "#ff3b5c" : "#00e5ff" },
              { label: "Neural Mesh Sync", value: metrics.neuralSync, color: "#00ff88" },
            ].map((item) => (
              <View key={item.label} style={{ gap: 3 }}>
                <View style={s.barLabelRow}>
                  <Text style={s.barLabel}>{item.label}</Text>
                  <Text style={[s.barValue, { color: item.color }]}>
                    {typeof item.value === "number" && item.value < 100 ? `${item.value}%` : `${item.value.toFixed(1)}%`}
                  </Text>
                </View>
                <View style={s.barBg}>
                  <View style={[s.barFill, { width: `${Math.min(item.value, 100)}%`, backgroundColor: item.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== GLOBAL OPERATIONS ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ GLOBAL OPERATIONS</Text>
          <View style={{ gap: 6 }}>
            {[
              { label: "Firewall Bypass", detail: "Target: Fortune 500 Cluster", status: metrics.firewallBypass, color: "#00ff88" },
              { label: "OSINT Extraction", detail: "Source: Dark Web Leaks", status: metrics.osintExtraction, color: "#ffff00" },
              { label: "Payload Deployment", detail: `${metrics.payloadsDeployed} payloads active`, status: "ACTIVE", color: "#ff6b00" },
              { label: "Breach Detection", detail: `${metrics.breachesDetected} breaches found`, status: "MONITORING", color: "#ff3b5c" },
            ].map((op) => (
              <View key={op.label} style={s.opRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.opLabel}>{op.label}</Text>
                  <Text style={s.opDetail}>{op.detail}</Text>
                </View>
                <View style={[s.opBadge, { backgroundColor: op.color + "20", borderColor: op.color }]}>
                  <Text style={[s.opBadgeText, { color: op.color }]}>{op.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ===== MODULE STATUS OVERVIEW ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ MODULE STATUS ({runningModules}/{MODULES.length})</Text>
          <View style={s.moduleGrid}>
            {MODULES.slice(0, 12).map((mod) => (
              <View key={mod.id} style={[s.moduleChip, { borderColor: mod.color + "60" }]}>
                <View style={[s.moduleChipDot, { backgroundColor: "#00ff88" }]} />
                <Text style={[s.moduleChipText, { color: mod.color }]} numberOfLines={1}>{mod.name}</Text>
              </View>
            ))}
            <View style={[s.moduleChip, { borderColor: "#4b5563" }]}>
              <Text style={[s.moduleChipText, { color: "#6b7280" }]}>+{MODULES.length - 12} more</Text>
            </View>
          </View>
        </View>

        {/* ===== NEURAL CONSOLE ===== */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>◆ NEURAL CONSOLE</Text>
          <View style={s.consoleBox}>
            <ScrollView ref={consoleRef} style={{ maxHeight: 180 }} nestedScrollEnabled>
              {logs.map((log, i) => (
                <Text key={i} style={s.logLine}>
                  <Text style={{ color: "#4b5563" }}>[{log.ts}] </Text>
                  <Text style={{ color: getLevelColor(log.level) }}>[{log.level}] </Text>
                  <Text style={{ color: "#9ca3af" }}>{log.msg}</Text>
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ===== QUICK STATS ===== */}
        <View style={s.section}>
          <View style={s.quickStatsRow}>
            {[
              { label: "Total Scans", value: metrics.totalScans.toLocaleString(), color: "#00e5ff" },
              { label: "Breaches", value: metrics.breachesDetected.toString(), color: "#ff3b5c" },
              { label: "Payloads", value: metrics.payloadsDeployed.toString(), color: "#ff6b00" },
            ].map((stat) => (
              <View key={stat.label} style={s.quickStatCard}>
                <Text style={s.quickStatLabel}>{stat.label}</Text>
                <Text style={[s.quickStatValue, { color: stat.color }]}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ============================================================
// STYLES
// ============================================================
const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const s = StyleSheet.create({
  header: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  title: { fontSize: 18, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  subtitle: { fontSize: 9, color: "#6b7280", fontFamily: mono, marginTop: 2 },
  section: { paddingHorizontal: 14, marginTop: 14 },
  sectionLabel: { fontSize: 11, fontWeight: "bold", color: "#00ff88", fontFamily: mono, marginBottom: 8 },
  targetRow: { flexDirection: "row", gap: 8 },
  targetInput: { flex: 1, backgroundColor: "#0d1117", color: "#e0e7ff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, fontFamily: mono, fontSize: 11 },
  lockBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, justifyContent: "center" },
  lockBtnText: { fontSize: 9, fontWeight: "bold", color: "#0a0e17", fontFamily: mono },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metricCard: { width: "47%", backgroundColor: "#0d1117", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, padding: 10 },
  metricLabel: { fontSize: 9, color: "#4b5563", fontFamily: mono, marginBottom: 4 },
  metricValue: { fontSize: 20, fontWeight: "bold", fontFamily: mono },
  coreBox: { backgroundColor: "#0d1117", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, padding: 12, gap: 10 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between" },
  barLabel: { fontSize: 10, color: "#6b7280", fontFamily: mono },
  barValue: { fontSize: 10, fontFamily: mono, fontWeight: "bold" },
  barBg: { height: 6, backgroundColor: "#1e293b", borderRadius: 3, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 3 },
  opRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#0d1117", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, padding: 10 },
  opLabel: { fontSize: 11, color: "#e0e7ff", fontFamily: mono, fontWeight: "bold" },
  opDetail: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  opBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  opBadgeText: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  moduleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  moduleChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4, borderWidth: 1, backgroundColor: "#0d1117" },
  moduleChipDot: { width: 5, height: 5, borderRadius: 3 },
  moduleChipText: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  consoleBox: { backgroundColor: "#0a0e17", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, padding: 8 },
  logLine: { fontSize: 9, fontFamily: mono, lineHeight: 15, marginBottom: 2 },
  quickStatsRow: { flexDirection: "row", gap: 8 },
  quickStatCard: { flex: 1, backgroundColor: "#0d1117", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, padding: 10, alignItems: "center" },
  quickStatLabel: { fontSize: 8, color: "#4b5563", fontFamily: mono, marginBottom: 4 },
  quickStatValue: { fontSize: 16, fontWeight: "bold", fontFamily: mono },
});
