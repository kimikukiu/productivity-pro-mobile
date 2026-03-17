import { useCallback, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks } from "@/lib/task-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Constants from "expo-constants";

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SettingItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && { opacity: 0.7 },
      ]}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        {value && <Text style={styles.settingValue}>{value}</Text>}
      </View>
      {onPress && (
        <IconSymbol name="chevron.right" size={18} color="#6b7280" />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { state, clearCompleted } = useTasks();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((t) => t.completed).length;
  const activeTasks = totalTasks - completedTasks;

  const handleClearCompleted = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      "CLEAR COMPLETED MISSIONS",
      `This will delete ${completedTasks} completed tasks. This action cannot be undone.`,
      [
        { text: "ABORT", onPress: () => {}, style: "cancel" },
        {
          text: "CONFIRM",
          onPress: () => {
            clearCompleted();
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            Alert.alert("SUCCESS", "Completed missions cleared from system.");
          },
          style: "destructive",
        },
      ]
    );
  }, [completedTasks, clearCompleted]);

  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const buildNumber = Constants.expoConfig?.ios?.buildNumber || "1";

  return (
    <ScreenContainer containerClassName="bg-[#0a0e17]">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SYSTEM CONFIG</Text>
          <Text style={styles.headerSubtitle}>Configuration & Information</Text>
        </View>

        <SettingSection title="◆ SYSTEM STATISTICS">
          <SettingItem label="Total Missions" value={String(totalTasks)} />
          <SettingItem label="Active Missions" value={String(activeTasks)} />
          <SettingItem label="Completed Missions" value={String(completedTasks)} />
          <SettingItem
            label="Completion Rate"
            value={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`}
          />
          <SettingItem label="Total Events Logged" value={String(state.activities.length)} />
        </SettingSection>

        <SettingSection title="◆ APP INFORMATION">
          <SettingItem label="App Name" value="WHOAMISec Productivity Pro" />
          <SettingItem label="Version" value={`v${appVersion}`} />
          <SettingItem label="Build" value={`#${buildNumber}`} />
          <SettingItem label="Platform" value={Platform.OS.toUpperCase()} />
          <SettingItem label="Status" value="OPERATIONAL" />
        </SettingSection>

        <SettingSection title="◆ DATA MANAGEMENT">
          <Pressable
            onPress={handleClearCompleted}
            disabled={completedTasks === 0}
            style={({ pressed }) => [
              styles.dangerButton,
              completedTasks === 0 && { opacity: 0.4 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <IconSymbol name="trash.fill" size={18} color="#ff3b5c" />
            <Text style={styles.dangerButtonText}>CLEAR COMPLETED MISSIONS</Text>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>DATA STORAGE</Text>
            <Text style={styles.infoText}>
              All data is stored locally on your device using AsyncStorage. No data is sent to external servers.
            </Text>
          </View>
        </SettingSection>

        <SettingSection title="◆ FEATURES">
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: "#00ff88" }]} />
              <Text style={styles.featureText}>Task Management System</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: "#ff00ff" }]} />
              <Text style={styles.featureText}>WHOAMI-GPT AI Assistant</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: "#00e5ff" }]} />
              <Text style={styles.featureText}>Activity Logging & Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: "#fbbf24" }]} />
              <Text style={styles.featureText}>Priority-Based Sorting</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: "#e5ff00" }]} />
              <Text style={styles.featureText}>Real-Time Notifications</Text>
            </View>
          </View>
        </SettingSection>

        <SettingSection title="◆ ABOUT">
          <View style={styles.aboutBox}>
            <Text style={styles.aboutTitle}>WHOAMISec Productivity Pro</Text>
            <Text style={styles.aboutVersion}>v{appVersion}</Text>
            <Text style={styles.aboutDescription}>
              A personal productivity tool combining advanced task management with AI-powered assistance. Built with React Native & Expo for optimal mobile performance.
            </Text>
            <Text style={styles.aboutFooter}>
              © 2026 WHOAMISec | All rights reserved
            </Text>
          </View>
        </SettingSection>

        <View style={styles.spacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#00ff88",
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#00e5ff",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e0e7ff",
  },
  settingValue: {
    fontSize: 11,
    color: "#00ff88",
    fontWeight: "700",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff3b5c15",
    borderRadius: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ff3b5c40",
    gap: 8,
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff3b5c",
    letterSpacing: 1,
  },
  infoBox: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00e5ff",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 11,
    color: "#9ca3af",
    lineHeight: 16,
  },
  featureList: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  featureText: {
    fontSize: 11,
    color: "#e0e7ff",
    fontWeight: "500",
  },
  aboutBox: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#00ff88",
    letterSpacing: 1,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 8,
    letterSpacing: 1,
  },
  aboutDescription: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 16,
    marginBottom: 8,
  },
  aboutFooter: {
    fontSize: 9,
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  spacer: {
    height: 20,
  },
});
