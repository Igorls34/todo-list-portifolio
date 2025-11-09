// ========================================
// PORTFÓLIO PESSOAL - INTERATIVIDADE
// ========================================

// Espera o DOM carregar completamente
document.addEventListener('DOMContentLoaded', function() {
    
    // Detecta se é dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // ========================================
    // 1. NAVEGAÇÃO SUAVE (Smooth Scroll)
    // ========================================
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = isMobile ? 80 : 100;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Adiciona feedback visual no link clicado
                navLinks.forEach(l => l.style.opacity = '0.7');
                this.style.opacity = '1';
                setTimeout(() => {
                    navLinks.forEach(l => l.style.opacity = '1');
                }, 1000);
            }
        });
    });

    // ========================================
    // 2. ANIMAÇÃO DE ENTRADA (Fade In on Scroll)
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);

    // Elementos a serem animados
    const animatedElements = document.querySelectorAll(
        '.skill-item, .focus-section, .presentation-section, ' +
        '.experience-section, .values-section, .differential-section, ' +
        '.hard-skills, .soft-skills, .projects-placeholder, ' +
        '.contact-methods, .social-links'
    );

    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // ========================================
    // 3. CONTADOR ANIMADO PARA SKILLS
    // ========================================
    const skillItems = document.querySelectorAll('.skill-item');
    let skillsAnimated = false;

    const skillObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                skillsAnimated = true;
                skillItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            item.style.transition = 'all 0.5s ease';
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 50);
                    }, index * 100);
                });
            }
        });
    }, { threshold: 0.2 });

    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        skillObserver.observe(skillsGrid);
    }

    // ========================================
    // 4. VALIDAÇÃO E ENVIO DO FORMULÁRIO
    // ========================================
    
    // Controle do modal
    const formModal = document.getElementById('formModal');
    const openFormBtn = document.getElementById('openFormBtn');
    const closeFormBtn = document.getElementById('closeFormBtn');
    const contactForm = document.getElementById('contactForm');
    
    // Abre o modal
    if (openFormBtn) {
        openFormBtn.addEventListener('click', function() {
            formModal.classList.add('active');
            document.body.classList.add('modal-open');
            document.body.style.overflow = 'hidden'; // Previne scroll do body
            
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
        document.body.style.overflow = ''; // Restaura scroll
        contactForm.reset();
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
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validação simples
            const nome = document.getElementById('nome').value.trim();
            const sobrenome = document.getElementById('sobrenome').value.trim();
            const mensagem = document.getElementById('mensagem').value.trim();
            
            if (!nome || !sobrenome || !mensagem) {
                showNotification('Por favor, preencha todos os campos obrigatórios.', 'error');
                return;
            }
            
            // Simula envio (animação do botão)
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            
            submitBtn.textContent = 'Enviando...';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.6';
            
            // Simula delay de envio
            setTimeout(() => {
                submitBtn.textContent = '✓ Enviado!';
                submitBtn.style.background = '#28a745';
                
                showNotification('Mensagem enviada com sucesso! Entrarei em contato em breve.', 'success');
                
                // Fecha o modal após sucesso
                setTimeout(() => {
                    closeModal();
                    
                    // Restaura o botão
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.background = '#0D6EFD';
                }, 2000);
            }, 1500);
        });
    }

    // ========================================
    // 5. SISTEMA DE NOTIFICAÇÕES
    // ========================================
    function showNotification(message, type = 'info') {
        // Remove notificação anterior se existir
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Anima entrada
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove após 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // ========================================
    // 6. EFEITO PARALLAX SUAVE NO HEADER (Desabilitado em mobile)
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
    // 7. HIGHLIGHT DO LINK ATIVO NA NAVEGAÇÃO
    // ========================================
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // ========================================
    // 8. ANIMAÇÃO NOS ÍCONES DE CONTATO (Adaptado para touch)
    // ========================================
    const contactIcons = document.querySelectorAll('.contact-item, .social-item');
    
    contactIcons.forEach(item => {
        if (isTouch) {
            // Para dispositivos touch, adiciona feedback ao tocar
            item.addEventListener('touchstart', function() {
                const icon = this.querySelector('.icon');
                if (icon) {
                    icon.style.transform = 'scale(1.15)';
                    icon.style.transition = 'all 0.2s ease';
                }
            });
            
            item.addEventListener('touchend', function() {
                const icon = this.querySelector('.icon');
                if (icon) {
                    setTimeout(() => {
                        icon.style.transform = 'scale(1)';
                    }, 100);
                }
            });
        } else {
            // Para desktop, mantém o hover
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(5deg)';
                    icon.style.transition = 'all 0.3s ease';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        }
    });

    // ========================================
    // 10. OTIMIZAÇÕES PARA PERFORMANCE MOBILE
    // ========================================
    if (isMobile) {
        // Reduz a frequência de eventos de scroll
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    // Processa scroll aqui se necessário
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Previne zoom duplo-toque em alguns elementos
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    // ========================================
    // 11. LAZY LOADING PARA IMAGENS
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
    // 12. TOOLTIPS DAS SKILLS (Clique/Hover)
    // ========================================
    const skillItemsWithTooltip = document.querySelectorAll('.skill-item[data-description]');
    let activeTooltip = null;
    let activeSkillItem = null;

    // Função para posicionar tooltip dinamicamente
    function positionTooltip(tooltip, skillItem) {
        const rect = skillItem.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        const tooltipWidth = tooltip.offsetWidth;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        // Margem de segurança das bordas
        const margin = 16;
        
        // Calcula posição vertical (acima do card por padrão)
        let top = rect.top + scrollY - tooltipHeight - 12;
        
        // Se não couber acima, posiciona abaixo
        let arrowPosition = 'top';
        if (top < scrollY + margin) {
            top = rect.bottom + scrollY + 12;
            arrowPosition = 'bottom';
        }
        
        // Calcula posição horizontal (centralizado no card)
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        
        // Ajusta se sair pela esquerda
        if (left < margin) {
            left = margin;
        }
        
        // Ajusta se sair pela direita
        if (left + tooltipWidth > viewportWidth - margin) {
            left = viewportWidth - tooltipWidth - margin;
        }
        
        // Aplica posicionamento
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        
        // Ajusta a seta do tooltip
        const arrowOffset = rect.left + (rect.width / 2) - left;
        tooltip.style.setProperty('--arrow-left', `${arrowOffset}px`);
        
        // Remove classes de posição anteriores
        tooltip.classList.remove('tooltip-top', 'tooltip-bottom');
        tooltip.classList.add(`tooltip-${arrowPosition}`);
    }

    skillItemsWithTooltip.forEach(skillItem => {
        const description = skillItem.getAttribute('data-description');
        
        // Cria elemento tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'skill-tooltip';
        tooltip.textContent = description;
        document.body.appendChild(tooltip); // Adiciona ao body para posicionamento fixed

        // Para desktop: mostrar no hover
        if (!isTouch) {
            skillItem.addEventListener('mouseenter', () => {
                positionTooltip(tooltip, skillItem);
                tooltip.classList.add('show');
                activeTooltip = tooltip;
                activeSkillItem = skillItem;
            });

            skillItem.addEventListener('mouseleave', () => {
                tooltip.classList.remove('show');
                if (activeTooltip === tooltip) {
                    activeTooltip = null;
                    activeSkillItem = null;
                }
            });
        }

        // Para mobile: toggle no clique
        if (isTouch) {
            skillItem.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Fecha tooltip anterior se existir
                if (activeTooltip && activeTooltip !== tooltip) {
                    activeTooltip.classList.remove('show');
                }
                
                // Toggle tooltip atual
                if (tooltip.classList.contains('show')) {
                    tooltip.classList.remove('show');
                    activeTooltip = null;
                    activeSkillItem = null;
                } else {
                    positionTooltip(tooltip, skillItem);
                    tooltip.classList.add('show');
                    activeTooltip = tooltip;
                    activeSkillItem = skillItem;
                }
            });
        }
    });

    // Fecha tooltip ao clicar fora (mobile)
    if (isTouch) {
        document.addEventListener('click', (e) => {
            if (activeTooltip && !e.target.closest('.skill-item')) {
                activeTooltip.classList.remove('show');
                activeTooltip = null;
                activeSkillItem = null;
            }
        });
    }

    // Reposiciona tooltips ao redimensionar/rolar (para casos de hover ativo)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeTooltip && activeSkillItem) {
                positionTooltip(activeTooltip, activeSkillItem);
            }
        }, 100);
    });

    // ========================================
    // 9. MENSAGEM DE BOAS-VINDAS (Console)
    // ========================================
    console.log('%c👋 Olá! Bem-vindo ao meu portfólio!', 
        'font-size: 16px; font-weight: bold; color: #0D6EFD;');
    console.log('%cSe você está aqui, provavelmente gosta de tecnologia tanto quanto eu! 🚀', 
        'font-size: 12px; color: #555;');
    console.log('%cVamos conversar? Entre em contato! 💬', 
        'font-size: 12px; color: #28a745;');

    // ========================================
    // 13. PREVINE LINKS PLACEHOLDER (apenas "#" exato)
    // ========================================
    document.querySelectorAll('a[href="#"]').forEach(link => {
        // Verifica se é exatamente "#" e não um link de navegação como "#about"
        if (link.getAttribute('href') === '#') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Em breve! Este link será ativado.', 'info');
            });
        }
    });

});
