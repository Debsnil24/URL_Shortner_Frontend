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

export interface ShortUrl {
    id: string;
    short_code: string;
    original_url: string;
    click_count: number;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    expires_at?: string | null;
    last_visit_at?: string | null;
    last_visit_user_agent?: string | null;
    total_visits?: number;
}

export interface CreateShortUrlRequest {
    url: string;
}

export interface UrlStats {
    short_code: string;
    original_url: string;
    click_count: number;
    total_visits: number;
    last_visit_at: string | null;
    last_visit_user_agent: string | null;
}

interface RequestConfig {
    allow401?: boolean;
    suppressSessionExpiryToast?: boolean;
}

class ApiService {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private wasPreviouslyAuthenticated(): boolean {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('sniply_user');
    }

    private clearAuth(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('sniply_user');
    }

    private normalizeErrorResponse<T>(
        base: Partial<ApiResponse<T>> | null,
        fallbackMessage: string,
        fallbackCode: string
    ): ApiResponse<T> {
        const message =
            base?.error?.message || base?.message || fallbackMessage || 'Request failed';
        const code = base?.error?.code || fallbackCode;

        return {
            success: false,
            message,
            error: {
                code,
                message,
            },
            data: base?.data,
        };
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const url = `${this.baseURL}${endpoint}`;
        const requestConfig: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include',
            ...options,
        };

        const { allow401 = false, suppressSessionExpiryToast = false } = config;

        try {
            const response = await fetch(url, requestConfig);
            let data: ApiResponse<T> | null = null;

            try {
                data = (await response.json()) as ApiResponse<T>;
            } catch {
                data = null;
            }

            if (response.status === 401) {
                if (!allow401) {
                    const wasAuthed = this.wasPreviouslyAuthenticated();
                    this.clearAuth();
                    if (wasAuthed && !suppressSessionExpiryToast) {
                        toastBus.setSessionExpired();
                    }
                }
                return this.normalizeErrorResponse<T>(
                    data,
                    'Authentication failed',
                    'AUTH_401'
                );
            }

            if (response.status === 504) {
                return this.normalizeErrorResponse<T>(
                    data,
                    'Request timeout',
                    'GATEWAY_TIMEOUT'
                );
            }

            if (!response.ok) {
                return this.normalizeErrorResponse<T>(
                    data,
                    data?.error?.message || data?.message || 'Request failed',
                    `HTTP_${response.status}`
                );
            }

            if (data && typeof data === 'object' && 'success' in data) {
                return data as ApiResponse<T>;
            }

            const message =
                data && typeof data === 'object' && 'message' in data && typeof (data as { message: unknown }).message === 'string'
                    ? (data as { message: string }).message
                    : 'OK';

            return {
                success: true,
                message,
                data: data as T,
            };
        } catch (error) {
            console.error('API request failed:', error);
            const message =
                error instanceof Error ? error.message : 'Network error. Please try again.';
            return this.normalizeErrorResponse<T>(null, message, 'NETWORK_ERROR');
        }
    }

    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await this.request<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        if (!response.success || !response.data) {
            return response;
        }

        const user = response.data.user;
        if (!user) {
            return this.normalizeErrorResponse<AuthResponse>(
                response,
                'No user data received from server',
                'INVALID_RESPONSE'
            );
        }

        const transformedUser = {
            ...user,
            name:
                user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                    ? user.email.split('@')[0]
                    : 'User',
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('sniply_user', JSON.stringify(transformedUser));
        }

        return {
            ...response,
            data: {
                ...response.data,
                user: transformedUser,
            },
        };
    }

    async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
        const response = await this.request<AuthResponse>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (!response.success || !response.data) {
            return response;
        }

        const user = response.data.user;
        if (!user) {
            return this.normalizeErrorResponse<AuthResponse>(
                response,
                'No user data received from server',
                'INVALID_RESPONSE'
            );
        }

        const transformedUser = {
            ...user,
            name:
                user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                    ? user.email.split('@')[0]
                    : 'User',
        };

        if (typeof window !== 'undefined') {
            localStorage.setItem('sniply_user', JSON.stringify(transformedUser));
        }

        return {
            ...response,
            data: {
                ...response.data,
                user: transformedUser,
            },
        };
    }

    async getCurrentUser(): Promise<ApiResponse<User>> {
        const response = await this.request<User>(
            '/auth/me',
            undefined,
            {
                allow401: true,
                suppressSessionExpiryToast: true,
            }
        );

        if (!response.success || !response.data) {
            return response;
        }

        const user = response.data;
        const transformedUser = {
            ...user,
            name:
                user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                    ? user.email.split('@')[0]
                    : 'User',
        };

        return {
            ...response,
            data: transformedUser,
        };
    }

    async listShortUrls(): Promise<ApiResponse<ShortUrl[]>> {
        return this.request<ShortUrl[]>('/api/urls');
    }

    async createShortUrl(payload: CreateShortUrlRequest): Promise<ApiResponse<ShortUrl>> {
        return this.request<ShortUrl>('/api/shorten', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }

    async deleteShortUrl(shortCode: string): Promise<ApiResponse<null>> {
        return this.request<null>(`/api/delete/${encodeURIComponent(shortCode)}`, {
            method: 'DELETE',
        });
    }

    async getShortUrlStats(shortCode: string): Promise<ApiResponse<UrlStats>> {
        return this.request<UrlStats>(
            `/api/urls/${encodeURIComponent(shortCode)}/stats`
        );
    }

    async logout(): Promise<ApiResponse<null>> {
        const response = await this.request<null>('/auth/logout', {
            method: 'POST',
        });

        if (!response.success) {
            console.error(
                'Logout request failed:',
                response.error?.message || response.message
            );
        }

        this.clearAuth();
        return response;
    }

    getGoogleAuthUrl(): string {
        return `${this.baseURL}/auth/google`;
    }
}

export const apiService = new ApiService(API_BASE_URL);
