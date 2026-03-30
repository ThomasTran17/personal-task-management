import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task, TaskStatus } from '@/types/task';

interface TaskState {
  tasks: Task[];
  filter: TaskStatus | 'all';
}

const initialState: TaskState = {
  tasks: [],
  filter: 'all',
};

export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newTask: Task = {
        ...action.payload,
        id: `task-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      state.tasks.push(newTask);
    },

    updateTask: (state, action: PayloadAction<{ id: string; updates: Partial<Task> }>) => {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload.updates, { updatedAt: new Date() });
      }
    },

    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },

    setFilter: (state, action: PayloadAction<TaskStatus | 'all'>) => {
      state.filter = action.payload;
    },

    clearAllTasks: (state) => {
      state.tasks = [];
    },

    // For hydration from localStorage
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
  },
});

export const { addTask, updateTask, deleteTask, setFilter, clearAllTasks, setTasks } =
  taskSlice.actions;

export default taskSlice.reducer;
