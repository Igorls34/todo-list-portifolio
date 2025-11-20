// storage.js
// Persistência via localStorage e geração de IDs

const TASKS_KEY = 'todo_tasks_v1';
const THEME_KEY = 'todo_theme_v1';

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {}
};

export const loadTasks = () => {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const clearCompleted = (tasks) => {
  const filtered = tasks.filter(t => !t.done);
  saveTasks(filtered);
  return filtered;
};

export const saveTheme = (theme) => {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
};

export const loadTheme = () => {
  try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
};

export const generateId = () => {
  // ID curto, único o suficiente para este contexto
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};
