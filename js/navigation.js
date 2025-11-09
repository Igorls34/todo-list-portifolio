// ==========================================
// NAVIGATION - Navegação Suave
// ==========================================

export function initNavigation() {
    const NAV_DEBUG = false; // Logs desativados em produção
    if (NAV_DEBUG) console.log('%c[NAV] Iniciando módulo de navegação...', 'color:#0D6EFD;font-weight:bold;');
    // Detecta se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    if (NAV_DEBUG) {
        console.log(`[NAV] Quantidade de links encontrados: ${navLinks.length}`);
        if (!navLinks.length) console.warn('[NAV] Nenhum link de navegação encontrado. Verifique o markup do <nav>.');
    }

    // Loga dimensões gerais para saber se há espaço para scroll
    if (NAV_DEBUG) {
        console.log(`[NAV] documentElement.scrollHeight: ${document.documentElement.scrollHeight}`);
        console.log(`[NAV] window.innerHeight: ${window.innerHeight}`);
        console.log(`[NAV] Pode rolar? ${(document.documentElement.scrollHeight > window.innerHeight)}`);
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const clickTime = performance.now();
            if (NAV_DEBUG) console.group('[NAV] Click handler');
            // Intercepta navegação para aplicar scroll customizado
            e.preventDefault();
            if (NAV_DEBUG) console.log('[NAV] Evento de clique interceptado e comportamento padrão prevenido.');

            const targetId = this.getAttribute('href');
            if (NAV_DEBUG) console.log(`[NAV] targetId: ${targetId}`);
            const targetSection = document.querySelector(targetId);
            if (!targetSection) {
                if (NAV_DEBUG) console.warn('[NAV] Seção alvo não encontrada para', targetId);
                if (NAV_DEBUG) console.groupEnd();
                return;
            }
            if (NAV_DEBUG) console.log('[NAV] Seção alvo encontrada:', targetSection);

            const headerOffset = isMobile ? 80 : 100;
            if (NAV_DEBUG) console.log(`[NAV] headerOffset: ${headerOffset} (isMobile=${isMobile})`);
            const elementPosition = targetSection.getBoundingClientRect().top;
            if (NAV_DEBUG) console.log(`[NAV] elementPosition (getBoundingClientRect().top): ${elementPosition}`);
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            if (NAV_DEBUG) console.log(`[NAV] offsetPosition calculado: ${offsetPosition}`);

            const supportsSmooth = 'scrollBehavior' in document.documentElement.style;
            if (NAV_DEBUG) console.log(`[NAV] Suporte a scroll suave: ${supportsSmooth}`);

            const initialScroll = window.pageYOffset;
            if (NAV_DEBUG) console.log(`[NAV] Scroll inicial Y: ${initialScroll}`);

            // Estado do body/modal
            if (NAV_DEBUG) {
                console.log(`[NAV] body.classList: ${[...document.body.classList].join(',') || '(sem classes)'}`);
                const modal = document.getElementById('formModal');
                if (modal) console.log(`[NAV] Modal ativo? ${modal.classList.contains('active')}`);
            }

            try {
                if (supportsSmooth) {
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    if (NAV_DEBUG) console.log('[NAV] Chamado window.scrollTo com smooth.');
                } else {
                    window.scrollTo(0, offsetPosition);
                    if (NAV_DEBUG) console.log('[NAV] Chamado window.scrollTo sem smooth (fallback).');
                }
            } catch (err) {
                if (NAV_DEBUG) console.error('[NAV] Erro ao executar scrollTo:', err);
            }

            // Fallbacks adicionais se após 120ms nada mudou
            setTimeout(() => {
                const afterScrollA = window.pageYOffset;
                if (NAV_DEBUG) console.log(`[NAV] Verificação #1 (120ms) scrollY: ${afterScrollA}`);
                if (afterScrollA === initialScroll) {
                    // Tenta scrollar via documentElement
                    document.documentElement.scrollTop = offsetPosition;
                    const afterDocEl = document.documentElement.scrollTop || window.pageYOffset;
                    if (NAV_DEBUG) console.log(`[NAV] Fallback documentElement.scrollTop agora: ${afterDocEl}`);
                    if (afterDocEl === initialScroll) {
                        // Último fallback body.scrollTop
                        document.body.scrollTop = offsetPosition;
                        const afterBody = document.body.scrollTop || window.pageYOffset;
                        if (NAV_DEBUG) console.log(`[NAV] Fallback body.scrollTop agora: ${afterBody}`);
                        if (afterBody === initialScroll) {
                            console.warn('[NAV] Nenhum método de scroll alterou a posição. Verifique CSS (overflow:hidden) ou container scrollável.');
                        }
                    }
                }
            }, 120);

            // Verifica após pequeno delay se o scroll iniciou/mudou
            setTimeout(() => {
                const afterScroll = window.pageYOffset;
                if (NAV_DEBUG) {
                    if (afterScroll !== initialScroll) {
                        console.log(`[NAV] Scroll mudou de ${initialScroll} para ${afterScroll}.`);
                    } else {
                        console.warn('[NAV] Scroll não alterou posição. Possível bloqueio ou cálculo incorreto.');
                    }
                }
            }, 80);

            // Atualiza a hash da URL para acessibilidade / histórico
            try {
                history.replaceState(null, '', targetId);
                if (NAV_DEBUG) console.log('[NAV] Hash atualizada via history.replaceState.');
            } catch (_) {
                window.location.hash = targetId;
                if (NAV_DEBUG) console.log('[NAV] Hash atualizada via window.location.hash (fallback).');
            }

            // Feedback visual temporário
            navLinks.forEach(l => l.style.opacity = '0.7');
            this.style.opacity = '1';
            if (NAV_DEBUG) console.log('[NAV] Aplicado feedback visual (opacidade).');
            setTimeout(() => {
                navLinks.forEach(l => l.style.opacity = '1');
                if (NAV_DEBUG) console.log('[NAV] Feedback visual restaurado.');
            }, 800);

            if (NAV_DEBUG) {
                const elapsed = (performance.now() - clickTime).toFixed(2);
                console.log(`[NAV] Tempo total do handler: ${elapsed}ms`);
                console.groupEnd();
            }
        });
    });
}
