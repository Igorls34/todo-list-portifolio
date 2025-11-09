// ==========================================
// MODAL - Sistema de Modal do Formulário
// ==========================================

import { showNotification } from './notifications.js';
import { track } from './tracker.js';
import { SHEETS_WEBAPP_URL, SHEETS_TOKEN } from './config.js';

export function initModal() {
    const formModal = document.getElementById('formModal');
    const openFormBtn = document.getElementById('openFormBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const contactForm = document.getElementById('contactForm');
    const formStartInput = document.getElementById('form_start');
    
    // Abre o modal
    if (openFormBtn) {
        openFormBtn.addEventListener('click', function() {
            formModal.classList.add('active');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden';
            // marca início de preenchimento para heurística anti-spam
            if (formStartInput) formStartInput.value = String(Date.now());
            track('modal_open');
            
            // Foca no primeiro campo após abertura
            setTimeout(() => {
                const firstInput = contactForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 300);
        });
    }
    
    // Fecha o modal
    function closeModal() {
        formModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        contactForm.reset();
        track('modal_close');
    }
    
    if (closeFormBtn) {
        closeFormBtn.addEventListener('click', closeModal);
    }
    
    // Fecha ao clicar fora do modal
    formModal.addEventListener('click', function(e) {
        if (e.target === formModal) {
            closeModal();
        }
    });
    
    // Fecha com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && formModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Validação e envio
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const nome = document.getElementById('nome').value.trim();
            const sobrenome = document.getElementById('sobrenome').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const email = (document.getElementById('email')?.value || '').trim();
            const mensagem = document.getElementById('mensagem').value.trim();
            const website = (document.getElementById('website')?.value || '').trim();
            const startedAt = Number(formStartInput?.value || 0);
            const elapsed = startedAt ? (Date.now() - startedAt) : 0;
            const sessionId = (function() {
                const existing = sessionStorage.getItem('session_id');
                if (existing) return existing;
                const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
                sessionStorage.setItem('session_id', id);
                return id;
            })();

            if (!nome || !sobrenome || !mensagem) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                track('form_submit_error', { reason: 'missing_required' });
                return;
            }

            if (email && !/^\S+@\S+\.\S+$/.test(email)) {
                showNotification('E-mail inválido.', 'error');
                track('form_submit_error', { reason: 'invalid_email' });
                return;
            }

            // Honeypot: se website preenchido, é bot
            if (website) {
                showNotification('Envio bloqueado por segurança.', 'error');
                track('form_submit_error', { reason: 'honeypot' });
                return;
            }

            // Heurística: tempo mínimo de 3s para preenchimento
            if (elapsed && elapsed < 3000) {
                showNotification('Envio muito rápido detectado. Tente novamente.', 'error');
                track('form_submit_error', { reason: 'too_fast', elapsed });
                return;
            }

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;

            function setLoading(state) {
                if (state) {
                    submitBtn.classList.add('is-loading');
                    submitBtn.setAttribute('aria-busy', 'true');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                } else {
                    submitBtn.classList.remove('is-loading');
                    submitBtn.removeAttribute('aria-busy');
                    submitBtn.disabled = false;
                }
            }

            setLoading(true);

            // Monta payload para Google Apps Script
            // Envio com "simple request" para evitar preflight CORS (sem header custom e usando URL encoded)
            if (!SHEETS_WEBAPP_URL) {
                showNotification('Backend não configurado. Defina SHEETS_WEBAPP_URL em config.js.', 'error');
                setLoading(false);
                submitBtn.textContent = originalText;
                return;
            }

            const params = new URLSearchParams();
            params.append('timestamp', new Date().toISOString());
            params.append('nome', nome);
            params.append('sobrenome', sobrenome);
            params.append('telefone', telefone);
            params.append('mensagem', mensagem);
            params.append('email', email);
            params.append('origem', 'portfolio-modal');
            params.append('elapsed_ms', String(elapsed));
            params.append('form_start', String(startedAt || ''));
            params.append('page_url', window.location.href);
            params.append('referrer', document.referrer || '');
            params.append('user_agent', navigator.userAgent);
            params.append('session_id', sessionId);
            params.append('token', SHEETS_TOKEN);

            let ok = false;
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);
                const res = await fetch(SHEETS_WEBAPP_URL, {
                    method: 'POST',
                    body: params, // sem headers explícitos => application/x-www-form-urlencoded
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (!res.ok) throw new Error('Status HTTP ' + res.status);
                // Tenta parsear JSON se existir
                await res.text(); // resposta é ignorada; Apps Script pode retornar JSON
                ok = true;
                setLoading(false);
                submitBtn.textContent = '✓ Enviado!';
                submitBtn.style.background = '#28a745';
                showNotification('Mensagem registrada! Obrigado pelo contato.', 'success');
                track('form_submit_success');
            } catch (err) {
                console.warn('Primeira tentativa falhou (provável CORS). Tentando fallback no-cors...', err);
                // Fallback no-cors: a resposta é opaca, mas o Apps Script recebe o POST.
                try {
                    const controller2 = new AbortController();
                    const timeout2 = setTimeout(() => controller2.abort(), 8000);
                    await fetch(SHEETS_WEBAPP_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: params,
                        signal: controller2.signal
                    });
                    clearTimeout(timeout2);
                    ok = true; // Não conseguimos confirmar, mas assumimos sucesso.
                    setLoading(false);
                    submitBtn.textContent = '✓ Enviado!';
                    submitBtn.style.background = '#28a745';
                    showNotification('Mensagem enviada! Verifique a planilha.', 'success');
                    track('form_submit_success_fallback');
                } catch (err2) {
                    console.error('Falha também no fallback no-cors:', err2);
                    showNotification('Falha ao enviar. Verifique sua conexão ou URL.', 'error');
                    setLoading(false);
                    submitBtn.textContent = 'Tentar novamente';
                    submitBtn.style.background = '#0D6EFD';
                    track('form_submit_error', { reason: 'network', detail: String(err2) });
                    return;
                }
            }

            if (ok) {
                setTimeout(() => {
                    closeModal();
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '#0D6EFD';
                }, 1400);
            }
        });
    }
}
