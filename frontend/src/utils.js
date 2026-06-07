export const formatCurrency = (amount) => {
    const val = parseFloat(amount);
    return isNaN(val) ? '₹ 0.00' : '₹ ' + val.toFixed(2);
};

// Toast notifications
export const showToast = (message, type = 'success') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-notification-root';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-item';
    
    // Set colors based on type
    if (type === 'error') toast.style.borderLeftColor = '#ef4444';
    if (type === 'info') toast.style.borderLeftColor = '#3b82f6';

    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon" style="background: ${type === 'error' ? '#ef4444' : (type === 'info' ? '#3b82f6' : '#10b981')}">
                ${type === 'error' ? '!' : (type === 'info' ? 'i' : '✓')}
            </div>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" type="button" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);

    const closeToast = () => {
        if (!toast.classList.contains('hiding')) {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }
    };

    toast.querySelector('.toast-close').onclick = (e) => {
        e.stopPropagation();
        closeToast();
    };

    // Auto-hide after 3 seconds
    setTimeout(closeToast, 3000);
};
