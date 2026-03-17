import { useMemo } from "react";
import { Text, View, FlatList, StyleSheet, Platform } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks } from "@/lib/task-context";

interface ActivityLine {
  id: string;
  timestamp: string;
  type: "created" | "completed" | "deleted";
  taskTitle: string;
  timeString: string;
}

function ActivityEntry({ entry }: { entry: ActivityLine }) {
  const typeColors: Record<string, string> = {
    created: "#00e5ff",
    completed: "#00ff88",
    deleted: "#ff3b5c",
  };

  const typeLabels: Record<string, string> = {
    created: "CREATED",
    completed: "COMPLETED",
    deleted: "DELETED",
  };

  const color = typeColors[entry.type];
  const label = typeLabels[entry.type];

  return (
    <View style={styles.entry}>
      <Text style={styles.timestamp}>[{entry.timeString}]</Text>
      <Text style={[styles.typeLabel, { color }]}>{label}</Text>
      <Text style={styles.taskName} numberOfLines={1}>
        {entry.taskTitle}
      </Text>
    </View>
  );
}

export default function ActivityLogScreen() {
  const { state } = useTasks();

  const activityLines = useMemo(() => {
    return state.activities
      .map((activity) => ({
        id: activity.id,
        timestamp: activity.timestamp,
        type: activity.type,
        taskTitle: activity.taskTitle,
        timeString: new Date(activity.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [state.activities]);

  const todayActivities = useMemo(() => {
    const today = new Date().toDateString();
    return activityLines.filter((a) => new Date(a.timestamp).toDateString() === today);
  }, [activityLines]);

  const statsText = useMemo(() => {
    const created = todayActivities.filter((a) => a.type === "created").length;
    const completed = todayActivities.filter((a) => a.type === "completed").length;
    const deleted = todayActivities.filter((a) => a.type === "deleted").length;
    return `CREATED: ${created} | COMPLETED: ${completed} | DELETED: ${deleted}`;
  }, [todayActivities]);

  const headerComponent = (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEURAL CONSOLE</Text>
        <Text style={styles.headerSubtitle}>Activity Log & Event History</Text>
      </View>

      <View style={styles.sessionInfo}>
        <Text style={styles.sessionLabel}>SESSION_ID:</Text>
        <Text style={styles.sessionValue}>WHOAMI_CONSOLE_{Date.now().toString(36).toUpperCase()}</Text>
      </View>

      <View style={styles.statsBox}>
        <Text style={styles.statsText}>{statsText}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.logTitle}>◆ TODAY'S OPERATIONS</Text>
    </View>
  );

  const emptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>▓</Text>
      <Text style={styles.emptyText}>NO ACTIVITY RECORDED</Text>
      <Text style={styles.emptySubtext}>Complete tasks to see them in the log</Text>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-[#0a0e17]">
      <FlatList
        data={todayActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityEntry entry={item} />}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={styles.listContent}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#00e5ff",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#6b7280",
    letterSpacing: 1,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  sessionInfo: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  sessionLabel: {
    fontSize: 9,
    color: "#6b7280",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  sessionValue: {
    fontSize: 10,
    color: "#00e5ff",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginTop: 4,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  statsBox: {
    backgroundColor: "#0a0e17",
    borderWidth: 1,
    borderColor: "#00ff8830",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 9,
    color: "#00ff88",
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  divider: {
    height: 1,
    backgroundColor: "#1e293b",
    marginVertical: 12,
  },
  logTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ff00ff",
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  entry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#111827",
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  timestamp: {
    fontSize: 9,
    color: "#6b7280",
    fontWeight: "600",
    letterSpacing: 0.5,
    marginRight: 8,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    marginRight: 8,
    minWidth: 70,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  taskName: {
    flex: 1,
    fontSize: 11,
    color: "#e0e7ff",
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 2,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  emptySubtext: {
    fontSize: 11,
    color: "#4b5563",
    marginTop: 6,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
});
