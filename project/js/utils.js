// utils.js
// Funções utilitárias e sem acoplamento ao DOM

export const formatDate = (isoString) => {
  try {
    const d = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  } catch {
    return '';
  }
};

export const validateInput = (text) => {
  if (typeof text !== 'string') return { valid: false, reason: 'Tipo inválido' };
  const trimmed = text.trim();
  if (!trimmed) return { valid: false, reason: 'Digite uma tarefa' };
  if (trimmed.length > 200) return { valid: false, reason: 'Máximo de 200 caracteres' };
  return { valid: true, text: trimmed };
};

export const animateAdd = (el) => {
  if (!el) return;
  // já temos animação de entrada via CSS (fade-in), aqui poderíamos reforçar se necessário
  el.classList.remove('exit');
};

export const animateRemove = (el) => {
  return new Promise((resolve) => {
    if (!el) return resolve();
    el.classList.add('exit');
    const done = () => {
      el.removeEventListener('animationend', done);
      resolve();
    };
    el.addEventListener('animationend', done);
  });
};
