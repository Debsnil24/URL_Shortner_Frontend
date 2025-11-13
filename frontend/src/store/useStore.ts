import { create } from 'zustand'
import { User } from '@/services/api'

interface AppState {
    // Auth state
    isAuthenticated: boolean
    user: User | null

    // UI state
    isLoading: boolean
    isAuthDialogOpen: boolean
    isLogin: boolean
    isPrivacyPolicyOpen: boolean
    isTermsOfServiceOpen: boolean
    isSupportOpen: boolean
    // Actions
    setAuthenticated: (isAuth: boolean) => void
    setUser: (user: User | null) => void
    setLoading: (loading: boolean) => void
    logout: () => void
    setAuthDialogOpen: (open: boolean) => void
    setIsLogin: (isLogin: boolean) => void
    setIsPrivacyPolicyOpen: (open: boolean) => void
    setIsTermsOfServiceOpen: (open: boolean) => void
    setIsSupportOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set, get) => ({
    // Initial state
    isAuthenticated: false,
    user: null,
    isLoading: false,
    isAuthDialogOpen: false,
    isLogin: true,
    isPrivacyPolicyOpen: false,
    isTermsOfServiceOpen: false,
    isSupportOpen: false,
    // Actions
    setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),
    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ isLoading: loading }),
    logout: () => set({ isAuthenticated: false, user: null }),
    setAuthDialogOpen: (open) => {
        set({ isAuthDialogOpen: open });
        if (open) {
            // Set hash based on current login state
            const hash = get().isLogin ? "#login" : "#signup";
            window.history.pushState({}, "", window.location.pathname + hash);
        }
    },
    setIsLogin: (isLogin) => {
        set({ isLogin });
        // Update hash if auth dialog is open
        if (get().isAuthDialogOpen) {
            const hash = isLogin ? "#login" : "#signup";
            window.history.pushState({}, "", window.location.pathname + hash);
        }
    },
    setIsPrivacyPolicyOpen: (open) => {
        set({ isPrivacyPolicyOpen: open });
        if (open) {
            window.history.pushState({}, "", window.location.pathname + "#privacy-policy");
        }
    },
    setIsTermsOfServiceOpen: (open) => {
        set({ isTermsOfServiceOpen: open });
        if (open) {
            window.history.pushState({}, "", window.location.pathname + "#terms-of-service");
        }
    },
    setIsSupportOpen: (open) => {
        set({ isSupportOpen: open });
        if (open) {
            window.history.pushState({}, "", window.location.pathname + "#support");
        }
    },
}))