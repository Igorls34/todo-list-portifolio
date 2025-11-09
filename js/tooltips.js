// ==========================================
// TOOLTIPS - Sistema de Tooltips das Skills
// ==========================================

import { track } from './tracker.js';

export function initTooltips() {
    // Detecta se é dispositivo touch
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    const skillItemsWithTooltip = document.querySelectorAll('.skill-item[data-description]');
    let activeTooltip = null;
    let activeSkillItem = null;

    // Função para posicionar tooltip dinamicamente
    function positionTooltip(tooltip, skillItem) {
        const rect = skillItem.getBoundingClientRect();
        const tooltipHeight = tooltip.offsetHeight;
        const tooltipWidth = tooltip.offsetWidth;
        const viewportWidth = window.innerWidth;
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
        document.body.appendChild(tooltip);

        // Para desktop: mostrar no hover
        if (!isTouch) {
            skillItem.addEventListener('mouseenter', () => {
                positionTooltip(tooltip, skillItem);
                tooltip.classList.add('show');
                activeTooltip = tooltip;
                activeSkillItem = skillItem;
                track('tooltip_open', { skill: (skillItem.querySelector('span')?.innerText || '').trim() });
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
                    track('tooltip_close', { skill: (skillItem.querySelector('span')?.innerText || '').trim() });
                } else {
                    positionTooltip(tooltip, skillItem);
                    tooltip.classList.add('show');
                    activeTooltip = tooltip;
                    activeSkillItem = skillItem;
                    track('tooltip_open', { skill: (skillItem.querySelector('span')?.innerText || '').trim() });
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

    // Reposiciona tooltips ao redimensionar
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (activeTooltip && activeSkillItem) {
                positionTooltip(activeTooltip, activeSkillItem);
            }
        }, 100);
    });
}
