import { useCallback, useMemo, useState } from "react";
import {
  Text,
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks, type Task } from "@/lib/task-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + "40" }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MissionCard({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const priorityColors: Record<string, string> = {
    critical: "#ff00ff",
    high: "#ff3b5c",
    medium: "#fbbf24",
    low: "#00ff88",
  };
  const color = priorityColors[task.priority] || "#00ff88";

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onComplete(task.id);
      }}
      style={({ pressed }) => [styles.missionCard, pressed && { opacity: 0.7, transform: [{ scale: 0.97 }] }]}
    >
      <View style={[styles.priorityDot, { backgroundColor: color }]} />
      <View style={styles.missionContent}>
        <Text style={styles.missionTitle} numberOfLines={1}>
          {task.title}
        </Text>
        <Text style={styles.missionMeta}>
          {task.priority.toUpperCase()} • {task.category.toUpperCase()}
        </Text>
      </View>
      <View style={[styles.missionStatus, { borderColor: color }]}>
        <Text style={[styles.missionStatusText, { color }]}>ACTIVE</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { state, completeTask } = useTasks();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const activeTasks = useMemo(() => state.tasks.filter((t) => !t.completed), [state.tasks]);
  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return state.tasks.filter((t) => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  }, [state.tasks]);

  const todayActivities = useMemo(() => {
    const today = new Date().toDateString();
    return state.activities.filter((a) => new Date(a.timestamp).toDateString() === today).length;
  }, [state.activities]);

  // Calculate streak (consecutive days with completed tasks)
  const streak = useMemo(() => {
    const completedDates = new Set(
      state.tasks
        .filter((t) => t.completed && t.completedAt)
        .map((t) => new Date(t.completedAt!).toDateString())
    );
    let count = 0;
    const d = new Date();
    while (completedDates.has(d.toDateString())) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [state.tasks]);

  const topMissions = useMemo(() => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return [...activeTasks]
      .sort((a, b) => (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3))
      .slice(0, 5);
  }, [activeTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleComplete = useCallback(
    (id: string) => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      completeTask(id);
    },
    [completeTask]
  );

  const dailyGoalProgress = Math.min((completedToday / Math.max(activeTasks.length + completedToday, 1)) * 100, 100);

  const headerComponent = (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>COMMAND CENTER</Text>
          <Text style={styles.headerSubtitle}>WHOAMISec Pro v8.6</Text>
        </View>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ONLINE</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard label="ACTIVE" value={String(activeTasks.length)} color="#00ff88" />
        <StatCard label="DONE TODAY" value={String(completedToday)} color="#00e5ff" />
        <StatCard label="STREAK" value={`${streak}d`} color="#e5ff00" />
        <StatCard label="OPS TODAY" value={String(todayActivities)} color="#ff00ff" />
      </View>

      {/* System Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>◆ SYSTEM STATUS</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Daily Goal</Text>
            <Text style={styles.progressValue}>{Math.round(dailyGoalProgress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${dailyGoalProgress}%` }]} />
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Neural Mesh Sync</Text>
            <Text style={styles.progressValue}>99.9%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "99.9%", backgroundColor: "#ff00ff" }]} />
          </View>
        </View>
      </View>

      {/* Active Missions Header */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>◆ ACTIVE MISSIONS</Text>
          <Pressable
            onPress={() => router.push("./tasks")}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.viewAllText}>VIEW ALL →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

  const emptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>⬡</Text>
      <Text style={styles.emptyText}>NO ACTIVE MISSIONS</Text>
      <Text style={styles.emptySubtext}>Deploy new tasks from the Missions tab</Text>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-[#0a0e17]">
      <FlatList
        data={topMissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MissionCard task={item} onComplete={handleComplete} />}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00ff88" />
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00ff8815",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00ff8830",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00ff88",
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#00ff88",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00e5ff",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#00ff88",
    letterSpacing: 1,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 11,
    color: "#e0e7ff",
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#1e293b",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00ff88",
    borderRadius: 2,
  },
  missionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  missionContent: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e0e7ff",
  },
  missionMeta: {
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 3,
  },
  missionStatus: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  missionStatusText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    color: "#1e293b",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 2,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 6,
  },
});
