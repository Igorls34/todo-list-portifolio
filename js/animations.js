// ==========================================
// ANIMATIONS - Fade In on Scroll
// ==========================================

export function initAnimations() {
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

    // Observa todas as seções
    const elements = document.querySelectorAll('section, .focus-section, .presentation-section, .hard-skills, .soft-skills');
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}
