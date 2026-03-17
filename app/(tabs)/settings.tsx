import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function SettingsScreen() {
  return (
    <ScreenContainer className="bg-background flex flex-col">
      <View className="px-4 pt-4 pb-3 border-b border-border">
        <Text className="text-2xl font-bold text-primary mb-1 font-mono">KERNEL CONFIG</Text>
        <Text className="text-xs text-muted">System Configuration</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
        {/* App Info */}
        <View className="border border-border rounded-lg p-4 bg-surface">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ APP INFO</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Version</Text>
              <Text className="text-xs text-foreground font-mono">8.6.0-PRO</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Build</Text>
              <Text className="text-xs text-foreground font-mono">20260317</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Platform</Text>
              <Text className="text-xs text-foreground font-mono">React Native</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Status</Text>
              <Text className="text-xs text-success font-mono">ONLINE</Text>
            </View>
          </View>
        </View>

        {/* System Status */}
        <View className="border border-border rounded-lg p-4 bg-surface">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ SYSTEM STATUS</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Neural Mesh</Text>
              <Text className="text-xs text-success font-mono">SYNCHRONIZED</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">C2 Connection</Text>
              <Text className="text-xs text-success font-mono">ACTIVE</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Encryption</Text>
              <Text className="text-xs text-success font-mono">AES-256</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Authentication</Text>
              <Text className="text-xs text-success font-mono">VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Features */}
        <View className="border border-border rounded-lg p-4 bg-surface">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ FEATURES</Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground">WHOAMI-GPT AI Chat</Text>
              <View className="px-2 py-1 bg-success rounded">
                <Text className="text-xs font-bold text-background">ENABLED</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground">Neural Console</Text>
              <View className="px-2 py-1 bg-success rounded">
                <Text className="text-xs font-bold text-background">ENABLED</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground">Module System</Text>
              <View className="px-2 py-1 bg-success rounded">
                <Text className="text-xs font-bold text-background">ENABLED</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-foreground">Real-time Metrics</Text>
              <View className="px-2 py-1 bg-success rounded">
                <Text className="text-xs font-bold text-background">ENABLED</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View className="border border-border rounded-lg p-4 bg-surface">
          <Text className="text-sm font-bold text-primary mb-3 font-mono">◆ STATISTICS</Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Modules Available</Text>
              <Text className="text-xs text-secondary font-mono">25+</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Tools Integrated</Text>
              <Text className="text-xs text-secondary font-mono">370+</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Active Sessions</Text>
              <Text className="text-xs text-secondary font-mono">1</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Uptime</Text>
              <Text className="text-xs text-secondary font-mono">142d 12h</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="gap-2">
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#00cc6a" : "#00ff88",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-sm font-bold text-background">REFRESH SYSTEM</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? "#cc0000" : "#ff3b5c",
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: "center",
              },
            ]}
          >
            <Text className="text-sm font-bold text-background">LOGOUT</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
