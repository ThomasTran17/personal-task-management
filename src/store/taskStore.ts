import { create } from "zustand";
import type { PersistStorage } from "zustand/middleware";
import { persist } from "zustand/middleware";
import type { Task, TaskStatus } from "@/types/task";

interface TaskState {
  tasks: Task[];
  filter: TaskStatus | "all";
}

interface TaskActions {
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  setFilter: (filter: TaskStatus | "all") => void;
  clearAllTasks: () => void;
}

interface TaskStore extends TaskState, TaskActions {}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: `task-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      getTasks: () => {
        return get().tasks;
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      setFilter: (filter) => {
        set({ filter });
      },

      clearAllTasks: () => {
        set({ tasks: [] });
      },
    }),
    {
      name: "task-storage",
      storage: {
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          
          const parsed = JSON.parse(item) as { 
            state: { tasks: Record<string, unknown>[]; filter: string }
            version: number 
          };
          return {
            state: {
              ...parsed.state,
              tasks: parsed.state.tasks.map((task: Record<string, unknown>) => ({
                ...task,
                createdAt: new Date(task.createdAt as string),
                updatedAt: new Date(task.updatedAt as string),
                dueDate: task.dueDate ? new Date(task.dueDate as string) : undefined,
              })),
            },
            version: parsed.version,
          };
        },
        setItem: (name: string, value: unknown) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
          localStorage.removeItem(name);
        },
      } as PersistStorage<TaskStore>,
    }
  )
);
