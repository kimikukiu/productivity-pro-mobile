import { ScrollView, Text, View, Pressable, TextInput, StyleSheet, Platform, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useModules, MODULES, type ModuleCategory } from "@/lib/modules-context";
import { useState, useCallback } from "react";
import { getApiBaseUrl } from "@/constants/oauth";
import * as Haptics from "expo-haptics";

const CATEGORIES: { id: ModuleCategory | "all"; label: string; color: string }[] = [
  { id: "all", label: "ALL", color: "#00ff88" },
  { id: "offensive", label: "OFFENSIVE", color: "#ff3b5c" },
  { id: "intel", label: "INTEL", color: "#00e5ff" },
  { id: "utility", label: "UTILITY", color: "#ffff00" },
  { id: "ai", label: "AI", color: "#bf5af2" },
  { id: "blockchain", label: "BLOCKCHAIN", color: "#00e5ff" },
  { id: "repos", label: "REPOS", color: "#ff6b00" },
];

const STATUS_COLORS: Record<string, string> = {
  RUNNING: "#00ff88",
  STANDBY: "#ffff00",
  ERROR: "#ff3b5c",
  SYNCING: "#00e5ff",
};

export default function ModulesScreen() {
  const { setActiveModule, searchModules } = useModules();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [executingModule, setExecutingModule] = useState<string | null>(null);
  const [moduleOutputs, setModuleOutputs] = useState<Record<string, string>>({});

  const filteredModules = searchQuery
    ? searchModules(searchQuery)
    : selectedCategory === "all"
      ? MODULES
      : MODULES.filter((m) => m.category === selectedCategory);

  const runningCount = MODULES.filter((m) => m.status === "RUNNING").length;
  const totalTools = MODULES.reduce((acc, m) => acc + m.tools.length, 0);

  const executeModule = useCallback(async (moduleId: string, moduleName: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setExecutingModule(moduleId);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/trpc/ai.executeModule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          json: {
            moduleId,
            moduleName,
            command: `Initialize and run ${moduleName} module. Show status, available tools, and ready state.`,
          },
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rd = data?.result?.data?.json || data?.result?.data || data?.result || data;
      setModuleOutputs((prev) => ({ ...prev, [moduleId]: rd?.output || "Module running..." }));
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      setModuleOutputs((prev) => ({
        ...prev,
        [moduleId]: `[ERROR] ${error?.message || "Failed"}\n[SELF-REPAIR] Recovering...`,
      }));
    } finally {
      setExecutingModule(null);
    }
  }, []);

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={st.header}>
        <View style={st.headerRow}>
          <Text style={st.headerTitle}>MODULES</Text>
          <View style={st.headerStats}>
            <View style={st.statBadge}>
              <View style={[st.statDot, { backgroundColor: "#00ff88" }]} />
              <Text style={st.statText}>{runningCount} RUNNING</Text>
            </View>
            <View style={st.statBadge}>
              <Text style={[st.statText, { color: "#ffff00" }]}>{totalTools} TOOLS</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search modules & tools..."
          placeholderTextColor="#4b5563"
          style={st.searchInput}
        />

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingBottom: 8 }}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => {
                  setSelectedCategory(cat.id);
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  st.catChip,
                  {
                    backgroundColor: isActive ? cat.color : "transparent",
                    borderColor: isActive ? cat.color : "#1e293b",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text style={[st.catChipText, { color: isActive ? "#0a0e17" : cat.color }]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Modules List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 20 }}>
        {filteredModules.map((module) => {
          const hasOutput = !!moduleOutputs[module.id];
          const isExecuting = executingModule === module.id;

          return (
            <View key={module.id} style={[st.moduleCard, { borderColor: module.color + "60" }]}>
              {/* Module Header */}
              <View style={st.moduleHeader}>
                <View style={{ flex: 1 }}>
                  <View style={st.moduleNameRow}>
                    <Text style={[st.moduleName, { color: module.color }]}>{module.name}</Text>
                    <View style={[st.statusBadge, { backgroundColor: STATUS_COLORS[module.status] + "20", borderColor: STATUS_COLORS[module.status] }]}>
                      <View style={[st.statusDotSmall, { backgroundColor: STATUS_COLORS[module.status] }]} />
                      <Text style={[st.statusLabel, { color: STATUS_COLORS[module.status] }]}>{module.status}</Text>
                    </View>
                  </View>
                  <Text style={st.moduleDesc}>{module.description}</Text>
                </View>
              </View>

              {/* Tools & Commands */}
              <View style={st.moduleTools}>
                <Text style={st.toolsLabel}>TOOLS: {module.tools.length}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
                  {module.tools.slice(0, 4).map((tool) => (
                    <View key={tool} style={[st.toolTag, { borderColor: module.color + "40" }]}>
                      <Text style={[st.toolTagText, { color: module.color }]}>{tool}</Text>
                    </View>
                  ))}
                  {module.tools.length > 4 && (
                    <View style={[st.toolTag, { borderColor: "#4b5563" }]}>
                      <Text style={[st.toolTagText, { color: "#6b7280" }]}>+{module.tools.length - 4}</Text>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Execute Button */}
              <View style={st.moduleActions}>
                <Pressable
                  onPress={() => executeModule(module.id, module.name)}
                  disabled={isExecuting}
                  style={({ pressed }) => [
                    st.execBtn,
                    {
                      backgroundColor: isExecuting ? "#333" : pressed ? module.color + "cc" : module.color,
                    },
                  ]}
                >
                  <Text style={st.execBtnText}>{isExecuting ? "RUNNING..." : "▶ EXECUTE"}</Text>
                </Pressable>
                <View style={[st.catBadge, { backgroundColor: module.color + "15", borderColor: module.color + "40" }]}>
                  <Text style={[st.catBadgeText, { color: module.color }]}>{module.category.toUpperCase()}</Text>
                </View>
              </View>

              {/* Output */}
              {hasOutput && (
                <View style={st.outputBox}>
                  <Text style={st.outputText} selectable>{moduleOutputs[module.id]}</Text>
                </View>
              )}
            </View>
          );
        })}

        {filteredModules.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: "#6b7280", fontFamily: mono }}>No modules found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const st = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  headerStats: { flexDirection: "row", gap: 8 },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statText: { fontSize: 9, color: "#00ff88", fontFamily: mono, fontWeight: "bold" },
  searchInput: { backgroundColor: "#0d1117", color: "#e0e7ff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: mono, fontSize: 12, marginBottom: 8 },
  catChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1 },
  catChipText: { fontSize: 9, fontWeight: "bold", fontFamily: mono },
  moduleCard: { backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 10, padding: 12, gap: 8 },
  moduleHeader: { flexDirection: "row", alignItems: "flex-start" },
  moduleNameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  moduleName: { fontSize: 13, fontWeight: "bold", fontFamily: mono },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  statusDotSmall: { width: 5, height: 5, borderRadius: 3 },
  statusLabel: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  moduleDesc: { fontSize: 11, color: "#6b7280", lineHeight: 15 },
  moduleTools: { gap: 4 },
  toolsLabel: { fontSize: 9, color: "#4b5563", fontFamily: mono, fontWeight: "bold" },
  toolTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1, backgroundColor: "#11182780" },
  toolTagText: { fontSize: 9, fontFamily: mono },
  moduleActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  execBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  execBtnText: { fontSize: 10, fontWeight: "bold", color: "#0a0e17", fontFamily: mono },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  catBadgeText: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  outputBox: { backgroundColor: "#111827", borderColor: "#1e293b", borderWidth: 1, borderRadius: 6, padding: 8, maxHeight: 150 },
  outputText: { fontSize: 10, color: "#00ff88", fontFamily: mono, lineHeight: 14 },
});
