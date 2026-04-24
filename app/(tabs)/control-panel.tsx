import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

// ============================================================
// TYPES
// ============================================================

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  version: string;
  lastUpdated: number;
}

interface TrainingSession {
  id: string;
  startTime: number;
  endTime?: number;
  status: "running" | "completed" | "failed";
  toolsProcessed: number;
  accuracy: number;
  error?: string;
}

interface GPTMetrics {
  totalTools: number;
  enabledTools: number;
  trainingAccuracy: number;
  lastTrainingTime: number;
  totalTrainingSessions: number;
  responseTime: number;
  errorRate: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_TOOLS: Tool[] = [
  // Investigation Tools
  { id: "osint-1", name: "OSINT Recon", category: "Investigation", description: "Open Source Intelligence gathering", enabled: true, version: "2.1", lastUpdated: Date.now() },
  { id: "osint-2", name: "Domain Analyzer", category: "Investigation", description: "Deep domain analysis and enumeration", enabled: true, version: "1.8", lastUpdated: Date.now() },
  { id: "osint-3", name: "IP Geolocation", category: "Investigation", description: "IP address tracking and geolocation", enabled: true, version: "3.2", lastUpdated: Date.now() },
  { id: "osint-4", name: "Email Finder", category: "Investigation", description: "Email discovery and verification", enabled: true, version: "2.5", lastUpdated: Date.now() },
  { id: "osint-5", name: "Social Media Scraper", category: "Investigation", description: "Social media profile analysis", enabled: true, version: "1.9", lastUpdated: Date.now() },

  // Network Tools
  { id: "net-1", name: "Port Scanner", category: "Network", description: "Advanced port scanning and service detection", enabled: true, version: "4.1", lastUpdated: Date.now() },
  { id: "net-2", name: "Vulnerability Scanner", category: "Network", description: "CVE detection and vulnerability assessment", enabled: true, version: "3.7", lastUpdated: Date.now() },
  { id: "net-3", name: "Packet Analyzer", category: "Network", description: "Network traffic analysis and inspection", enabled: true, version: "2.3", lastUpdated: Date.now() },
  { id: "net-4", name: "DNS Resolver", category: "Network", description: "DNS enumeration and resolution", enabled: true, version: "1.6", lastUpdated: Date.now() },

  // Payload Tools
  { id: "payload-1", name: "Payload Generator", category: "Payloads", description: "Exploit payload generation", enabled: true, version: "5.2", lastUpdated: Date.now() },
  { id: "payload-2", name: "Shellcode Encoder", category: "Payloads", description: "Shellcode encoding and obfuscation", enabled: true, version: "3.4", lastUpdated: Date.now() },
  { id: "payload-3", name: "Reverse Shell Builder", category: "Payloads", description: "Reverse shell payload builder", enabled: true, version: "2.8", lastUpdated: Date.now() },

  // Exploitation Tools
  { id: "exploit-1", name: "Exploit Framework", category: "Exploitation", description: "Multi-platform exploitation framework", enabled: true, version: "6.1", lastUpdated: Date.now() },
  { id: "exploit-2", name: "Web App Tester", category: "Exploitation", description: "Web application vulnerability testing", enabled: true, version: "4.3", lastUpdated: Date.now() },
  { id: "exploit-3", name: "SQL Injector", category: "Exploitation", description: "SQL injection testing and exploitation", enabled: true, version: "3.9", lastUpdated: Date.now() },

  // Android Tools
  { id: "android-1", name: "APK Analyzer", category: "Mobile", description: "Android APK analysis and decompilation", enabled: true, version: "2.7", lastUpdated: Date.now() },
  { id: "android-2", name: "Device Connector", category: "Mobile", description: "Android device connection and control", enabled: true, version: "1.5", lastUpdated: Date.now() },

  // Cryptography Tools
  { id: "crypto-1", name: "Encryption Suite", category: "Cryptography", description: "Advanced encryption and decryption", enabled: true, version: "3.2", lastUpdated: Date.now() },
  { id: "crypto-2", name: "Hash Cracker", category: "Cryptography", description: "Hash cracking and analysis", enabled: true, version: "2.1", lastUpdated: Date.now() },

  // Stealth Tools
  { id: "stealth-1", name: "Obfuscator", category: "Stealth", description: "Code obfuscation and evasion", enabled: true, version: "4.5", lastUpdated: Date.now() },
  { id: "stealth-2", name: "Anti-Detection", category: "Stealth", description: "Anti-detection and anti-forensics", enabled: true, version: "3.1", lastUpdated: Date.now() },
];

// ============================================================
// COMPONENT
// ============================================================

export default function ControlPanelScreen() {
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [metrics, setMetrics] = useState<GPTMetrics>({
    totalTools: INITIAL_TOOLS.length,
    enabledTools: INITIAL_TOOLS.filter((t) => t.enabled).length,
    trainingAccuracy: 94.7,
    lastTrainingTime: Date.now() - 3600000,
    totalTrainingSessions: 127,
    responseTime: 245,
    errorRate: 0.3,
  });

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const haptic = useCallback((type: "light" | "success" | "error") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ============================================================
  // TRAINING LOGIC
  // ============================================================

  const startTraining = useCallback(() => {
    haptic("light");

    if (isTraining) {
      Alert.alert("Training in Progress", "A training session is already running");
      return;
    }

    setIsTraining(true);

    const session: TrainingSession = {
      id: `train-${Date.now()}`,
      startTime: Date.now(),
      status: "running",
      toolsProcessed: 0,
      accuracy: 0,
    };

    setTrainingSessions((prev) => [session, ...prev]);

    // Simulate training process
    let processed = 0;
    const interval = setInterval(() => {
      processed += Math.floor(Math.random() * 3) + 1;

      if (processed >= tools.length) {
        processed = tools.length;
        clearInterval(interval);

        const accuracy = 85 + Math.random() * 15; // 85-100%
        const updatedSession: TrainingSession = {
          ...session,
          endTime: Date.now(),
          status: "completed",
          toolsProcessed: processed,
          accuracy,
        };

        setTrainingSessions((prev) =>
          prev.map((s) => (s.id === session.id ? updatedSession : s))
        );

        setMetrics((prev) => ({
          ...prev,
          trainingAccuracy: accuracy,
          lastTrainingTime: Date.now(),
          totalTrainingSessions: prev.totalTrainingSessions + 1,
        }));

        setIsTraining(false);
        haptic("success");
        Alert.alert("✅ Training Complete", `Accuracy: ${accuracy.toFixed(1)}%\nTools processed: ${processed}`);
      } else {
        setTrainingSessions((prev) =>
          prev.map((s) =>
            s.id === session.id
              ? {
                  ...s,
                  toolsProcessed: processed,
                  accuracy: 50 + (processed / tools.length) * 45,
                }
              : s
          )
        );
      }
    }, 500);
  }, [tools.length, isTraining, haptic]);

  const toggleTool = useCallback(
    (toolId: string) => {
      haptic("light");
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
      );

      setMetrics((prev) => ({
        ...prev,
        enabledTools: tools.filter((t) => t.id !== toolId && t.enabled).length + (tools.find((t) => t.id === toolId)?.enabled ? 0 : 1),
      }));
    },
    [tools, haptic]
  );

  const categories = Array.from(new Set(tools.map((t) => t.category)));
  const filteredTools = tools.filter((t) => {
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const mono = Platform.OS === "ios" ? "Menlo" : "monospace";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 30 }}>
        {/* Header */}
        <View style={s.header}>
          <Text style={[s.title, { fontFamily: mono }]}>🎛️ CONTROL PANEL</Text>
          <Text style={[s.subtitle, { fontFamily: mono }]}>GPT Training & Tool Management</Text>
        </View>

        {/* Metrics */}
        <View style={s.metricsGrid}>
          <View style={s.metricCard}>
            <Text style={[s.metricValue, { fontFamily: mono }]}>{metrics.totalTools}</Text>
            <Text style={[s.metricLabel, { fontFamily: mono }]}>Total Tools</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricValue, { color: "#00ff88", fontFamily: mono }]}>
              {metrics.enabledTools}
            </Text>
            <Text style={[s.metricLabel, { fontFamily: mono }]}>Enabled</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricValue, { color: "#00e5ff", fontFamily: mono }]}>
              {metrics.trainingAccuracy.toFixed(1)}%
            </Text>
            <Text style={[s.metricLabel, { fontFamily: mono }]}>Accuracy</Text>
          </View>
          <View style={s.metricCard}>
            <Text style={[s.metricValue, { color: "#ffff00", fontFamily: mono }]}>
              {metrics.responseTime}ms
            </Text>
            <Text style={[s.metricLabel, { fontFamily: mono }]}>Response</Text>
          </View>
        </View>

        {/* Training Section */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>⚡ GPT TRAINING</Text>

          <Pressable
            onPress={startTraining}
            disabled={isTraining}
            style={({ pressed }) => [
              s.trainButton,
              isTraining && { opacity: 0.6 },
              pressed && { opacity: 0.8 },
            ]}
          >
            {isTraining ? (
              <ActivityIndicator color="#0a0e17" />
            ) : (
              <Text style={[s.trainButtonText, { fontFamily: mono }]}>
                🚀 START TRAINING SESSION
              </Text>
            )}
          </Pressable>

          {trainingSessions.length > 0 && (
            <View style={s.sessionsContainer}>
              <Text style={[s.sessionsTitle, { fontFamily: mono }]}>
                Recent Sessions ({trainingSessions.length})
              </Text>
              {trainingSessions.slice(0, 3).map((session) => {
                const duration = (session.endTime || Date.now()) - session.startTime;
                const durationSec = Math.floor(duration / 1000);
                return (
                  <View key={session.id} style={s.sessionItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.sessionStatus, { fontFamily: mono }]}>
                        {session.status === "running" ? "🔄" : "✅"} {session.status.toUpperCase()}
                      </Text>
                      <Text style={[s.sessionMeta, { fontFamily: mono }]}>
                        Tools: {session.toolsProcessed}/{tools.length} | Accuracy: {session.accuracy.toFixed(1)}%
                      </Text>
                      <Text style={[s.sessionMeta, { fontFamily: mono }]}>
                        Duration: {durationSec}s
                      </Text>
                    </View>
                    {session.status === "running" && (
                      <ActivityIndicator color="#00ff88" size="small" />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Tool Management */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>🔧 TOOL MANAGEMENT</Text>

          {/* Search */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search tools..."
            placeholderTextColor="#4b5563"
            style={[s.searchInput, { fontFamily: mono }]}
          />

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <Pressable
              onPress={() => setSelectedCategory(null)}
              style={[
                s.categoryTag,
                !selectedCategory && s.categoryTagActive,
              ]}
            >
              <Text style={[s.categoryTagText, { fontFamily: mono }]}>All</Text>
            </Pressable>
            {categories.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                style={[
                  s.categoryTag,
                  selectedCategory === cat && s.categoryTagActive,
                ]}
              >
                <Text style={[s.categoryTagText, { fontFamily: mono }]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tools List */}
          <FlatList
            data={filteredTools}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View style={s.toolItem}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.toolName, { fontFamily: mono }]}>{item.name}</Text>
                  <Text style={[s.toolCategory, { fontFamily: mono }]}>{item.category}</Text>
                  <Text style={[s.toolDesc, { fontFamily: mono }]}>{item.description}</Text>
                  <Text style={[s.toolVersion, { fontFamily: mono }]}>v{item.version}</Text>
                </View>
                <Pressable
                  onPress={() => toggleTool(item.id)}
                  style={[
                    s.toolToggle,
                    item.enabled && s.toolToggleActive,
                  ]}
                >
                  <Text style={[s.toolToggleText, { fontFamily: mono }]}>
                    {item.enabled ? "✓" : "○"}
                  </Text>
                </Pressable>
              </View>
            )}
          />
        </View>

        {/* Statistics */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📊 STATISTICS</Text>

          {[
            ["Error Rate", `${metrics.errorRate.toFixed(2)}%`],
            ["Total Sessions", metrics.totalTrainingSessions.toString()],
            ["Last Training", new Date(metrics.lastTrainingTime).toLocaleString()],
            ["Status", "ONLINE"],
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#00ff88",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  metricLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#00ff88",
  },
  trainButton: {
    backgroundColor: "#ff00ff",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  trainButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a0e17",
  },
  sessionsContainer: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    padding: 8,
    gap: 6,
  },
  sessionsTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#00ff88",
  },
  sessionItem: {
    backgroundColor: "#111827",
    borderLeftWidth: 3,
    borderLeftColor: "#00ff88",
    padding: 8,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionStatus: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  sessionMeta: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: "#0d1117",
    color: "#e0e7ff",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: "#0d1117",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
  },
  categoryTagActive: {
    backgroundColor: "#00ff88",
    borderColor: "#00ff88",
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  toolItem: {
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
  toolName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#00ff88",
  },
  toolCategory: {
    fontSize: 9,
    color: "#00e5ff",
    marginTop: 2,
  },
  toolDesc: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  toolVersion: {
    fontSize: 8,
    color: "#4b5563",
    marginTop: 2,
  },
  toolToggle: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  toolToggleActive: {
    backgroundColor: "#00ff88",
    borderColor: "#00ff88",
  },
  toolToggleText: {
    fontSize: 14,
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
    fontSize: 10,
    color: "#6b7280",
  },
  statValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
});
