import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { getToolsByModule } from "@/lib/tools-data";
import { MODULES } from "@/lib/modules-context";

export default function RepoFullWhmScreen() {
  const [tools, setTools] = useState([]);
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    // Find module that matches this repo
    const module = MODULES.find(m => m.id === "full-whm" || m.name.toLowerCase().includes("full-whm-exp"));
    if (module) {
      const repoTools = getToolsByModule(module.id);
      setTools(repoTools);
    }
  }, []);

  const handleExecute = async (toolId) => {
    setIsLoading(true);
    const ts = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, `[${ts}] Executing ${toolId}...`]);
    
    try {
      // Simulate execution - in real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1500));
      const ts2 = new Date().toLocaleTimeString();
      setOutput(prev => [...prev, `[${ts2}] ✓ Execution complete`]);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.title}>full-whm-exp</Text>
            <Text style={s.subtitle}>Repository Control Panel</Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.backBtnText}>BACK</Text>
          </Pressable>
        </View>

        {/* Repo Info */}
        <View style={s.infoBox}>
          <Text style={s.infoTitle}>📦 Repository Information</Text>
          <Text style={s.infoText}>Name: full-whm-exp</Text>
          <Text style={s.infoText}>GitHub: https://github.com/kimikukiu/full-whm-exp</Text>
          <Text style={s.infoText}>Tools: {tools.length}</Text>
          <Text style={s.infoText}>Status: RUNNING</Text>
        </View>

        {/* Tools Section */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🔧 Tools ({tools.length})</Text>
          
          {tools.length > 0 ? (
            tools.map((tool, idx) => (
              <View key={idx} style={s.toolCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.toolName}>{tool.name}</Text>
                  <Text style={s.toolDesc}>{tool.description}</Text>
                  <Text style={s.toolStatus}>Status: {tool.status}</Text>
                </View>
                <Pressable
                  onPress={() => handleExecute(tool.id)}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    s.executeBtn,
                    isLoading && { opacity: 0.5 },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <Text style={s.executeBtnText}>EXECUTE</Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={s.emptyState}>
              <Text style={s.emptyText}>No tools found for this repository</Text>
              <Text style={s.emptySubtext}>Tools will appear here when module is configured</Text>
            </View>
          )}
        </View>

        {/* Output Section */}
        {output.length > 0 && (
          <View style={s.outputBox}>
            <Text style={s.outputTitle}>📊 Execution Output</Text>
            {output.map((line, idx) => (
              <Text key={idx} style={s.outputLine}>{line}</Text>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>⚡ Quick Actions</Text>
          
          <Pressable
            onPress={() => {
              Alert.alert("Sync Repository", "Repository sync started");
            }}
            style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.actionBtnText}>🔄 SYNC REPOSITORY</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert("Clone Repository", "Cloning repository...");
            }}
            style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.actionBtnText}>📥 CLONE / PULL</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              Alert.alert("View on GitHub", "Opening https://github.com/kimikukiu/full-whm-exp");
            }}
            style={({ pressed }) => [s.actionBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={s.actionBtnText}>🔗 OPEN GITHUB</Text>
          </Pressable>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: "monospace",
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: "monospace",
  },
  backBtn: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backBtnText: {
    color: "#00e5ff",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  infoBox: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
    color: "#e0e7ff",
    fontFamily: "monospace",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: "monospace",
  },
  toolCard: {
    flexDirection: "row",
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 12,
    alignItems: "center",
  },
  toolName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#e0e7ff",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 10,
    color: "#9ca3af",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  toolStatus: {
    fontSize: 9,
    color: "#00ff88",
    fontFamily: "monospace",
  },
  executeBtn: {
    backgroundColor: "#00ff88",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  executeBtnText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily: "monospace",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 11,
    color: "#4b5563",
    fontFamily: "monospace",
  },
  outputBox: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  outputTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00ff88",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  outputLine: {
    fontSize: 10,
    color: "#e0e7ff",
    fontFamily: "monospace",
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#00e5ff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#00e5ff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },
});
