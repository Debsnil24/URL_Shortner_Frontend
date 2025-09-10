import { create } from 'zustand'

interface User {
    id: string
    email: string
    name: string
    first_name?: string
    last_name?: string
    provider?: 'email' | 'google' | 'apple'
}

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

export const useStore = create<AppState>((set) => ({
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
    setAuthDialogOpen: (open) => set({ isAuthDialogOpen: open }),
    setIsLogin: (isLogin) => set({ isLogin }),
    setIsPrivacyPolicyOpen: (open) => set({ isPrivacyPolicyOpen: open }),
    setIsTermsOfServiceOpen: (open) => set({ isTermsOfServiceOpen: open }),
    setIsSupportOpen: (open) => set({ isSupportOpen: open }),
}))
