import { useCallback, useMemo, useState } from "react";
import {
  Text,
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useTasks, type Priority, type Category } from "@/lib/task-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

type FilterType = "all" | "active" | "completed";

function TaskCard({
  task,
  onComplete,
  onDelete,
}: {
  task: any;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const priorityColors: Record<string, string> = {
    critical: "#ff00ff",
    high: "#ff3b5c",
    medium: "#fbbf24",
    low: "#00ff88",
  };
  const color = priorityColors[task.priority] || "#00ff88";

  return (
    <View style={styles.taskCard}>
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onComplete(task.id);
        }}
        style={({ pressed }) => [
          styles.taskCheckbox,
          { borderColor: color, backgroundColor: task.completed ? color + "20" : "transparent" },
          pressed && { opacity: 0.7 },
        ]}
      >
        {task.completed && <IconSymbol name="checkmark.circle.fill" size={20} color={color} />}
      </Pressable>

      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            task.completed && { textDecorationLine: "line-through", color: "#6b7280" },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.taskMeta}>
          <View style={[styles.categoryTag, { borderColor: color }]}>
            <Text style={[styles.categoryText, { color }]}>{task.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          onDelete(task.id);
        }}
        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.6 }]}
      >
        <IconSymbol name="trash.fill" size={18} color="#ff3b5c" />
      </Pressable>
    </View>
  );
}

function AddTaskModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, priority: Priority, category: Category) => void;
}) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("personal");

  const handleAdd = () => {
    if (title.trim()) {
      onAdd(title, priority, category);
      setTitle("");
      setPriority("medium");
      setCategory("personal");
      onClose();
    }
  };

  const priorities: Priority[] = ["low", "medium", "high", "critical"];
  const categories: Category[] = ["work", "personal", "health", "learning", "other"];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>DEPLOY NEW MISSION</Text>
            <Pressable onPress={onClose} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#ff3b5c" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.inputLabel}>MISSION TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter mission title..."
              placeholderTextColor="#6b7280"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <Text style={styles.inputLabel}>PRIORITY LEVEL</Text>
            <View style={styles.priorityGrid}>
              {priorities.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setPriority(p)}
                  style={[
                    styles.priorityButton,
                    priority === p && {
                      backgroundColor: "#ff00ff20",
                      borderColor: "#ff00ff",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      priority === p && { color: "#ff00ff" },
                    ]}
                  >
                    {p.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {categories.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.categoryButton,
                    category === c && {
                      backgroundColor: "#00ff8820",
                      borderColor: "#00ff88",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === c && { color: "#00ff88" },
                    ]}
                  >
                    {c.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.cancelButtonText}>ABORT</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              disabled={!title.trim()}
              style={({ pressed }) => [
                styles.deployButton,
                !title.trim() && { opacity: 0.5 },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.deployButtonText}>DEPLOY</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TasksScreen() {
  const { state, addTask, completeTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState<FilterType>("all");
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks;
    if (filter === "active") {
      tasks = tasks.filter((t) => !t.completed);
    } else if (filter === "completed") {
      tasks = tasks.filter((t) => t.completed);
    }
    return tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [state.tasks, filter]);

  const handleAddTask = useCallback(
    (title: string, priority: Priority, category: Category) => {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addTask(title, priority, category);
    },
    [addTask]
  );

  const headerComponent = (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MISSIONS CONTROL</Text>
        <Text style={styles.headerSubtitle}>Task Management System</Text>
      </View>

      <View style={styles.filterRow}>
        {(["all", "active", "completed"] as FilterType[]).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const emptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>◆</Text>
      <Text style={styles.emptyText}>NO MISSIONS</Text>
      <Text style={styles.emptySubtext}>
        {filter === "completed"
          ? "Complete tasks to see them here"
          : "Deploy new missions to get started"}
      </Text>
    </View>
  );

  return (
    <ScreenContainer containerClassName="bg-[#0a0e17]">
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        )}
        ListHeaderComponent={headerComponent}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        onPress={() => setModalVisible(true)}
        style={({ pressed }) => [
          styles.fab,
          pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 },
        ]}
      >
        <IconSymbol name="plus.circle.fill" size={56} color="#00ff88" />
      </Pressable>

      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddTask}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
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
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "transparent",
  },
  filterButtonActive: {
    backgroundColor: "#00ff8820",
    borderColor: "#00ff88",
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 1,
    textAlign: "center",
  },
  filterButtonTextActive: {
    color: "#00ff88",
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  taskCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e0e7ff",
  },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  categoryTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  priorityText: {
    fontSize: 9,
    color: "#6b7280",
    fontWeight: "600",
  },
  deleteButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: "#00ff8830",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#00ff88",
    letterSpacing: 1.5,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00e5ff",
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#0a0e17",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#e0e7ff",
    fontSize: 14,
    marginBottom: 16,
  },
  priorityGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0a0e17",
  },
  priorityButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    textAlign: "center",
    letterSpacing: 1,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    minWidth: "48%",
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0a0e17",
  },
  categoryButtonText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6b7280",
    textAlign: "center",
    letterSpacing: 1,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ff3b5c",
    backgroundColor: "#ff3b5c15",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ff3b5c",
    textAlign: "center",
    letterSpacing: 1,
  },
  deployButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#00ff88",
  },
  deployButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0a0e17",
    textAlign: "center",
    letterSpacing: 1,
  },
});
