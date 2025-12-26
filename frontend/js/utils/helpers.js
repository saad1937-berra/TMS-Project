// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function showAlert(message, type = 'info') {
    // Simple alert function - can be enhanced with a proper notification system
    alert(message);
}

function confirmAction(message) {
    return confirm(message);
}

// Export functions for use in other modules
window.formatDate = formatDate;
window.showAlert = showAlert;
window.confirmAction = confirmAction;
