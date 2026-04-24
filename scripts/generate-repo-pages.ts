import * as fs from "fs";
import * as path from "path";

const REPOS = [
  { id: "xgpt-wormgpt", name: "XGPT-WormGPT", github: "https://github.com/kimikukiu/XGPT-WormGPT" },
  { id: "hexstrike-ai", name: "Hexstrike-AI", github: "https://github.com/havij13/Hexstrike-AI" },
  { id: "worm-ai", name: "worm-ai", github: "https://github.com/kimikukiu/worm-ai" },
  { id: "w0rm-gpt", name: "W0rm-Gpt", github: "https://github.com/kimikukiu/W0rm-Gpt" },
  { id: "kestra", name: "kestra", github: "https://github.com/kimikukiu/kestra" },
  { id: "mhdos", name: "MHDDoS", github: "https://github.com/kimikukiu/MHDDoS" },
  { id: "sqlforce", name: "sqlforce", github: "https://github.com/kimikukiu/sqlforce" },
  { id: "ids-inf", name: "ids-inf", github: "https://github.com/kimikukiu/ids-inf" },
  { id: "agl-stress", name: "AGL-Stress", github: "https://github.com/kimikukiu/AGL-Stress" },
  { id: "yuipanel", name: "YuiPanel_ir", github: "https://github.com/kimikukiu/YuiPanel_ir" },
  { id: "full-whm", name: "full-whm-exp", github: "https://github.com/kimikukiu/full-whm-exp" },
  { id: "whm-un1c", name: "whm-un1c", github: "https://github.com/kimikukiu/whm-un1c" },
  { id: "investigation-core-ai", name: "investigation-core-ai-system", github: "https://github.com/kimikukiu/investigation-core-ai-system" },
  { id: "whm-small", name: "WHM-small-Pro", github: "https://github.com/kimikukiu/WHM-small-Pro" },
  { id: "hajime-ag", name: "Hajime-AG", github: "https://github.com/kimikukiu/Hajime-AG" },
  { id: "stux", name: "StuxWhoamisec", github: "https://github.com/kimikukiu/StuxWhoamisec" },
  { id: "install-setup", name: "Install-setup", github: "https://github.com/kimikukiu/Install-setup" },
  { id: "promptfoo", name: "promptfoo", github: "https://github.com/kimikukiu/promptfoo" },
  { id: "project-web", name: "Project-web", github: "https://github.com/kimikukiu/Project-web" },
  { id: "executor-ddos", name: "EXECUTOR-DDOS", github: "https://github.com/kimikukiu/EXECUTOR-DDOS" },
  { id: "android-inv", name: "android-investigation-core", github: "https://github.com/kimikukiu/android-investigation-core" },
  { id: "investigation-deep", name: "investigation-deep-tools", github: "https://github.com/kimikukiu/investigation-deep-tools" },
  { id: "payloads", name: "PayloadsAllTheThings", github: "https://github.com/kimikukiu/PayloadsAllTheThings" },
];

const TABS_DIR = path.join(process.cwd(), "app", "(tabs)");

// Template for repo control panel page
function generateRepoPage(repoId: string, repoName: string, githubUrl: string) {
  const componentName = repoId.replace(/-/g, "_").replace(/\b\w/g, l => l.toUpperCase());
  
  return `import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet, Platform } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { getToolsByModule, type Tool } from "@/lib/tools-data";
import { MODULES } from "@/lib/modules-context";

export default function Repo${componentName}Screen() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    // Find module that matches this repo
    const module = MODULES.find(m => m.id === "${repoId}" || m.name.toLowerCase().includes("${repoName.toLowerCase()}"));
    if (module) {
      const repoTools = getToolsByModule(module.id);
      setTools(repoTools);
    }
  }, []);

  const handleExecute = async (toolId: string) => {
    if (Platform.OS !== "web") await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    const ts = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, \`[\${ts}] Executing \${toolId}...\`]);
    
    try {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      const ts2 = new Date().toLocaleTimeString();
      setOutput(prev => [...prev, \`[\${ts2}] ✓ Execution complete\`]);
    } catch (error: any) {
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
            <Text style={s.title}>${repoName}</Text>
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
          <Text style={s.infoText}>Name: ${repoName}</Text>
          <Text style={s.infoText}>GitHub: ${githubUrl}</Text>
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
              Alert.alert("View on GitHub", "Opening ${githubUrl}");
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
`;
}

// Generate all repo pages
let generatedCount = 0;
REPOS.forEach((repo) => {
  const fileName = `repo-${repo.id}.tsx`;
  const filePath = path.join(TABS_DIR, fileName);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${fileName} (already exists)`);
    return;
  }
  
  const content = generateRepoPage(repo.id, repo.name, repo.github);
  fs.writeFileSync(filePath, content);
  generatedCount++;
  console.log(`✅ Generated ${fileName}`);
});

console.log(`\n✅ Generated ${generatedCount} repository control panel pages in ${TABS_DIR}`);
