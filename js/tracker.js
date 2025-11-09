// ==========================================
// TRACKER - Rastreamento de eventos para Google Sheets
// ==========================================

import { SHEETS_WEBAPP_URL, SHEETS_TOKEN } from './config.js';

const TRACKER_ENABLED = true; // desligue se necessário
const REALTIME_TRACKING = true; // true = envia imediatamente; false = usa intervalo
const FLUSH_INTERVAL_MS = 10000; // fallback para flush periódico
const BATCH_SIZE = 10;
const QUEUE_KEY = 'event_queue_portfolio';

function getSessionId() {
  try {
    const existing = sessionStorage.getItem('session_id');
    if (existing) return existing;
    const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem('session_id', id);
    return id;
  } catch (_) {
    return '';
  }
}

function enqueue(event) {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    q.push(event);
    // limita fila para evitar crescimento infinito (mantém últimos 500)
    const kept = q.slice(-500);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(kept));
  } catch (_) { /* ignore */ }
}

async function sendBatch(events) {
  if (!events || !events.length) return true;
  try {
    const body = new URLSearchParams();
    body.append('tracker_batch', JSON.stringify(events));
    body.append('origem', 'portfolio-tracker');
    if (SHEETS_TOKEN) body.append('token', SHEETS_TOKEN);
    const sid = getSessionId();
    if (sid) body.append('session_id', sid);

    const res = await fetch(SHEETS_WEBAPP_URL, { method: 'POST', body });
    return !!(res && (res.ok || res.type === 'opaque'));
  } catch (_) {
    return false;
  }
}

async function flushQueue() {
  try {
    let q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (!q.length) return;
    // envia em laços de BATCH_SIZE
    while (q.length) {
      const chunk = q.slice(0, BATCH_SIZE);
      const ok = await sendBatch(chunk);
      if (!ok) break; // para se falhar, mantém restante para próxima tentativa
      q = q.slice(chunk.length);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    }
  } catch (_) { /* mantem na fila */ }
}

function scheduleFlush() {
  // tenta enviar agora e em intervalos
  flushQueue();
  if (!scheduleFlush._timer) {
    scheduleFlush._timer = setInterval(flushQueue, FLUSH_INTERVAL_MS);
  }
}

function nowIso() { return new Date().toISOString(); }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function track(eventName, payload = {}) {
  if (!TRACKER_ENABLED || !SHEETS_WEBAPP_URL) return;
  const evt = {
    id: uid(),
    ts: nowIso(),
    event: eventName,
    ua: navigator.userAgent,
    url: location.href,
    ref: document.referrer || '',
    session_id: getSessionId(),
    ...payload
  };
  if (REALTIME_TRACKING) {
    // tenta enviar imediatamente; se falhar, enfileira
    sendBatch([evt]).then((ok) => {
      if (!ok) {
        enqueue(evt);
        scheduleFlush();
      }
    }).catch(() => {
      enqueue(evt);
      scheduleFlush();
    });
  } else {
    enqueue(evt);
    scheduleFlush();
  }
}

export function initTracker() {
  if (!SHEETS_WEBAPP_URL) return;
  // eventos básicos
  track('page_view');

  // cliques genéricos
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a, button, .skill-item');
    if (!target) return;

    const data = {
      tag: target.tagName,
      text: (target.innerText || '').slice(0, 60),
      id: target.id || '',
      class: target.className || '',
      href: target.getAttribute && target.getAttribute('href') || ''
    };

    track('click', data);
  }, { capture: true });

  // scroll (amostragem)
  let lastSent = 0;
  window.addEventListener('scroll', () => {
    const now = Date.now();
    if (now - lastSent > 2000) {
      lastSent = now;
      const y = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      track('scroll_progress', { y });
    }
  }, { passive: true });

  // visibilidade
  document.addEventListener('visibilitychange', () => {
    track('visibility_change', { state: document.visibilityState });
  });

  // beforeunload: tenta flush final
  window.addEventListener('beforeunload', () => {
    try { flushQueue(); } catch (_) {}
  });

  // quando voltar a ficar online, tenta enviar fila
  window.addEventListener('online', () => {
    scheduleFlush();
  });
}
