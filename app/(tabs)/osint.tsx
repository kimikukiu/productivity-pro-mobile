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
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import * as Haptics from "expo-haptics";

// ============================================================
// TYPES
// ============================================================

interface OSINTTool {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  status: "idle" | "running" | "completed" | "error";
  lastRun?: number;
  results?: string;
}

interface OSINTScan {
  id: string;
  target: string;
  tools: string[];
  startTime: number;
  endTime?: number;
  status: "running" | "completed" | "failed";
  results: Record<string, unknown>;
}

// ============================================================
// OSINT TOOLS DATABASE
// ============================================================

const OSINT_TOOLS: OSINTTool[] = [
  // Reconnaissance
  {
    id: "osint-domain-recon",
    name: "Domain Reconnaissance",
    category: "Reconnaissance",
    description: "Comprehensive domain analysis, DNS records, WHOIS, subdomains",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-ip-intel",
    name: "IP Intelligence",
    category: "Reconnaissance",
    description: "IP geolocation, ASN lookup, reverse DNS, network mapping",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-email-enum",
    name: "Email Enumeration",
    category: "Reconnaissance",
    description: "Email discovery, verification, breach database search",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-social-scrape",
    name: "Social Media Scraping",
    category: "Reconnaissance",
    description: "Profile analysis, public data extraction, follower enumeration",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-dns-enum",
    name: "DNS Enumeration",
    category: "Reconnaissance",
    description: "DNS zone transfer, brute force, record enumeration",
    enabled: true,
    status: "idle",
  },

  // Vulnerability Research
  {
    id: "osint-cve-search",
    name: "CVE Search",
    category: "Vulnerability",
    description: "Search CVE databases, vulnerability scoring, exploit availability",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-shodan",
    name: "Shodan Integration",
    category: "Vulnerability",
    description: "IoT device discovery, exposed services, vulnerability detection",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-censys",
    name: "Censys Integration",
    category: "Vulnerability",
    description: "Certificate analysis, exposed hosts, network exposure assessment",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-hunter",
    name: "Hunter.io Integration",
    category: "Vulnerability",
    description: "Email finder, domain intelligence, company research",
    enabled: true,
    status: "idle",
  },

  // Threat Intelligence
  {
    id: "osint-threat-intel",
    name: "Threat Intelligence",
    category: "Threat",
    description: "Malware analysis, IoC lookup, threat actor profiling",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-breach-check",
    name: "Breach Database Check",
    category: "Threat",
    description: "Search compromised databases, credential exposure detection",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-dark-web",
    name: "Dark Web Monitoring",
    category: "Threat",
    description: "Monitor dark web mentions, leak detection, threat alerts",
    enabled: true,
    status: "idle",
  },

  // Passive Reconnaissance
  {
    id: "osint-wayback",
    name: "Wayback Machine",
    category: "Passive",
    description: "Historical website snapshots, content changes, archive analysis",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-ssl-cert",
    name: "SSL Certificate Analysis",
    category: "Passive",
    description: "Certificate transparency logs, domain history, alternative names",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-whois",
    name: "WHOIS Lookup",
    category: "Passive",
    description: "Domain registration info, registrar details, contact information",
    enabled: true,
    status: "idle",
  },

  // Advanced Analysis
  {
    id: "osint-graph-analysis",
    name: "Graph Analysis",
    category: "Advanced",
    description: "Entity relationship mapping, connection analysis, network visualization",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-ml-clustering",
    name: "ML Clustering",
    category: "Advanced",
    description: "Pattern detection, anomaly identification, data clustering",
    enabled: true,
    status: "idle",
  },
  {
    id: "osint-nlp-analysis",
    name: "NLP Analysis",
    category: "Advanced",
    description: "Text analysis, sentiment analysis, entity extraction",
    enabled: true,
    status: "idle",
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function OSINTScreen() {
  const [tools, setTools] = useState<OSINTTool[]>(OSINT_TOOLS);
  const [scans, setScans] = useState<OSINTScan[]>([]);
  const [targetInput, setTargetInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const haptic = useCallback((type: "light" | "success" | "error") => {
    if (Platform.OS === "web") return;
    if (type === "success") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (type === "error") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ============================================================
  // SCAN LOGIC
  // ============================================================

  const startScan = useCallback(() => {
    haptic("light");

    if (!targetInput.trim()) {
      Alert.alert("Error", "Please enter a target (domain, IP, or email)");
      return;
    }

    if (isScanning) {
      Alert.alert("Scanning", "A scan is already in progress");
      return;
    }

    setIsScanning(true);

    const enabledTools = tools.filter((t) => t.enabled).map((t) => t.id);

    const scan: OSINTScan = {
      id: `scan-${Date.now()}`,
      target: targetInput,
      tools: enabledTools,
      startTime: Date.now(),
      status: "running",
      results: {},
    };

    setScans((prev) => [scan, ...prev]);

    // Simulate scan progress
    let toolsCompleted = 0;
    const interval = setInterval(() => {
      toolsCompleted += Math.floor(Math.random() * 2) + 1;

      if (toolsCompleted >= enabledTools.length) {
        toolsCompleted = enabledTools.length;
        clearInterval(interval);

        const updatedScan: OSINTScan = {
          ...scan,
          endTime: Date.now(),
          status: "completed",
          results: {
            domains_found: Math.floor(Math.random() * 50) + 10,
            emails_found: Math.floor(Math.random() * 100) + 20,
            ips_found: Math.floor(Math.random() * 30) + 5,
            vulnerabilities: Math.floor(Math.random() * 20) + 2,
            threat_level: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)],
          },
        };

        setScans((prev) =>
          prev.map((s) => (s.id === scan.id ? updatedScan : s))
        );

        setIsScanning(false);
        haptic("success");
        Alert.alert("✅ Scan Complete", `Target: ${targetInput}\nTools: ${toolsCompleted}\nTime: ${Math.floor((updatedScan.endTime! - scan.startTime) / 1000)}s`);
      } else {
        setScans((prev) =>
          prev.map((s) =>
            s.id === scan.id
              ? {
                  ...s,
                  results: {
                    ...s.results,
                    progress: `${toolsCompleted}/${enabledTools.length}`,
                  },
                }
              : s
          )
        );
      }
    }, 800);
  }, [targetInput, tools, isScanning, haptic]);

  const toggleTool = useCallback(
    (toolId: string) => {
      haptic("light");
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, enabled: !t.enabled } : t))
      );
    },
    [haptic]
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
          <Text style={[s.title, { fontFamily: mono }]}>🔍 OSINT RECONNAISSANCE</Text>
          <Text style={[s.subtitle, { fontFamily: mono }]}>Open Source Intelligence Gathering</Text>
        </View>

        {/* Target Input */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📍 TARGET</Text>
          <TextInput
            value={targetInput}
            onChangeText={setTargetInput}
            placeholder="Enter domain, IP, or email..."
            placeholderTextColor="#4b5563"
            style={[s.targetInput, { fontFamily: mono }]}
          />
          <Pressable
            onPress={startScan}
            disabled={isScanning}
            style={({ pressed }) => [
              s.scanButton,
              isScanning && { opacity: 0.6 },
              pressed && { opacity: 0.8 },
            ]}
          >
            {isScanning ? (
              <ActivityIndicator color="#0a0e17" />
            ) : (
              <Text style={[s.scanButtonText, { fontFamily: mono }] as any}>
                🚀 START OSINT SCAN
              </Text>
            )}
          </Pressable>
        </View>

        {/* Active Scans */}
        {scans.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, { fontFamily: mono }]}>📊 ACTIVE SCANS</Text>
            {scans.slice(0, 3).map((scan) => {
              const duration = (scan.endTime || Date.now()) - scan.startTime;
              const durationSec = Math.floor(duration / 1000);
              return (
                <View key={scan.id} style={s.scanItem}>
                  <View style={{ flex: 1 } as any}>
                    <Text style={StyleSheet.flatten([s.scanTarget, { fontFamily: mono }]) as any}>
                      {scan.status === "running" ? "🔄" : "✅"} {scan.target}
                    </Text>
                    <Text style={StyleSheet.flatten([s.scanMeta, { fontFamily: mono }]) as any}>
                      Tools: {scan.tools.length} | Status: {scan.status.toUpperCase()}
                    </Text>
                    {scan.results.progress ? (
                      <Text style={[s.scanMeta, { fontFamily: mono }] as any}>
                        Progress: {scan.results.progress as string}
                      </Text>
                    ) : null}
                    {scan.results.threat_level ? (
                      <Text style={[s.scanMeta, { fontFamily: mono }] as any}>
                        Threat: {scan.results.threat_level as string} | Duration: {durationSec}s
                      </Text>
                    ) : null}
                  </View>
                  {scan.status === "running" && (
                    <ActivityIndicator color="#00ff88" size="small" />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Tool Management */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>🔧 OSINT TOOLS</Text>

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
                </View>
                <Switch
                  value={item.enabled}
                  onValueChange={() => toggleTool(item.id)}
                  trackColor={{ false: "#1e293b", true: "#00ff88" }}
                  thumbColor={item.enabled ? "#0a0e17" : "#4b5563"}
                />
              </View>
            )}
          />
        </View>

        {/* Statistics */}
        <View style={s.section}>
          <Text style={[s.sectionTitle, { fontFamily: mono }]}>📈 STATISTICS</Text>

          {[
            ["Total Tools", tools.length.toString()],
            ["Enabled Tools", tools.filter((t) => t.enabled).length.toString()],
            ["Total Scans", scans.length.toString()],
            ["Completed Scans", scans.filter((s) => s.status === "completed").length.toString()],
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
    fontSize: 12,
    fontWeight: "bold",
    color: "#00e5ff",
  },
  targetInput: {
    backgroundColor: "#0d1117",
    color: "#e0e7ff",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 11,
    marginBottom: 8,
  },
  scanButton: {
    backgroundColor: "#00e5ff",
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0a0e17",
  },
  scanItem: {
    backgroundColor: "#0d1117",
    borderLeftWidth: 3,
    borderLeftColor: "#00e5ff",
    padding: 10,
    borderRadius: 4,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanTarget: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#e0e7ff",
  },
  scanMeta: {
    fontSize: 9,
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
    backgroundColor: "#00e5ff",
    borderColor: "#00e5ff",
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
    color: "#00e5ff",
  },
  toolCategory: {
    fontSize: 9,
    color: "#00ff88",
    marginTop: 2,
  },
  toolDesc: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
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
