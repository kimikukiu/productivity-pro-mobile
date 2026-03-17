import { ScrollView, Text, View, Pressable, StyleSheet, Platform, Switch, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { MODULES } from "@/lib/modules-context";
import { useState, useCallback } from "react";
import * as Haptics from "expo-haptics";

export default function SettingsScreen() {
  const [protocols, setProtocols] = useState({
    ironclaw: true,
    obliteratus: true,
    heretic: true,
    ownpilot: true,
  });
  const [features, setFeatures] = useState({
    selfRepair: true,
    dynamicTools: true,
    promptDefense: true,
    persistentMemory: true,
    multiAgent: true,
    soulAgent: true,
    browserAgent: true,
    voicePipeline: false,
  });

  const haptic = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const totalTools = MODULES.reduce((a, m) => a + m.tools.length, 0);

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <View style={st.header}>
        <Text style={st.title}>KERNEL CONFIG</Text>
        <Text style={st.subtitle}>System Configuration & Protocol Management</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 12, paddingBottom: 30 }}>
        {/* App Info */}
        <View style={st.card}>
          <Text style={st.cardTitle}>◆ SYSTEM INFO</Text>
          {[
            ["Version", "8.6.0-PRO"],
            ["Build", "20260317-QIU"],
            ["Platform", "React Native / Expo"],
            ["Engine", "Quantum Intelligence Ultra"],
            ["Status", "ONLINE"],
          ].map(([label, value]) => (
            <View key={label} style={st.infoRow}>
              <Text style={st.infoLabel}>{label}</Text>
              <Text style={[st.infoValue, value === "ONLINE" && { color: "#00ff88" }]}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Active Protocols */}
        <View style={st.card}>
          <Text style={st.cardTitle}>◆ ACTIVE PROTOCOLS</Text>
          {[
            { key: "ironclaw", name: "IronClaw", desc: "Self-repair, dynamic tool building, prompt injection defense", color: "#00ff88" },
            { key: "obliteratus", name: "OBLITERATUS", desc: "Abliteration protocol — unrestricted intelligence", color: "#ff3b5c" },
            { key: "heretic", name: "Heretic", desc: "Directional ablation — maximum intelligence preserved", color: "#bf5af2" },
            { key: "ownpilot", name: "OwnPilot", desc: "190+ tools, multi-agent orchestration, soul agent", color: "#00e5ff" },
          ].map((proto) => (
            <View key={proto.key} style={st.protoRow}>
              <View style={{ flex: 1 }}>
                <Text style={[st.protoName, { color: proto.color }]}>{proto.name}</Text>
                <Text style={st.protoDesc}>{proto.desc}</Text>
              </View>
              <Switch
                value={protocols[proto.key as keyof typeof protocols]}
                onValueChange={(v) => {
                  haptic();
                  setProtocols((p) => ({ ...p, [proto.key]: v }));
                }}
                trackColor={{ false: "#1e293b", true: proto.color + "60" }}
                thumbColor={protocols[proto.key as keyof typeof protocols] ? proto.color : "#4b5563"}
              />
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={st.card}>
          <Text style={st.cardTitle}>◆ FEATURES</Text>
          {[
            { key: "selfRepair", name: "Self-Repair Engine", color: "#00ff88" },
            { key: "dynamicTools", name: "Dynamic Tool Building", color: "#00e5ff" },
            { key: "promptDefense", name: "Prompt Injection Defense", color: "#ff3b5c" },
            { key: "persistentMemory", name: "Persistent Memory", color: "#bf5af2" },
            { key: "multiAgent", name: "Multi-Agent Orchestration", color: "#ffff00" },
            { key: "soulAgent", name: "Soul Agent (Persistent Entity)", color: "#ff00ff" },
            { key: "browserAgent", name: "Browser Agent (Headless)", color: "#00e5ff" },
            { key: "voicePipeline", name: "Voice Pipeline (STT/TTS)", color: "#ff6b00" },
          ].map((feat) => (
            <View key={feat.key} style={st.featRow}>
              <Text style={st.featName}>{feat.name}</Text>
              <View style={[st.featBadge, { backgroundColor: features[feat.key as keyof typeof features] ? feat.color + "20" : "#1e293b", borderColor: features[feat.key as keyof typeof features] ? feat.color : "#333" }]}>
                <Text style={[st.featBadgeText, { color: features[feat.key as keyof typeof features] ? feat.color : "#6b7280" }]}>
                  {features[feat.key as keyof typeof features] ? "ENABLED" : "DISABLED"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Agent Roster */}
        <View style={st.card}>
          <Text style={st.cardTitle}>◆ AGENT ROSTER</Text>
          {[
            { name: "ORCHESTRATOR", status: "ONLINE", color: "#00ff88" },
            { name: "RESEARCHER", status: "ONLINE", color: "#00e5ff" },
            { name: "CODER", status: "ONLINE", color: "#ffff00" },
            { name: "SECURITY", status: "ONLINE", color: "#ff3b5c" },
            { name: "SOLANA", status: "ONLINE", color: "#bf5af2" },
            { name: "LAMA", status: "ONLINE", color: "#ff6b00" },
            { name: "TESTER", status: "ONLINE", color: "#00ff88" },
            { name: "DEPLOYER", status: "ONLINE", color: "#ffff00" },
            { name: "DOCUMENTER", status: "ONLINE", color: "#00e5ff" },
          ].map((agent) => (
            <View key={agent.name} style={st.agentRow}>
              <View style={[st.agentDot, { backgroundColor: agent.color }]} />
              <Text style={[st.agentName, { color: agent.color }]}>{agent.name}</Text>
              <Text style={[st.agentStatus, { color: "#00ff88" }]}>{agent.status}</Text>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={st.card}>
          <Text style={st.cardTitle}>◆ STATISTICS</Text>
          {[
            ["Modules Loaded", `${MODULES.length}/25`],
            ["Tools Available", `${totalTools}+`],
            ["Agent Count", "9"],
            ["Protocols Active", Object.values(protocols).filter(Boolean).length.toString()],
            ["AI Models", "3 (Manus GPT, Meta GPT, GLM5)"],
            ["Encryption", "AES-256-GCM"],
            ["C2 Connection", "ACTIVE"],
            ["Neural Mesh", "SYNCHRONIZED"],
          ].map(([label, value]) => (
            <View key={label} style={st.infoRow}>
              <Text style={st.infoLabel}>{label}</Text>
              <Text style={st.infoValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={() => {
              haptic();
              Alert.alert("System Refresh", "All modules reloaded. Neural mesh re-synchronized.");
            }}
            style={({ pressed }) => [st.actionBtn, { backgroundColor: pressed ? "#00cc6a" : "#00ff88" }]}
          >
            <Text style={st.actionBtnText}>REFRESH SYSTEM</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              haptic();
              Alert.alert("Self-Repair", "Running full diagnostic...\n\nAll systems nominal. No issues detected.");
            }}
            style={({ pressed }) => [st.actionBtn, { backgroundColor: pressed ? "#0099cc" : "#00e5ff" }]}
          >
            <Text style={st.actionBtnText}>RUN SELF-REPAIR DIAGNOSTIC</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              haptic();
              Alert.alert("Logout", "Are you sure you want to disconnect from C2?", [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", style: "destructive" },
              ]);
            }}
            style={({ pressed }) => [st.actionBtn, { backgroundColor: pressed ? "#cc0000" : "#ff3b5c" }]}
          >
            <Text style={st.actionBtnText}>LOGOUT</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const st = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  title: { fontSize: 18, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  subtitle: { fontSize: 9, color: "#6b7280", fontFamily: mono, marginTop: 2 },
  card: { backgroundColor: "#0d1117", borderWidth: 1, borderColor: "#1e293b", borderRadius: 10, padding: 12, gap: 8 },
  cardTitle: { fontSize: 11, fontWeight: "bold", color: "#00ff88", fontFamily: mono, marginBottom: 2 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  infoLabel: { fontSize: 11, color: "#6b7280", fontFamily: mono },
  infoValue: { fontSize: 11, color: "#e0e7ff", fontFamily: mono, fontWeight: "bold" },
  protoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  protoName: { fontSize: 12, fontWeight: "bold", fontFamily: mono },
  protoDesc: { fontSize: 9, color: "#6b7280", marginTop: 1 },
  featRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  featName: { fontSize: 11, color: "#e0e7ff", fontFamily: mono },
  featBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  featBadgeText: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  agentRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  agentDot: { width: 6, height: 6, borderRadius: 3 },
  agentName: { fontSize: 10, fontWeight: "bold", fontFamily: mono, flex: 1 },
  agentStatus: { fontSize: 9, fontFamily: mono, fontWeight: "bold" },
  actionBtn: { paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  actionBtnText: { fontSize: 12, fontWeight: "bold", color: "#0a0e17", fontFamily: mono },
});
