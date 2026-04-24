import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  FlatList,
  ActivityIndicator,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

// ============================================================
// TYPES
// ============================================================

interface Repository {
  id: string;
  name: string;
  priority: "HIGH" | "MEDIUM" | "NORMAL";
  files: number;
  codeFiles: number;
  size: string;
  status: "idle" | "running" | "completed" | "error";
  enabled: boolean;
  tools: number;
  lastSync?: number;
}

// ============================================================
// REPOSITORIES DATA
// ============================================================

const REPOSITORIES: Repository[] = [
  // HIGH PRIORITY
  { id: "xgpt-wormgpt", name: "XGPT-WormGPT", priority: "HIGH", files: 6, codeFiles: 6, size: "3.04MB", status: "idle", enabled: true, tools: 12 },
  { id: "hexstrike-ai", name: "Hexstrike-AI", priority: "HIGH", files: 5, codeFiles: 5, size: "1.99MB", status: "idle", enabled: true, tools: 15 },
  { id: "worm-ai", name: "worm-ai", priority: "HIGH", files: 8, codeFiles: 3, size: "2.5MB", status: "idle", enabled: true, tools: 10 },
  { id: "w0rm-gpt", name: "W0rm-Gpt", priority: "HIGH", files: 25, codeFiles: 20, size: "4.2MB", status: "idle", enabled: true, tools: 18 },
  { id: "mhdos", name: "MHDDoS", priority: "HIGH", files: 12, codeFiles: 7, size: "5.1MB", status: "idle", enabled: true, tools: 14 },
  { id: "sqlforce", name: "sqlforce", priority: "HIGH", files: 15, codeFiles: 2, size: "2.3MB", status: "idle", enabled: true, tools: 8 },

  // MEDIUM PRIORITY
  { id: "investigation-core-ai", name: "investigation-core-ai-system", priority: "MEDIUM", files: 448, codeFiles: 295, size: "45.06MB", status: "idle", enabled: true, tools: 45 },
  { id: "investigation-deep", name: "investigation-deep-tools", priority: "MEDIUM", files: 25, codeFiles: 24, size: "0.21MB", status: "idle", enabled: true, tools: 12 },
  { id: "thegoofai", name: "TheGodOfAI", priority: "MEDIUM", files: 99, codeFiles: 76, size: "65.38MB", status: "idle", enabled: true, tools: 28 },
  { id: "kestra", name: "kestra", priority: "MEDIUM", files: 50, codeFiles: 2279, size: "120MB", status: "idle", enabled: true, tools: 52 },
  { id: "ids-inf", name: "ids-inf", priority: "MEDIUM", files: 20, codeFiles: 5, size: "3.2MB", status: "idle", enabled: true, tools: 9 },
  { id: "agl-stress", name: "AGL-Stress", priority: "MEDIUM", files: 18, codeFiles: 0, size: "2.8MB", status: "idle", enabled: true, tools: 6 },
  { id: "yuipanel", name: "YuiPanel_ir", priority: "MEDIUM", files: 22, codeFiles: 0, size: "4.5MB", status: "idle", enabled: true, tools: 11 },

  // NORMAL PRIORITY
  { id: "57653", name: "57653", priority: "NORMAL", files: 17, codeFiles: 1, size: "49.93MB", status: "idle", enabled: true, tools: 3 },
  { id: "executor-ddos", name: "EXECUTOR-DDOS", priority: "NORMAL", files: 6, codeFiles: 5, size: "9.42MB", status: "idle", enabled: true, tools: 7 },
  { id: "fuckjews", name: "FuckJews", priority: "NORMAL", files: 55, codeFiles: 36, size: "52.93MB", status: "idle", enabled: true, tools: 22 },
  { id: "hajime-ag", name: "Hajime-AG", priority: "NORMAL", files: 1, codeFiles: 0, size: "0.12MB", status: "idle", enabled: true, tools: 1 },
  { id: "hhandelas", name: "Hhandelas", priority: "NORMAL", files: 81, codeFiles: 60, size: "63.7MB", status: "idle", enabled: true, tools: 31 },
  { id: "install-setup", name: "Install-setup", priority: "NORMAL", files: 2, codeFiles: 0, size: "47.39MB", status: "idle", enabled: true, tools: 2 },
  { id: "payloads", name: "PayloadsAllTheThings", priority: "NORMAL", files: 440, codeFiles: 238, size: "19.83MB", status: "idle", enabled: true, tools: 89 },
  { id: "project-web", name: "Project-web", priority: "NORMAL", files: 5, codeFiles: 0, size: "60.44MB", status: "idle", enabled: true, tools: 4 },
  { id: "stux", name: "StuxWhoamisec", priority: "NORMAL", files: 2, codeFiles: 1, size: "0.06MB", status: "idle", enabled: true, tools: 2 },
  { id: "whm-small", name: "WHM-small-Pro", priority: "NORMAL", files: 12, codeFiles: 6, size: "48.42MB", status: "idle", enabled: true, tools: 8 },
  { id: "android-inv", name: "android-investigation-core", priority: "NORMAL", files: 17, codeFiles: 15, size: "103.21MB", status: "idle", enabled: true, tools: 19 },
  { id: "full-whm", name: "full-whm-exp", priority: "NORMAL", files: 141, codeFiles: 39, size: "25.65MB", status: "idle", enabled: true, tools: 21 },
  { id: "promptfoo", name: "promptfoo", priority: "NORMAL", files: 4619, codeFiles: 3237, size: "369.63MB", status: "idle", enabled: true, tools: 156 },
  { id: "whm-un1c", name: "whm-un1c", priority: "NORMAL", files: 948, codeFiles: 684, size: "40.04MB", status: "idle", enabled: true, tools: 67 },
];

// ============================================================
// COMPONENT
// ============================================================

export default function RepoControlScreen() {
  const [repos, setRepos] = useState<Repository[]>(REPOSITORIES);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(REPOSITORIES[0]);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [searchQuery] = useState(""); // Read-only for now
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);

  const haptic = useCallback((type: "light" | "success" | "error") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      const matchesPriority = !filterPriority || r.priority === filterPriority;
      const matchesSearch = !searchQuery || r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [repos, filterPriority, searchQuery]);

  const syncRepo = useCallback((repoId: string) => {
    haptic("light");
    setSyncingRepo(repoId);
    
    setTimeout(() => {
      setRepos((prev) =>
        prev.map((r) =>
          r.id === repoId
            ? { ...r, status: "completed", lastSync: Date.now() }
            : r
        )
      );
      setSyncingRepo(null);
      haptic("success");
    }, 2000);
  }, [haptic]);

  const toggleRepo = useCallback((repoId: string) => {
    haptic("light");
    setRepos((prev) =>
      prev.map((r) => (r.id === repoId ? { ...r, enabled: !r.enabled } : r))
    );
  }, [haptic]);

  const mono = Platform.OS === "ios" ? "Menlo" : "monospace";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 30 }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { fontFamily: mono }]}>🔧 REPOSITORY CONTROL PANEL</Text>
          <Text style={[s.subtitle, { fontFamily: mono }]}>27 Integrated Repositories | 7,044 Code Files</Text>
        </View>

        {/* Priority Filter */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📊 FILTER BY PRIORITY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {["All", "HIGH", "MEDIUM", "NORMAL"].map((priority) => (
              <Pressable
                key={priority}
                onPress={() => setFilterPriority(priority === "All" ? null : priority)}
                style={[
                  s.filterTag,
                  (filterPriority === priority || (priority === "All" && !filterPriority)) && s.filterTagActive,
                ]}
              >
                <Text style={[s.filterTagText, { fontFamily: mono }]}>
                  {priority === "HIGH" ? "⭐" : priority === "MEDIUM" ? "◆" : priority === "NORMAL" ? "○" : "🔄"} {priority}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Repository List */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📦 REPOSITORIES ({filteredRepos.length})</Text>

          <FlatList
            data={filteredRepos}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => {
              const isSelected = selectedRepo?.id === item.id;
              const priorityIcon = item.priority === "HIGH" ? "⭐" : item.priority === "MEDIUM" ? "◆" : "○";
              const isSync = syncingRepo === item.id;

              return (
                <Pressable
                  onPress={() => {
                    haptic("light");
                    setSelectedRepo(item);
                  }}
                  style={[s.repoItem, isSelected && s.repoItemSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.repoName, { fontFamily: mono }]}>
                      {priorityIcon} {item.name}
                    </Text>
                    <Text style={[s.repoMeta, { fontFamily: mono }]}>
                      Files: {item.files} | Code: {item.codeFiles} | Size: {item.size} | Tools: {item.tools}
                    </Text>
                    {item.lastSync && (
                      <Text style={[s.repoMeta, { fontFamily: mono, color: "#00ff88" }]}>
                        Last Sync: {new Date(item.lastSync).toLocaleTimeString()}
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    {isSync && <ActivityIndicator color="#00ff88" size="small" />}
                    <Pressable
                      onPress={() => syncRepo(item.id)}
                      disabled={isSync}
                      style={[s.syncButton, isSync && { opacity: 0.6 }]}
                    >
                      <Text style={[s.syncButtonText, { fontFamily: mono }]}>🔄</Text>
                    </Pressable>
                    <Switch
                      value={item.enabled}
                      onValueChange={() => toggleRepo(item.id)}
                      trackColor={{ false: "#1e293b", true: "#00ff88" }}
                      thumbColor={item.enabled ? "#0a0e17" : "#4b5563"}
                    />
                  </View>
                </Pressable>
              );
            }}
          />
        </View>

        {/* Selected Repository Details */}
        {selectedRepo && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { fontFamily: mono }]}>📋 REPOSITORY DETAILS</Text>

            <View style={s.detailsCard}>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Name</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>{selectedRepo.name}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Priority</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>
                  {selectedRepo.priority === "HIGH" ? "⭐ HIGH" : selectedRepo.priority === "MEDIUM" ? "◆ MEDIUM" : "○ NORMAL"}
                </Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Files</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>{selectedRepo.files}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Code Files</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>{selectedRepo.codeFiles}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Size</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>{selectedRepo.size}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Tools</Text>
                <Text style={[s.detailValue, { fontFamily: mono }]}>{selectedRepo.tools}</Text>
              </View>
              <View style={s.detailRow}>
                <Text style={[s.detailLabel, { fontFamily: mono }]}>Status</Text>
                <Text style={[s.detailValue, { fontFamily: mono, color: selectedRepo.status === "completed" ? "#00ff88" : "#00e5ff" }]}>
                  {selectedRepo.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() => syncRepo(selectedRepo.id)}
              style={[s.actionButton, syncingRepo === selectedRepo.id && { opacity: 0.6 }]}
            >
              {syncingRepo === selectedRepo.id ? (
                <ActivityIndicator color="#0a0e17" />
              ) : (
                <Text style={[s.actionButtonText, { fontFamily: mono }]}>🔄 SYNC REPOSITORY</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* Statistics */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📈 STATISTICS</Text>

          {[
            ["Total Repositories", repos.length.toString()],
            ["Enabled", repos.filter((r) => r.enabled).length.toString()],
            ["HIGH Priority", repos.filter((r) => r.priority === "HIGH").length.toString()],
            ["MEDIUM Priority", repos.filter((r) => r.priority === "MEDIUM").length.toString()],
            ["Total Tools", repos.reduce((sum, r) => sum + r.tools, 0).toString()],
          ].map(([label, value]) => (
            <View key={label} style={s.statRow}>
              <Text style={[s.statLabel, { fontFamily: mono }]}>{label}</Text>
              <Text style={[s.statValue, { fontFamily: mono }]}>{value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ============================================================
// STYLES
// ============================================================

const s = StyleSheet.create({
  header: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00e5ff",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00e5ff",
  },
  filterTag: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  filterTagActive: {
    backgroundColor: "#00e5ff",
    borderColor: "#00e5ff",
  },
  filterTagText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  repoItem: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  repoItemSelected: {
    borderColor: "#00e5ff",
    borderWidth: 2,
    backgroundColor: "#0d1117",
  },
  repoName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#00e5ff",
  },
  repoMeta: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  syncButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  syncButtonText: {
    fontSize: 10,
    color: "#00ff88",
  },
  detailsCard: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  detailLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  actionButton: {
    backgroundColor: "#00e5ff",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0a0e17",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  statLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
});
