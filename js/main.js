// ==========================================
// MAIN - Arquivo Principal
// ==========================================

import { initNavigation } from './navigation.js';
import { initAnimations } from './animations.js';
import { initSkillsAnimation } from './skills-animation.js';
import { initModal } from './modal.js';
import { showNotification } from './notifications.js';
import { initTooltips } from './tooltips.js';
import { initTracker, track } from './tracker.js';

// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // Detecta se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Inicializa todos os módulos
    initNavigation();
    initAnimations();
    initSkillsAnimation();
    initModal();
    initTooltips();
    initTracker();
    
    // ========================================
    // EFEITO PARALLAX NO HEADER (Desktop)
    // ========================================
    if (!isMobile) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('header');
            
            if (header && scrolled < 300) {
                header.style.transform = `translateY(${scrolled * 0.3}px)`;
                header.style.opacity = 1 - (scrolled / 500);
            }
        });
    }

    // ========================================
    // HIGHLIGHT DO LINK ATIVO NA NAVEGAÇÃO
    // ========================================
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`nav a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('nav a').forEach(link => link.classList.remove('active'));
                if (navLink) navLink.classList.add('active');
            }
        });
    });

    // ========================================
    // PREVINE DUPLO TAP ZOOM (iOS)
    // ========================================
    const isTouch = 'ontouchstart' in window;
    if (isTouch) {
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // ========================================
    // LAZY LOADING PARA IMAGENS
    // ========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ========================================
    // PREVINE LINKS PLACEHOLDER
    // ========================================
    document.querySelectorAll('a[href="#"]').forEach(link => {
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Em breve! Este link será ativado.', 'info');
            });
        }
    });

    // ========================================
    // COPIAR E-MAIL PARA ÁREA DE TRANSFERÊNCIA
    // ========================================
    const copyButtons = document.querySelectorAll('.copy-btn[data-copy]');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const text = btn.getAttribute('data-copy');
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(text);
                } else {
                    // Fallback para navegadores antigos
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'absolute';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                btn.classList.add('copied');
                btn.textContent = 'Copiado!';
                showNotification('E-mail copiado para a área de transferência.', 'success');
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.textContent = 'Copiar';
                }, 1500);
            } catch (err) {
                console.error('Falha ao copiar e-mail:', err);
                showNotification('Não foi possível copiar. Tente manualmente.', 'error');
            }
        });
    });

    // ========================================
    // WHATSAPP: mensagem personalizada no clique
    // ========================================
    const whatsappLink = document.getElementById('whatsappLink');
    if (whatsappLink) {
        whatsappLink.addEventListener('click', (e) => {
            // Coleta dados do formulário, se existirem
            const nome = (document.getElementById('nome')?.value || '').trim();
            const sobrenome = (document.getElementById('sobrenome')?.value || '').trim();
            const mensagem = (document.getElementById('mensagem')?.value || '').trim();

            const temNome = nome || sobrenome;
            const nomeCompleto = [nome, sobrenome].filter(Boolean).join(' ');

            let texto = '';
            if (temNome && mensagem) {
                texto = `Olá Igor! Meu nome é ${nomeCompleto}. Vim pelo seu portfólio e gostaria de conversar sobre: ${mensagem}`;
            } else if (temNome) {
                texto = `Olá Igor! Meu nome é ${nomeCompleto}. Vim pelo seu portfólio e gostaria de conversar sobre um projeto.`;
            } else if (mensagem) {
                texto = `Olá Igor! Vim pelo seu portfólio e gostaria de conversar sobre: ${mensagem}`;
            } else {
                texto = 'Olá Igor! Vim pelo seu portfólio pessoal e gostaria de conversar sobre um projeto. Podemos falar?';
            }

            const encoded = encodeURIComponent(texto);

            // Garante que o href será atualizado antes de abrir nova aba
            const base = 'https://wa.me/5524998190280?text=';
            whatsappLink.setAttribute('href', base + encoded);
        });
    }

    // ========================================
    // MENSAGEM DE BOAS-VINDAS (Console)
    // ========================================
    console.log('%c👋 Olá! Bem-vindo ao meu portfólio!', 
        'font-size: 16px; font-weight: bold; color: #0D6EFD;');
    console.log('%cSe você está aqui, provavelmente gosta de tecnologia tanto quanto eu! 🚀', 
        'font-size: 12px; color: #555;');
    console.log('%cVamos conversar? Entre em contato! 💬', 
        'font-size: 12px; color: #28a745;');

    // Marca evento de boas-vindas
    track('console_welcome');

    // ========================================
    // REGISTRO DO SERVICE WORKER (PWA)
    // ========================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.warn('SW registro falhou:', err);
        });
    }

});
