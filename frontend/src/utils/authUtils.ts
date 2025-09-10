// Utility functions for authentication management

export const clearAllAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear all authentication-related localStorage items
    localStorage.removeItem('sniply_user');
    localStorage.removeItem('sniply_last_validation');

    console.log('All authentication data cleared');
};

// Development helper function
export const debugAuthState = () => {
    if (typeof window === 'undefined') return;

    const userData = localStorage.getItem('sniply_user');
    const lastValidation = localStorage.getItem('sniply_last_validation');

    console.log('=== Auth Debug Info ===');
    console.log('User Data:', userData);
    console.log('Last Validation:', lastValidation);
    console.log('======================');
};

