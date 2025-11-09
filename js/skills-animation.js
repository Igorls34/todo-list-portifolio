// ==========================================
// SKILLS ANIMATION - Animação sequencial das skills
// ==========================================

export function initSkillsAnimation() {
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
}
