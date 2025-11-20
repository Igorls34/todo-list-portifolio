// dom.js
// Responsável por renderização e ligação de eventos ao DOM (sem regras de negócio)

import { formatDate } from './utils.js';

const els = {
  list: document.getElementById('taskList'),
  counter: document.getElementById('counter'),
  addForm: document.getElementById('addForm'),
  taskInput: document.getElementById('taskInput'),
  clearCompleted: document.getElementById('clearCompleted'),
  themeToggle: document.getElementById('themeToggle'),
  filterChips: () => Array.from(document.querySelectorAll('.filters .chip')),
};

const featherReplace = () => {
  if (window.feather && typeof window.feather.replace === 'function') {
    window.feather.replace();
  }
};

export const renderTask = (task) => {
  const li = document.createElement('li');
  li.className = `task${task.done ? ' task--done' : ''}`;
  li.dataset.id = task.id;
  li.innerHTML = `
    <label class="check">
      <input type="checkbox" class="task-toggle" ${task.done ? 'checked' : ''} aria-label="Marcar como concluída" />
      <span class="box" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </span>
    </label>
    <div class="task__content">
      <span class="task__text" title="${task.text.replaceAll('"', '\\"')}">${task.text}</span>
      <span class="task__date">criada em ${formatDate(task.createdAt)}</span>
    </div>
    <div class="task__actions">
      <button class="icon-btn small task-delete" aria-label="Remover tarefa" title="Remover">
        <i data-feather="trash-2"></i>
      </button>
    </div>
  `;
  return li;
};

export const renderTaskList = (tasks, filter = 'all') => {
  els.list.innerHTML = '';
  const frag = document.createDocumentFragment();
  let filtered = tasks;
  if (filter === 'active') filtered = tasks.filter(t => !t.done);
  if (filter === 'completed') filtered = tasks.filter(t => t.done);
  filtered.forEach(t => frag.appendChild(renderTask(t)));
  els.list.appendChild(frag);
  // Atualiza estado visual dos filtros
  els.filterChips().forEach(chip => {
    chip.classList.toggle('is-active', chip.dataset.filter === filter);
    chip.setAttribute('aria-selected', chip.dataset.filter === filter ? 'true' : 'false');
  });
  featherReplace();
};

export const updateCounter = (remaining) => {
  const label = remaining === 1 ? 'tarefa restante' : 'tarefas restantes';
  els.counter.textContent = `${remaining} ${label}`;
};

export const setTheme = (theme) => {
  const isLight = theme === 'light';
  document.documentElement.classList.toggle('light', isLight);
  document.body.classList.toggle('dark-mode', !isLight);
  // Atualiza ícone do botão
  if (els.themeToggle) {
    els.themeToggle.innerHTML = `<i data-feather="${isLight ? 'moon' : 'sun'}"></i>`;
    featherReplace();
  }
};

export const bindTaskEvents = (callbacks) => {
  const {
    onAddTask,
    onToggle,
    onEdit,
    onDelete,
    onFilterChange,
    onClearCompleted,
    onThemeToggle,
  } = callbacks;

  // Adicionar tarefa
  els.addForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = els.taskInput?.value ?? '';
    onAddTask?.(value);
  });

  // Limpar concluídas
  els.clearCompleted?.addEventListener('click', () => onClearCompleted?.());

  // Alternar tema
  els.themeToggle?.addEventListener('click', () => onThemeToggle?.());

  // Filtros
  els.filterChips().forEach(chip => {
    chip.addEventListener('click', () => onFilterChange?.(chip.dataset.filter));
  });

  // Delegação de eventos na lista
  els.list.addEventListener('change', (e) => {
    const target = e.target;
    if (target instanceof HTMLInputElement && target.classList.contains('task-toggle')) {
      const li = target.closest('.task');
      if (!li) return;
      onToggle?.(li.dataset.id);
    }
  });

  els.list.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const btn = target.closest('.task-delete');
    if (btn) {
      const li = btn.closest('.task');
      if (!li) return;
      onDelete?.(li.dataset.id);
    }
  });

  // Edição inline (dblclick no texto)
  els.list.addEventListener('dblclick', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!target.classList.contains('task__text')) return;

    const li = target.closest('.task');
    if (!li) return;

    const original = target.textContent || '';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = original;
    input.className = 'task-edit';
    target.replaceWith(input);
    input.focus();
    input.setSelectionRange(original.length, original.length);

    const cancelEdit = () => {
      input.replaceWith(Object.assign(document.createElement('span'), { className: 'task__text', textContent: original }));
    };

    const saveEdit = () => {
      const newVal = input.value;
      onEdit?.(li.dataset.id, newVal);
    };

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        saveEdit();
      } else if (ev.key === 'Escape') {
        ev.preventDefault();
        cancelEdit();
      }
    });

    input.addEventListener('blur', () => {
      // Ao sair do foco, apenas reverte sem salvar (conforme requisito: Enter confirma, Esc cancela)
      cancelEdit();
    }, { once: true });
  });
};
