"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";

export const useAuthSimple = () => {
    const {
        isAuthenticated,
        user,
        setAuthenticated,
        setUser,
        setLoading,
        isLoading
    } = useStore();

    const login = async (email: string, password: string) => {
        setLoading(true);

        try {
            const response = await apiService.login({ email, password });

            if (response.success && response.data) {
                setAuthenticated(true);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, error: response.error?.message || 'Login failed' };
            }
        } catch (error: unknown) {
            console.error('Login error:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (firstName: string, lastName: string, email: string, password: string) => {
        setLoading(true);

        try {
            const response = await apiService.register({
                email,
                password,
                first_name: firstName,
                last_name: lastName
            });

            if (response.success && response.data) {
                setAuthenticated(true);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, error: response.error?.message || 'Signup failed' };
            }
        } catch (error: unknown) {
            console.error('Signup error:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('sniply_auth');
            localStorage.removeItem('sniply_user');
            setAuthenticated(false);
            setUser(null);
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = apiService.getGoogleAuthUrl();
    };


    return {
        isAuthenticated,
        user,
        isLoading,
        login,
        signup,
        logout,
        handleGoogleAuth
    };
};
