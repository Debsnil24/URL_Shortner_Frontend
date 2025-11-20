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
    shortened_url?: string;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    expires_at?: string | null;
    last_visit_at?: string | null;
    last_visit_user_agent?: string | null;
    unique_visitors?: number;
}

export interface CustomExpiration {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
}

export interface CreateShortUrlRequest {
    url: string;
    expiration_preset?: "default" | "1hour" | "12hours" | "1day" | "7days" | "1month" | "6months" | "1year";
    custom_expiration?: CustomExpiration;
}

export interface UrlStats {
    short_code: string;
    original_url: string;
    click_count: number;
    unique_visitors: number;
    last_visit_at: string | null;
    last_visit_user_agent: string | null;
}

export interface SupportRequest {
    name: string;
    email: string;
    message: string;
}

interface RequestConfig {
    allow401?: boolean;
    suppressSessionExpiryToast?: boolean;
    suppressNetworkErrorLog?: boolean;
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

    /**
     * Transforms a user object by computing the display name.
     * Uses first_name + last_name if available, otherwise email prefix, otherwise "User".
     */
    private transformUser(user: User): User {
        return {
            ...user,
            name:
                user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.email
                        ? user.email.split('@')[0]
                        : 'User',
        };
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

        const { allow401 = false, suppressSessionExpiryToast = false, suppressNetworkErrorLog = false } = config;

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

            if (response.status === 429) {
                // Preserve backend error code if available, otherwise use HTTP_429
                const errorCode = data?.error?.code || 'HTTP_429';
                return this.normalizeErrorResponse<T>(
                    data,
                    data?.error?.message || data?.message || 'Too many requests. Please try again later.',
                    errorCode
                );
            }

            if (!response.ok) {
                // Preserve backend error code if available
                const errorCode = data?.error?.code || `HTTP_${response.status}`;
                return this.normalizeErrorResponse<T>(
                    data,
                    data?.error?.message || data?.message || 'Request failed',
                    errorCode
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
            // Only log network errors if not suppressed (e.g., during background auth checks)
            if (!suppressNetworkErrorLog) {
                console.error('API request failed:', error);
            }
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

        const transformedUser = this.transformUser(user);

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

        const transformedUser = this.transformUser(user);

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
                suppressNetworkErrorLog: true,
            }
        );

        if (!response.success || !response.data) {
            return response;
        }

        const transformedUser = this.transformUser(response.data);

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

    async submitSupportRequest(payload: SupportRequest): Promise<ApiResponse<null>> {
        return this.request<null>('/api/support', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
}

export const apiService = new ApiService(API_BASE_URL);
