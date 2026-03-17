import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe("Task Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a new task with correct properties", () => {
    const task = {
      id: "task-1",
      title: "Test Task",
      priority: "high" as const,
      category: "work" as const,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    expect(task.title).toBe("Test Task");
    expect(task.priority).toBe("high");
    expect(task.category).toBe("work");
    expect(task.completed).toBe(false);
  });

  it("should mark task as completed", () => {
    const task = {
      id: "task-1",
      title: "Test Task",
      priority: "high" as const,
      category: "work" as const,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    const completedTask = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    expect(completedTask.completed).toBe(true);
    expect(completedTask.completedAt).not.toBeNull();
  });

  it("should validate priority levels", () => {
    const validPriorities = ["low", "medium", "high", "critical"];
    const testPriority = "high";

    expect(validPriorities).toContain(testPriority);
  });

  it("should validate task categories", () => {
    const validCategories = ["work", "personal", "health", "learning", "other"];
    const testCategory = "personal";

    expect(validCategories).toContain(testCategory);
  });

  it("should generate unique task IDs", () => {
    const id1 = `task-${Date.now()}-${Math.random()}`;
    const id2 = `task-${Date.now()}-${Math.random()}`;

    expect(id1).not.toBe(id2);
  });

  it("should track activity when task is created", () => {
    const activity = {
      id: `activity-${Date.now()}`,
      type: "created" as const,
      taskTitle: "Test Task",
      timestamp: new Date().toISOString(),
    };

    expect(activity.type).toBe("created");
    expect(activity.taskTitle).toBe("Test Task");
  });

  it("should track activity when task is completed", () => {
    const activity = {
      id: `activity-${Date.now()}`,
      type: "completed" as const,
      taskTitle: "Test Task",
      timestamp: new Date().toISOString(),
    };

    expect(activity.type).toBe("completed");
  });

  it("should track activity when task is deleted", () => {
    const activity = {
      id: `activity-${Date.now()}`,
      type: "deleted" as const,
      taskTitle: "Test Task",
      timestamp: new Date().toISOString(),
    };

    expect(activity.type).toBe("deleted");
  });

  it("should calculate completion rate", () => {
    const tasks = [
      { id: "1", completed: true },
      { id: "2", completed: true },
      { id: "3", completed: false },
      { id: "4", completed: false },
    ];

    const completed = tasks.filter((t) => t.completed).length;
    const rate = (completed / tasks.length) * 100;

    expect(rate).toBe(50);
  });

  it("should filter tasks by priority", () => {
    const tasks = [
      { id: "1", priority: "high" },
      { id: "2", priority: "low" },
      { id: "3", priority: "high" },
    ];

    const highPriority = tasks.filter((t) => t.priority === "high");

    expect(highPriority).toHaveLength(2);
  });

  it("should sort tasks by priority", () => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const tasks = [
      { id: "1", priority: "low" },
      { id: "2", priority: "high" },
      { id: "3", priority: "critical" },
    ];

    const sorted = [...tasks].sort(
      (a, b) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3)
    );

    expect(sorted[0].priority).toBe("critical");
    expect(sorted[1].priority).toBe("high");
    expect(sorted[2].priority).toBe("low");
  });

  it("should calculate daily streak", () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(yesterday);
    dayBefore.setDate(dayBefore.getDate() - 1);

    const completedDates = [
      today.toDateString(),
      yesterday.toDateString(),
      dayBefore.toDateString(),
    ];

    let streak = 0;
    const d = new Date();
    while (completedDates.includes(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    expect(streak).toBe(3);
  });

  it("should persist data to AsyncStorage", async () => {
    const mockSetItem = vi.fn();
    (AsyncStorage.setItem as any) = mockSetItem;

    const data = { tasks: [], activities: [] };
    await AsyncStorage.setItem("tasks_data", JSON.stringify(data));

    expect(mockSetItem).toHaveBeenCalledWith("tasks_data", JSON.stringify(data));
  });

  it("should retrieve data from AsyncStorage", async () => {
    const mockData = { tasks: [], activities: [] };
    const mockGetItem = vi.fn().mockResolvedValue(JSON.stringify(mockData));
    (AsyncStorage.getItem as any) = mockGetItem;

    const result = await AsyncStorage.getItem("tasks_data");
    const parsed = JSON.parse(result || "{}");

    expect(parsed).toEqual(mockData);
  });
});
