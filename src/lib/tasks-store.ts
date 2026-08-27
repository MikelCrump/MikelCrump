"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_TASKS } from "@/lib/life-mock";
import { generateId } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  tag: string;
}

interface TasksState {
  tasks: Task[];
  addTask: (title: string, tag?: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: DEFAULT_TASKS,
      addTask: (title, tag = "General") =>
        set((s) => ({
          tasks: [
            { id: generateId(), title: title.trim(), done: false, tag },
            ...s.tasks,
          ],
        })),
      toggleTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done } : t
          ),
        })),
      removeTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    { name: "steward-tasks" }
  )
);
