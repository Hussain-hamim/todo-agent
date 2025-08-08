import { create } from 'zustand';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  dueDate?: string;
};

export type AppState = {
  tasks: Task[];
  notes: string;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  addTask: (title: string, dueDate?: string) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  setNotes: (notes: string) => void;
  setDueDateByTitle: (title: string, dueDate: string) => boolean;
  renameTaskByTitle: (title: string, newTitle: string) => boolean;
  clearCompleted: () => number;
};

const STORAGE_KEY = 'karrytask_state_v1';

function load(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load state', e);
    return {};
  }
}

function save(state: Partial<AppState>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks: state.tasks,
        notes: state.notes,
        isAuthenticated: state.isAuthenticated,
      })
    );
  } catch (e) {
    console.warn('Failed to persist state', e);
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: load().tasks || [],
  notes: load().notes || '',
  isAuthenticated: load().isAuthenticated ?? false,
  login: () => {
    set({ isAuthenticated: true });
    save({ ...get() });
  },
  logout: () => {
    set({ isAuthenticated: false });
    save({ ...get() });
  },
  addTask: (title: string, dueDate?: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: Date.now(),
      dueDate,
    };
    const tasks = [newTask, ...get().tasks];
    set({ tasks });
    save({ ...get(), tasks });
  },
  toggleTask: (id: string) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    set({ tasks });
    save({ ...get(), tasks });
  },
  deleteTask: (id: string) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    save({ ...get(), tasks });
  },
  setNotes: (notes: string) => {
    set({ notes });
    save({ ...get(), notes });
  },
  setDueDateByTitle: (title: string, dueDate: string) => {
    const lower = title.toLowerCase();
    const tasks = get().tasks.map((t) =>
      t.title.toLowerCase().includes(lower) ? { ...t, dueDate } : t
    );
    const changed = tasks.some((t, idx) => t !== get().tasks[idx]);
    if (changed) {
      set({ tasks });
      save({ ...get(), tasks });
    }
    return changed;
  },
  renameTaskByTitle: (title: string, newTitle: string) => {
    const lower = title.toLowerCase();
    const tasks = get().tasks.map((t) =>
      t.title.toLowerCase().includes(lower) ? { ...t, title: newTitle } : t
    );
    const changed = tasks.some((t, idx) => t !== get().tasks[idx]);
    if (changed) {
      set({ tasks });
      save({ ...get(), tasks });
    }
    return changed;
  },
  clearCompleted: () => {
    const before = get().tasks.length;
    const tasks = get().tasks.filter((t) => !t.completed);
    const removed = before - tasks.length;
    if (removed > 0) {
      set({ tasks });
      save({ ...get(), tasks });
    }
    return removed;
  },
}));
