import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useModules } from "@/lib/modules-context";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

interface SystemMetrics {
  activeNodes: number;
  networkLoad: number;
  threatLevel: string;
  uptime: string;
  cpuUsage: number;
  memoryUsage: string;
  neuralMeshSync: string;
  timestamp: string;
}

export default function ControlCenterScreen() {
  const colors = useColors();
  const { setActiveModule } = useModules();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);

  // Fetch metrics from server
  const metricsQuery = (trpc as any).metrics?.getSystemMetrics?.useQuery?.() || { data: null, refetch: () => {} };

  useEffect(() => {
    if (metricsQuery?.data) {
      setMetrics(metricsQuery.data);
    }
  }, [metricsQuery?.data]);

  // Refresh metrics every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (metricsQuery?.refetch) {
        metricsQuery.refetch();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [metricsQuery]);

  const getThreatColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "#00ff88";
      case "MEDIUM":
        return "#ffff00";
      case "ELEVATED":
        return "#ff6b00";
      case "HIGH":
        return "#ff3b5c";
      case "CRITICAL":
        return "#ff0000";
      default:
        return "#00e5ff";
    }
  };

  return (
    <ScreenContainer className="p-4 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-primary mb-1">COMMAND CENTER</Text>
          <Text className="text-sm text-muted">WHOAMISEC Pro v8.6</Text>
        </View>

        {/* Status Badge */}
        <View className="mb-6 flex-row items-center gap-2">
          <View className="w-2 h-2 rounded-full bg-success" />
          <Text className="text-xs text-success font-mono">● ONLINE</Text>
        </View>

        {/* Key Metrics Grid */}
        <View className="mb-6 gap-3">
          <View className="flex-row gap-3">
            {/* Active Nodes */}
            <View className="flex-1 border border-border rounded-lg p-4 bg-surface">
              <Text className="text-xs text-muted mb-2 font-mono">ACTIVE</Text>
              <Text className="text-2xl font-bold text-primary">
                {metrics?.activeNodes.toLocaleString() || "0"}
              </Text>
            </View>

            {/* Network Load */}
            <View className="flex-1 border border-border rounded-lg p-4 bg-surface">
              <Text className="text-xs text-muted mb-2 font-mono">LOAD</Text>
              <Text className="text-2xl font-bold text-accent">
                {metrics?.networkLoad.toFixed(1) || "0"}%
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            {/* Threat Level */}
            <View className="flex-1 border border-border rounded-lg p-4 bg-surface">
              <Text className="text-xs text-muted mb-2 font-mono">THREAT</Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: getThreatColor(metrics?.threatLevel || "UNKNOWN") }}
              >
                {metrics?.threatLevel || "?"}
              </Text>
            </View>

            {/* Uptime */}
            <View className="flex-1 border border-border rounded-lg p-4 bg-surface">
              <Text className="text-xs text-muted mb-2 font-mono">UPTIME</Text>
              <Text className="text-lg font-bold text-secondary">{metrics?.uptime || "0d"}</Text>
            </View>
          </View>
        </View>

        {/* System Core Status */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ SYSTEM CORE STATUS</Text>
          <View className="border border-border rounded-lg p-4 bg-surface gap-3">
            {/* CPU Usage */}
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-muted font-mono">CPU Usage</Text>
                <Text className="text-xs text-secondary font-mono">{metrics?.cpuUsage || 0}%</Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-secondary"
                  style={{ width: `${metrics?.cpuUsage || 0}%` }}
                />
              </View>
            </View>

            {/* Memory Allocation */}
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-muted font-mono">Memory Allocation</Text>
                <Text className="text-xs text-secondary font-mono">{metrics?.memoryUsage}</Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full bg-secondary"
                  style={{ width: `${((metrics?.cpuUsage || 0) * 0.8) % 100}%` }}
                />
              </View>
            </View>

            {/* Neural Mesh Sync */}
            <View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-muted font-mono">Neural Mesh Sync</Text>
                <Text className="text-xs text-success font-mono">{metrics?.neuralMeshSync}%</Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View className="h-full bg-success" style={{ width: "99.9%" }} />
              </View>
            </View>
          </View>
        </View>

        {/* Global Operations */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ GLOBAL OPERATIONS</Text>
          <View className="gap-2">
            {/* Firewall Bypass */}
            <View className="border border-border rounded-lg p-3 bg-surface flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-muted font-mono">Firewall Bypass</Text>
                <Text className="text-xs text-foreground">Target: Fortune 500 Cluster</Text>
              </View>
              <View className="px-2 py-1 bg-success rounded">
                <Text className="text-xs font-bold text-background">ACTIVE</Text>
              </View>
            </View>

            {/* OSINT Extraction */}
            <View className="border border-border rounded-lg p-3 bg-surface flex-row justify-between items-center">
              <View>
                <Text className="text-xs text-muted font-mono">OSINT Extraction</Text>
                <Text className="text-xs text-foreground">Source: Dark Web Leaks</Text>
              </View>
              <View className="px-2 py-1 bg-warning rounded">
                <Text className="text-xs font-bold text-background">SYNCING</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Commands */}
        <View className="mb-6">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ RECENT COMMANDS</Text>
          <View className="border border-border rounded-lg p-3 bg-surface font-mono">
            <Text className="text-xs text-success mb-2">WHOAMI@C2:~$ initiate --mode stealth --target global</Text>
            <Text className="text-xs text-info mb-1">
              [2026-03-17 09:30:01] [SYSTEM] Neural mesh synchronized with 842k nodes.
            </Text>
            <Text className="text-xs text-warning">
              [2026-03-17 09:31:45] [OSINT] New breach detected: "Project_X_Internal".
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="gap-2">
          <Pressable
            onPress={() => metricsQuery?.refetch?.()}
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#00cc6a" : "#00ff88",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-sm font-bold text-background">REFRESH METRICS</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
