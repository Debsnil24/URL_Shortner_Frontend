// API service layer for backend communication
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
            ...options,
        };

        // Add Authorization header if token exists
        const token = this.getToken();
        if (token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${token}`,
            };
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle different status codes
            if (response.status === 401) {
                // Token expired or invalid - clear auth state
                this.clearAuth();
                throw new Error('Authentication failed');
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

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        const authData = localStorage.getItem('sniply_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                return parsed.token;
            } catch {
                return null;
            }
        }
        return null;
    }

    public setToken(token: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem('sniply_auth', JSON.stringify({ token }));
    }

    private clearAuth(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('sniply_auth');
        localStorage.removeItem('sniply_user');
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

            this.setToken(response.data.token);
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

            this.setToken(response.data.token);
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
        const response = await this.request<User>('/auth/me');

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
        this.clearAuth();
    }

    // OAuth endpoints
    getGoogleAuthUrl(): string {
        return `${this.baseURL}/auth/google`;
    }

}

export const apiService = new ApiService(API_BASE_URL);
