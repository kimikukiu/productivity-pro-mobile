import { Text, View, Pressable, TextInput, StyleSheet, Platform, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { MODULES, type ModuleCategory } from "@/lib/modules-context";
import { ALL_TOOLS, getToolsByModule, searchTools, type Tool } from "@/lib/tools-data";
import { useState, useMemo } from "react";
import { router } from "expo-router";
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
  IDLE: "#ffff00",
  ERROR: "#ff3b5c",
  SYNCING: "#00e5ff",
};

type ViewMode = "modules" | "tools";

export default function ModulesScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("modules");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const runningTools = ALL_TOOLS.filter((t) => t.status === "RUNNING").length;
  const totalTools = ALL_TOOLS.length;

  const filteredModules = useMemo(() => {
    let mods = selectedCategory === "all" ? MODULES : MODULES.filter((m) => m.category === selectedCategory);
    if (searchQuery) {
      const lq = searchQuery.toLowerCase();
      mods = mods.filter(
        (m) =>
          m.name.toLowerCase().includes(lq) ||
          m.description.toLowerCase().includes(lq) ||
          getToolsByModule(m.id).some((t) => t.name.toLowerCase().includes(lq) || t.id.toLowerCase().includes(lq))
      );
    }
    return mods;
  }, [selectedCategory, searchQuery]);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return ALL_TOOLS;
    return searchTools(searchQuery);
  }, [searchQuery]);

  const openToolPanel = (toolId: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: "/tool-panel", params: { toolId } });
  };

  const renderToolItem = ({ item: tool }: { item: Tool }) => {
    const parentModule = MODULES.find((m) => m.id === tool.moduleId);
    const moduleColor = parentModule?.color ?? "#00ff88";

    return (
      <Pressable
        onPress={() => openToolPanel(tool.id)}
        style={({ pressed }) => [st.toolCard, { borderColor: `${moduleColor}30`, opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
      >
        <View style={st.toolCardHeader}>
          <View style={{ flex: 1 }}>
            <View style={st.toolNameRow}>
              <View style={[st.statusDot, { backgroundColor: STATUS_COLORS[tool.status] }]} />
              <Text style={[st.toolName, { color: moduleColor }]} numberOfLines={1}>{tool.name}</Text>
            </View>
            <Text style={st.toolId}>{tool.id}</Text>
          </View>
          <View style={[st.statusBadge, { backgroundColor: `${STATUS_COLORS[tool.status]}15`, borderColor: `${STATUS_COLORS[tool.status]}50` }]}>
            <Text style={[st.statusText, { color: STATUS_COLORS[tool.status] }]}>{tool.status}</Text>
          </View>
        </View>
        <Text style={st.toolDesc} numberOfLines={2}>{tool.description}</Text>
        <View style={st.toolFooter}>
          <View style={[st.catTag, { borderColor: `${moduleColor}40` }]}>
            <Text style={[st.catTagText, { color: moduleColor }]}>{tool.category.toUpperCase()}</Text>
          </View>
          <Text style={st.paramCount}>{tool.params.length} params</Text>
          <View style={st.openBtn}>
            <Text style={st.openBtnText}>CONTROL ▶</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderModuleWithTools = ({ item: module }: { item: typeof MODULES[0] }) => {
    const moduleTools = getToolsByModule(module.id);
    const runningModuleTools = moduleTools.filter((t) => t.status === "RUNNING").length;
    const isExpanded = expandedModule === module.id;

    return (
      <View style={[st.moduleCard, { borderColor: `${module.color}40` }]}>
        {/* Module Header */}
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setExpandedModule(isExpanded ? null : module.id);
          }}
          style={({ pressed }) => [st.moduleHeader, { opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={{ flex: 1 }}>
            <View style={st.moduleNameRow}>
              <View style={[st.statusDot, { backgroundColor: STATUS_COLORS[module.status] ?? "#00ff88" }]} />
              <Text style={[st.moduleName, { color: module.color }]}>{module.name}</Text>
              <View style={[st.statusBadge, { backgroundColor: `${STATUS_COLORS[module.status] ?? "#00ff88"}15`, borderColor: `${STATUS_COLORS[module.status] ?? "#00ff88"}50` }]}>
                <Text style={[st.statusText, { color: STATUS_COLORS[module.status] ?? "#00ff88" }]}>{module.status}</Text>
              </View>
            </View>
            <Text style={st.moduleDesc} numberOfLines={isExpanded ? undefined : 1}>{module.description}</Text>
          </View>
          <View style={st.moduleStats}>
            <Text style={[st.toolCountBig, { color: module.color }]}>{moduleTools.length}</Text>
            <Text style={st.toolCountLabel}>TOOLS</Text>
            <Text style={st.runningLabel}>{runningModuleTools} ▲</Text>
          </View>
        </Pressable>

        {/* Expanded: Show all tools */}
        {isExpanded && (
          <View style={st.toolsList}>
            <View style={st.toolsListHeader}>
              <Text style={[st.toolsHeaderText, { color: module.color }]}>◆ TOOLS ({moduleTools.length})</Text>
              <Text style={st.toolsHeaderSub}>{runningModuleTools}/{moduleTools.length} RUNNING</Text>
            </View>
            {moduleTools.map((tool) => (
              <Pressable
                key={tool.id}
                onPress={() => openToolPanel(tool.id)}
                style={({ pressed }) => [st.toolRow, { opacity: pressed ? 0.7 : 1, borderColor: `${module.color}20` }]}
              >
                <View style={[st.statusDotSmall, { backgroundColor: STATUS_COLORS[tool.status] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[st.toolRowName, { color: module.color }]}>{tool.name}</Text>
                  <Text style={st.toolRowDesc} numberOfLines={1}>{tool.description}</Text>
                </View>
                <View style={st.toolRowRight}>
                  <Text style={[st.toolRowStatus, { color: STATUS_COLORS[tool.status] }]}>{tool.status}</Text>
                  <Text style={st.toolRowArrow}>▶</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={st.header}>
        <View style={st.headerRow}>
          <Text style={st.headerTitle}>MODULES</Text>
          <View style={st.headerStats}>
            <View style={st.statBadge}>
              <View style={[st.statusDot, { backgroundColor: "#00ff88" }]} />
              <Text style={st.statText}>{runningTools}/{totalTools} RUNNING</Text>
            </View>
          </View>
        </View>

        {/* Stats Bar */}
        <View style={st.statsBar}>
          <View style={st.statItem}>
            <Text style={st.statNum}>{MODULES.length}</Text>
            <Text style={st.statLabel}>MODULES</Text>
          </View>
          <View style={[st.statDivider]} />
          <View style={st.statItem}>
            <Text style={[st.statNum, { color: "#00e5ff" }]}>{totalTools}</Text>
            <Text style={st.statLabel}>TOOLS</Text>
          </View>
          <View style={[st.statDivider]} />
          <View style={st.statItem}>
            <Text style={[st.statNum, { color: "#00ff88" }]}>{runningTools}</Text>
            <Text style={st.statLabel}>RUNNING</Text>
          </View>
          <View style={[st.statDivider]} />
          <View style={st.statItem}>
            <Text style={[st.statNum, { color: "#ff3b5c" }]}>{totalTools - runningTools}</Text>
            <Text style={st.statLabel}>IDLE</Text>
          </View>
        </View>

        {/* Module Sidebar (Horizontal Scrollable) */}
        <View style={st.sidebarContainer}>
          <Text style={st.sidebarLabel}>◆ MODULE SIDEBAR</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.sidebarScroll}>
            {MODULES.map((module) => (
              <Pressable
                key={module.id}
                onPress={() => {
                  if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedCategory(module.id as ModuleCategory);
                  setExpandedModule(module.id === expandedModule ? null : module.id);
                }}
                style={({ pressed }) => [
                  st.sidebarBtn,
                  { 
                    borderColor: `${module.color}60`,
                    backgroundColor: selectedCategory === module.id ? `${module.color}20` : "transparent",
                    opacity: pressed ? 0.7 : 1 
                  }
                ]}
              >
                <View style={[st.sidebarBtnDot, { backgroundColor: module.color }]} />
                <Text style={[st.sidebarBtnText, { color: module.color }]} numberOfLines={1}>
                  {module.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Search */}
      <View style={st.searchContainer}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search modules & tools..."
          placeholderTextColor="#4b5563"
          style={st.searchInput}
          returnKeyType="done"
        />

        {/* View Mode Toggle */}
        <View style={st.viewToggle}>
          <Pressable
            onPress={() => { setViewMode("modules"); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[st.toggleBtn, viewMode === "modules" && st.toggleBtnActive]}
          >
            <Text style={[st.toggleBtnText, viewMode === "modules" && st.toggleBtnTextActive]}>BY MODULE</Text>
          </Pressable>
          <Pressable
            onPress={() => { setViewMode("tools"); if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[st.toggleBtn, viewMode === "tools" && st.toggleBtnActive]}
          >
            <Text style={[st.toggleBtnText, viewMode === "tools" && st.toggleBtnTextActive]}>ALL TOOLS ({totalTools})</Text>
          </Pressable>
        </View>

        {/* Categories */}
        {viewMode === "modules" && (
          <FlatList
            horizontal
            data={CATEGORIES}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 5, paddingBottom: 8 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item: cat }) => {
              const isActive = selectedCategory === cat.id;
              return (
                <Pressable
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
                  <Text style={[st.catChipText, { color: isActive ? "#0a0e17" : cat.color }]}>{cat.label}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Content */}
      {viewMode === "modules" ? (
        <FlatList
          data={filteredModules}
          keyExtractor={(item) => item.id}
          renderItem={renderModuleWithTools}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#6b7280", fontFamily: mono }}>No modules found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredTools}
          keyExtractor={(item) => item.id}
          renderItem={renderToolItem}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingVertical: 10, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: "#6b7280", fontFamily: mono }}>No tools found</Text>
            </View>
          }
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      )}
    </ScreenContainer>
  );
}

const mono = Platform.OS === "ios" ? "Menlo" : "monospace";
const st = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  headerStats: { flexDirection: "row", gap: 8 },
  statBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 9, color: "#00ff88", fontFamily: mono, fontWeight: "bold" },
  statsBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#0d1117", borderRadius: 8, borderWidth: 1, borderColor: "#1e293b", paddingVertical: 8, marginBottom: 8 },
  statItem: { alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "bold", color: "#00ff88", fontFamily: mono },
  statLabel: { fontSize: 8, color: "#6b7280", fontFamily: mono, fontWeight: "bold", marginTop: 2 },
  statDivider: { width: 1, height: 28, backgroundColor: "#1e293b" },
  searchInput: { backgroundColor: "#0d1117", color: "#e0e7ff", borderWidth: 1, borderColor: "#1e293b", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontFamily: mono, fontSize: 12, marginBottom: 8 },
  viewToggle: { flexDirection: "row", gap: 4, marginBottom: 8 },
  toggleBtn: { flex: 1, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: "#1e293b", alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#00ff88", borderColor: "#00ff88" },
  toggleBtnText: { fontSize: 10, fontWeight: "bold", fontFamily: mono, color: "#6b7280" },
  toggleBtnTextActive: { color: "#0a0e17" },
  catChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, borderWidth: 1 },
  catChipText: { fontSize: 9, fontWeight: "bold", fontFamily: mono },
  // Module card
  moduleCard: { backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 10, overflow: "hidden" },
  moduleHeader: { flexDirection: "row", padding: 12, alignItems: "flex-start" },
  moduleNameRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" },
  moduleName: { fontSize: 13, fontWeight: "bold", fontFamily: mono },
  moduleDesc: { fontSize: 10, color: "#6b7280", lineHeight: 14 },
  moduleStats: { alignItems: "center", marginLeft: 12, minWidth: 50 },
  toolCountBig: { fontSize: 22, fontWeight: "bold", fontFamily: mono },
  toolCountLabel: { fontSize: 8, color: "#6b7280", fontFamily: mono, fontWeight: "bold" },
  runningLabel: { fontSize: 9, color: "#00ff88", fontFamily: mono, fontWeight: "bold" },
  // Tools list inside module
  toolsList: { borderTopWidth: 1, borderTopColor: "#1e293b", paddingHorizontal: 12, paddingBottom: 12 },
  toolsListHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  toolsHeaderText: { fontSize: 11, fontWeight: "bold", fontFamily: mono },
  toolsHeaderSub: { fontSize: 9, color: "#00ff88", fontFamily: mono },
  toolRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 8, borderWidth: 1, borderRadius: 6, marginBottom: 4, backgroundColor: "#111827" },
  toolRowName: { fontSize: 11, fontWeight: "bold", fontFamily: mono },
  toolRowDesc: { fontSize: 9, color: "#6b7280", fontFamily: mono },
  toolRowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  toolRowStatus: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  toolRowArrow: { fontSize: 10, color: "#4b5563" },
  // Tool card (all tools view)
  toolCard: { backgroundColor: "#0d1117", borderWidth: 1, borderRadius: 8, padding: 10 },
  toolCardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  toolNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  toolName: { fontSize: 12, fontWeight: "bold", fontFamily: mono },
  toolId: { fontSize: 9, color: "#4b5563", fontFamily: mono },
  toolDesc: { fontSize: 10, color: "#6b7280", lineHeight: 14, marginBottom: 6 },
  toolFooter: { flexDirection: "row", alignItems: "center", gap: 6 },
  catTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, borderWidth: 1, backgroundColor: "#11182780" },
  catTagText: { fontSize: 8, fontFamily: mono, fontWeight: "bold" },
  paramCount: { fontSize: 9, color: "#4b5563", fontFamily: mono },
  openBtn: { marginLeft: "auto", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, backgroundColor: "#00ff8820", borderWidth: 1, borderColor: "#00ff8840" },
  openBtnText: { fontSize: 9, fontWeight: "bold", fontFamily: mono, color: "#00ff88" },
  // Shared
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusDotSmall: { width: 5, height: 5, borderRadius: 3 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  statusText: { fontSize: 8, fontWeight: "bold", fontFamily: mono },
  // Sidebar styles
  sidebarContainer: { paddingHorizontal: 14, marginTop: 8, marginBottom: 4 },
  sidebarLabel: { fontSize: 11, fontWeight: "bold", color: "#00ff88", fontFamily: mono, marginBottom: 6 },
  sidebarScroll: { gap: 6, paddingRight: 14 },
  sidebarBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, borderWidth: 1, minWidth: 100 },
  sidebarBtnDot: { width: 5, height: 5, borderRadius: 3 },
  sidebarBtnText: { fontSize: 9, fontWeight: "bold", fontFamily: mono, flexShrink: 1 },
});
