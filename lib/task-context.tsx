import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
export type Priority = "low" | "medium" | "high" | "critical";
export type Category = "work" | "personal" | "health" | "learning" | "other";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

export interface ActivityEntry {
  id: string;
  type: "created" | "completed" | "deleted";
  taskTitle: string;
  timestamp: string;
}

interface TaskState {
  tasks: Task[];
  activities: ActivityEntry[];
  loaded: boolean;
}

type TaskAction =
  | { type: "LOAD_DATA"; tasks: Task[]; activities: ActivityEntry[] }
  | { type: "ADD_TASK"; task: Task }
  | { type: "COMPLETE_TASK"; taskId: string }
  | { type: "DELETE_TASK"; taskId: string }
  | { type: "CLEAR_COMPLETED" };

const TASKS_KEY = "@productivity_pro_tasks";
const ACTIVITIES_KEY = "@productivity_pro_activities";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "LOAD_DATA":
      return { ...state, tasks: action.tasks, activities: action.activities, loaded: true };
    case "ADD_TASK": {
      const newActivity: ActivityEntry = {
        id: generateId(),
        type: "created",
        taskTitle: action.task.title,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: [action.task, ...state.tasks],
        activities: [newActivity, ...state.activities],
      };
    }
    case "COMPLETE_TASK": {
      const task = state.tasks.find((t) => t.id === action.taskId);
      if (!task) return state;
      const newActivity: ActivityEntry = {
        id: generateId(),
        type: "completed",
        taskTitle: task.title,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, completed: true, completedAt: new Date().toISOString() } : t
        ),
        activities: [newActivity, ...state.activities],
      };
    }
    case "DELETE_TASK": {
      const task = state.tasks.find((t) => t.id === action.taskId);
      if (!task) return state;
      const newActivity: ActivityEntry = {
        id: generateId(),
        type: "deleted",
        taskTitle: task.title,
        timestamp: new Date().toISOString(),
      };
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.taskId),
        activities: [newActivity, ...state.activities],
      };
    }
    case "CLEAR_COMPLETED":
      return {
        ...state,
        tasks: state.tasks.filter((t) => !t.completed),
      };
    default:
      return state;
  }
}

interface TaskContextValue {
  state: TaskState;
  addTask: (title: string, priority: Priority, category: Category, dueDate?: string) => void;
  completeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  clearCompleted: () => void;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, {
    tasks: [],
    activities: [],
    loaded: false,
  });

  // Load data from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const [tasksJson, activitiesJson] = await Promise.all([
          AsyncStorage.getItem(TASKS_KEY),
          AsyncStorage.getItem(ACTIVITIES_KEY),
        ]);
        const tasks = tasksJson ? JSON.parse(tasksJson) : [];
        const activities = activitiesJson ? JSON.parse(activitiesJson) : [];
        dispatch({ type: "LOAD_DATA", tasks, activities });
      } catch {
        dispatch({ type: "LOAD_DATA", tasks: [], activities: [] });
      }
    })();
  }, []);

  // Persist data whenever tasks or activities change
  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks));
    AsyncStorage.setItem(ACTIVITIES_KEY, JSON.stringify(state.activities));
  }, [state.tasks, state.activities, state.loaded]);

  const addTask = useCallback(
    (title: string, priority: Priority, category: Category, dueDate?: string) => {
      const task: Task = {
        id: generateId(),
        title,
        priority,
        category,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate,
      };
      dispatch({ type: "ADD_TASK", task });
    },
    []
  );

  const completeTask = useCallback((taskId: string) => {
    dispatch({ type: "COMPLETE_TASK", taskId });
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    dispatch({ type: "DELETE_TASK", taskId });
  }, []);

  const clearCompleted = useCallback(() => {
    dispatch({ type: "CLEAR_COMPLETED" });
  }, []);

  return (
    <TaskContext.Provider value={{ state, addTask, completeTask, deleteTask, clearCompleted }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
}
