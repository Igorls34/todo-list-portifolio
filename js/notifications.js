// ==========================================
// NOTIFICATIONS - Sistema de Notificações
// ==========================================

export function showNotification(message, type = 'info') {
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
