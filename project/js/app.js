// app.js
// Ponto de entrada: orquestra estado, storage e DOM

import { renderTaskList, updateCounter, setTheme, bindTaskEvents } from './dom.js';
import { saveTasks, loadTasks, clearCompleted, generateId, saveTheme, loadTheme } from './storage.js';
import { validateInput, animateRemove } from './utils.js';

let tasks = [];
let currentFilter = 'all';
let theme = 'dark';

const computeRemaining = () => tasks.filter(t => !t.done).length;

const addTask = (text) => {
  const { valid, text: normalized, reason } = validateInput(text);
  const input = document.getElementById('taskInput');
  if (!valid) {
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      input.title = reason;
      input.focus();
    }
    return;
  }
  const task = { id: generateId(), text: normalized, done: false, createdAt: new Date().toISOString() };
  tasks = [task, ...tasks];
  saveTasks(tasks);
  renderTaskList(tasks, currentFilter);
  updateCounter(computeRemaining());
  if (input) {
    input.value = '';
    input.removeAttribute('aria-invalid');
    input.removeAttribute('title');
  }
};

const toggleTask = (id) => {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks(tasks);
  renderTaskList(tasks, currentFilter);
  updateCounter(computeRemaining());
};

const editTask = (id, newText) => {
  const { valid, text: normalized } = validateInput(newText);
  if (!valid) {
    // Se inválido, apenas re-renderiza para restaurar texto original
    renderTaskList(tasks, currentFilter);
    return;
  }
  tasks = tasks.map(t => t.id === id ? { ...t, text: normalized } : t);
  saveTasks(tasks);
  renderTaskList(tasks, currentFilter);
};

const deleteTask = async (id) => {
  const li = document.querySelector(`.task[data-id="${id}"]`);
  if (li) await animateRemove(li);
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
  renderTaskList(tasks, currentFilter);
  updateCounter(computeRemaining());
};

const changeFilter = (filter) => {
  currentFilter = filter || 'all';
  renderTaskList(tasks, currentFilter);
};

const clearCompletedTasks = () => {
  tasks = clearCompleted(tasks);
  renderTaskList(tasks, currentFilter);
  updateCounter(computeRemaining());
};

const toggleTheme = () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  saveTheme(theme);
};

const init = () => {
  tasks = loadTasks();
  theme = loadTheme();
  setTheme(theme);
  renderTaskList(tasks, currentFilter);
  updateCounter(computeRemaining());

  bindTaskEvents({
    onAddTask: addTask,
    onToggle: toggleTask,
    onEdit: editTask,
    onDelete: deleteTask,
    onFilterChange: changeFilter,
    onClearCompleted: clearCompletedTasks,
    onThemeToggle: toggleTheme,
  });
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
