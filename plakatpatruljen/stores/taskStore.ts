import { create } from 'zustand';
import type { TaskClaim } from '@/types/task';

interface TaskState {
  tasks: TaskClaim[];
  activeTask: TaskClaim | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: 'hang' | 'remove';
    status?: string;
  };
  setTasks: (tasks: TaskClaim[]) => void;
  addTask: (task: TaskClaim) => void;
  updateTask: (id: string, updates: Partial<TaskClaim>) => void;
  setActiveTask: (task: TaskClaim | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: TaskState['filters']) => void;
  clear: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  activeTask: null,
  isLoading: false,
  error: null,
  filters: {},
  setTasks: (tasks) => set({ tasks, isLoading: false, error: null }),
  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      activeTask:
        state.activeTask?.id === id
          ? { ...state.activeTask, ...updates }
          : state.activeTask,
    })),
  setActiveTask: (activeTask) => set({ activeTask }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  setFilters: (filters) => set({ filters }),
  clear: () =>
    set({
      tasks: [],
      activeTask: null,
      isLoading: false,
      error: null,
      filters: {},
    }),
}));
