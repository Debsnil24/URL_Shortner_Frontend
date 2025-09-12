import { useStore } from "@/store/useStore";
import { useEffect } from "react";

/**
 * Custom hook for handling hash-based modal routing
 * Opens modals based on URL hash and clears hash when modals are closed
 */
export function useHashModalRouting() {
    const {
        isSupportOpen,
        isPrivacyPolicyOpen,
        isTermsOfServiceOpen,
        isAuthDialogOpen,

        setIsSupportOpen,
        setIsPrivacyPolicyOpen,
        setIsTermsOfServiceOpen,
        setAuthDialogOpen,
        setIsLogin,
    } = useStore();

    // Handle hash-based routing for modals
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;

            switch (hash) {
                case "#support":
                    setIsSupportOpen(true);
                    break;
                case "#privacy-policy":
                    setIsPrivacyPolicyOpen(true);
                    break;
                case "#terms-of-service":
                    setIsTermsOfServiceOpen(true);
                    break;
                case "#login":
                    setAuthDialogOpen(true);
                    setIsLogin(true);
                    break;
                case "#signup":
                    setAuthDialogOpen(true);
                    setIsLogin(false);
                    break;
                default:
                    // Close all modals if no matching hash
                    setIsSupportOpen(false);
                    setIsPrivacyPolicyOpen(false);
                    setIsTermsOfServiceOpen(false);
                    setAuthDialogOpen(false);
                    break;
            }
        };

        // Check hash on initial load
        handleHashChange();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashChange);

        // Cleanup
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [setIsSupportOpen, setIsPrivacyPolicyOpen, setIsTermsOfServiceOpen, setAuthDialogOpen, setIsLogin]);

    // Clear hash when modals are closed
    useEffect(() => {
        const currentHash = window.location.hash;

        // If there's a hash but no modal is open, clear the hash
        if (
            currentHash &&
            !isSupportOpen &&
            !isPrivacyPolicyOpen &&
            !isTermsOfServiceOpen &&
            !isAuthDialogOpen
        ) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [isSupportOpen, isPrivacyPolicyOpen, isTermsOfServiceOpen, isAuthDialogOpen]);
}
