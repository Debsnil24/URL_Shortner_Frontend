// Utility functions for authentication management

export const clearAllAuthData = () => {
    if (typeof window === 'undefined') return;

    // Clear all authentication-related localStorage items
    localStorage.removeItem('sniply_auth');
    localStorage.removeItem('sniply_user');
    localStorage.removeItem('sniply_last_validation');

    console.log('All authentication data cleared');
};

export const isTestToken = (token: string): boolean => {
    // Check if the token looks like a test token
    // Test tokens are typically UUIDs or have specific patterns
    const testTokenPatterns = [
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID pattern
        /^test_/i, // Starts with "test_"
        /^mock_/i, // Starts with "mock_"
    ];

    return testTokenPatterns.some(pattern => pattern.test(token));
};

export const getStoredToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
        const authData = localStorage.getItem('sniply_auth');
        if (authData) {
            const parsed = JSON.parse(authData);
            return parsed.token;
        }
    } catch (error) {
        console.error('Error parsing stored auth data:', error);
    }

    return null;
};

export const validateTokenFormat = (token: string): boolean => {
    // Basic JWT token validation (should have 3 parts separated by dots)
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Check if it's a test token
    if (isTestToken(token)) {
        console.warn('Test token detected:', token);
        return false;
    }

    return true;
};

// Development helper function
export const debugAuthState = () => {
    if (typeof window === 'undefined') return;

    const authData = localStorage.getItem('sniply_auth');
    const userData = localStorage.getItem('sniply_user');
    const lastValidation = localStorage.getItem('sniply_last_validation');

    console.log('=== Auth Debug Info ===');
    console.log('Auth Data:', authData);
    console.log('User Data:', userData);
    console.log('Last Validation:', lastValidation);

    if (authData) {
        try {
            const parsed = JSON.parse(authData);
            const token = parsed.token;
            console.log('Token:', token);
            console.log('Is Test Token:', isTestToken(token));
            console.log('Token Format Valid:', validateTokenFormat(token));
        } catch (error) {
            console.error('Error parsing auth data:', error);
        }
    }
    console.log('======================');
};

