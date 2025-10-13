// API service layer for backend communication
import { toastBus } from '@/utils/toastUtils';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    provider?: 'email' | 'google' | 'apple';
    avatar_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
}

class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Include cookies in requests
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle different status codes
            if (response.status === 401) {
                // Token expired or invalid - clear auth state
                let wasAuthenticated = false;
                if (typeof window !== 'undefined') {
                    // If user data existed, consider it a session timeout
                    wasAuthenticated = !!localStorage.getItem('sniply_user');
                }
                this.clearAuth();
                if (wasAuthenticated) {
                    // Mark session expired so landing page shows a toast gracefully
                    toastBus.setSessionExpired();
                }
                // Return a structured error instead of throwing to avoid noisy stack traces
                return {
                    success: false,
                    message: 'Authentication failed',
                    error: {
                        code: 'AUTH_401',
                        message: (data && (data.error?.message || data.message)) || 'Authentication failed',
                    },
                } as ApiResponse<T>;
            }

            if (response.status === 504) {
                // Request timeout - don't logout, just throw timeout error
                throw new Error('Request timeout');
            }

            if (!response.ok) {
                throw new Error(data.error?.message || data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    private clearAuth(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('sniply_user');
    }

    // Special request method for auth checking that doesn't throw on 401
    private async requestWithoutAuthError<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Include cookies in requests
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle different status codes - but don't throw on 401 for auth checking
            if (response.status === 401) {
                // Return the error response instead of throwing
                return data;
            }

            if (response.status === 504) {
                // Request timeout - don't logout, just throw timeout error
                throw new Error('Request timeout');
            }

            if (!response.ok) {
                throw new Error(data.error?.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (response.success && response.data) {
            // Check if user data exists
            if (!response.data.user) {
                throw new Error('No user data received from server');
            }

            // Transform backend user data to include name field
            const user = response.data.user;
            const transformedUser = {
                ...user,
                name: user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email ? user.email.split('@')[0] : 'User'
            };

            // Store user data in localStorage (token is now in HttpOnly cookie)
            localStorage.setItem('sniply_user', JSON.stringify(transformedUser));

            return {
                ...response,
                data: {
                    ...response.data,
                    user: transformedUser
                }
            };
        }

        return response;
    }

    async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (response.success && response.data) {
            // Check if user data exists
            if (!response.data.user) {
                throw new Error('No user data received from server');
            }

            // Transform backend user data to include name field
            const user = response.data.user;
            const transformedUser = {
                ...user,
                name: user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email ? user.email.split('@')[0] : 'User'
            };

            // Store user data in localStorage (token is now in HttpOnly cookie)
            localStorage.setItem('sniply_user', JSON.stringify(transformedUser));

            return {
                ...response,
                data: {
                    ...response.data,
                    user: transformedUser
                }
            };
        }

        return response;
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        // Use a special method that doesn't throw on 401 for auth checking
        const response = await this.requestWithoutAuthError<User>('/auth/me');

        if (response.success && response.data) {
            // Transform backend user data to include name field
            const user = response.data;
            const transformedUser = {
                ...user,
                name: user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email ? user.email.split('@')[0] : 'User'
            };

            return {
                ...response,
                data: transformedUser
            };
        }

        return response;
    }

    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearAuth();
        }
    }

    // OAuth endpoints
    getGoogleAuthUrl(): string {
        return `${this.baseURL}/auth/google`;
    }

}

export const apiService = new ApiService(API_BASE_URL);
