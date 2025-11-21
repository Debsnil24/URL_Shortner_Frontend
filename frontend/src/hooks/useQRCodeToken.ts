import { apiService, QRTokenResponse } from "@/services/api";
import { useCallback, useState } from "react";

interface QRTokenCache {
    token: string;
    expiresAt: number; // timestamp in milliseconds
}

// Module-level cache that persists across component mounts/unmounts
const tokenCache = new Map<string, QRTokenCache>();

// Refresh token 1 minute before expiry to prevent expired token errors
const CACHE_BUFFER_MS = 60 * 1000; // 1 minute buffer

/**
 * Hook to manage QR code authentication tokens
 * Fetches short-lived tokens (5 minutes) for QR code image requests
 * Implements caching with automatic refresh before expiry
 * Cache persists across component mounts/unmounts
 */
export function useQRCodeToken() {
    const [loading, setLoading] = useState(false);

    /**
     * Get QR token for a specific short code
     * Returns cached token if valid, otherwise fetches new token
     */
    const getQRToken = useCallback(async (shortCode: string): Promise<string | null> => {
        const cached = tokenCache.get(shortCode);
        const now = Date.now();

        // Return cached token if still valid (with buffer)
        if (cached && cached.expiresAt > now + CACHE_BUFFER_MS) {
            return cached.token;
        }

        // Fetch new token
        setLoading(true);
        try {
            const response = await apiService.getQRCodeToken(shortCode);
            
            if (response.success && response.data) {
                const { token, expires_in } = response.data;
                
                // Calculate expiry timestamp (expires_in is in seconds)
                const expiresAt = now + (expires_in * 1000);
                
                // Cache the token (module-level cache persists across mounts)
                tokenCache.set(shortCode, { token, expiresAt });
                
                return token;
            }
            
            // If API call fails, return null (will fallback to cookie auth)
            return null;
        } catch (error) {
            console.error("Failed to fetch QR token:", error);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Clear token cache for a specific short code
     */
    const clearToken = useCallback((shortCode: string) => {
        tokenCache.delete(shortCode);
    }, []);

    /**
     * Clear all cached tokens (useful on logout)
     */
    const clearAllTokens = useCallback(() => {
        tokenCache.clear();
    }, []);

    return {
        getQRToken,
        clearToken,
        clearAllTokens,
        loading,
    };
}

