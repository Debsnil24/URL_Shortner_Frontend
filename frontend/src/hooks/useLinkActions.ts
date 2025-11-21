import { ExpirationData } from "@/components/dashboard/CreateLinkModal";
import { EditLinkData } from "@/components/dashboard/EditLinkModal";
import { apiService, ShortUrl } from "@/services/api";
import { mapApiErrorMessage } from "@/utils/apiUtils";
import { resolveShortUrl, validateUrl } from "@/utils/urlUtils";
import { addToast } from "@heroui/react";
import { useCallback, useState } from "react";

interface UseLinkActionsProps {
    onLinksUpdate?: (updater: (prev: ShortUrl[]) => ShortUrl[]) => void;
    onStatsRefresh?: (code: string) => void;
    onStatsClear?: (code: string) => void;
    onStatsInitialize?: (code: string) => void;
    expandedCode?: string | null;
    setExpandedCode?: (code: string | null) => void;
    expandedCodeRef?: React.MutableRefObject<string | null>;
}

export function useLinkActions({
    onLinksUpdate,
    onStatsRefresh,
    onStatsClear,
    onStatsInitialize,
    expandedCode,
    setExpandedCode,
    expandedCodeRef,
}: UseLinkActionsProps) {
    const [creating, setCreating] = useState(false);
    const [deletingCode, setDeletingCode] = useState<string | null>(null);
    const [updatingStatusCode, setUpdatingStatusCode] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    const handleCreateLink = useCallback(
        async (url: string, expirationData: ExpirationData) => {
            const error = validateUrl(url);
            if (error) {
                return { success: false, error };
            }

            setCreating(true);
            const response = await apiService.createShortUrl({
                url: url.trim(),
                ...expirationData,
            });

            if (response.success && response.data) {
                const createdLink = response.data;
                addToast({
                    title: "Short link created",
                    description: `${createdLink.shortened_url ?? resolveShortUrl(createdLink.short_code)
                        }`,
                    color: "success",
                });
                onStatsInitialize?.(createdLink.short_code);
                setCreating(false);
                return { success: true, data: createdLink };
            } else {
                const message = mapApiErrorMessage(
                    response.message,
                    response.error?.code
                );
                addToast({
                    title: "Unable to create link",
                    description: message,
                    color: "danger",
                });
                setCreating(false);
                return { success: false, error: message };
            }
        },
        [onStatsInitialize]
    );

    const handleDeleteLink = useCallback(
        async (code: string) => {
            setDeletingCode(code);
            const response = await apiService.deleteShortUrl(code);
            if (response.success) {
                addToast({
                    title: "Short link deleted",
                    description: `${code} has been removed`,
                    color: "success",
                });
                onLinksUpdate?.((prev) => prev.filter((link) => link.short_code !== code));
                onStatsClear?.(code);
                if (expandedCode === code && setExpandedCode) {
                    setExpandedCode(null);
                    if (expandedCodeRef) {
                        expandedCodeRef.current = null;
                    }
                }
            } else {
                const message = mapApiErrorMessage(
                    response.message,
                    response.error?.code
                );
                addToast({
                    title: "Unable to delete link",
                    description: message,
                    color: "danger",
                });
            }
            setDeletingCode(null);
        },
        [onLinksUpdate, onStatsClear, expandedCode, setExpandedCode, expandedCodeRef]
    );

    const handlePauseResume = useCallback(
        async (code: string, status: "active" | "paused") => {
            setUpdatingStatusCode(code);
            try {
                const response = await apiService.updateLinkStatus(code, status);
                if (response.success && response.data) {
                    const updatedLink = response.data;
                    const action = status === "paused" ? "paused" : "resumed";
                    addToast({
                        title: `Link ${action} successfully`,
                        description: `Short link ${code} has been ${action}`,
                        color: "success",
                    });
                    onLinksUpdate?.((prev) =>
                        prev.map((link) => (link.short_code === code ? updatedLink : link))
                    );
                } else {
                    const message = mapApiErrorMessage(
                        response.message,
                        response.error?.code
                    );
                    addToast({
                        title: "Unable to update link status",
                        description: message,
                        color: "danger",
                    });
                }
            } catch (error) {
                addToast({
                    title: "Unable to update link status",
                    description: "An error occurred while updating the link status",
                    color: "danger",
                });
            } finally {
                setUpdatingStatusCode(null);
            }
        },
        [onLinksUpdate]
    );

    const handleUpdateLink = useCallback(
        async (link: ShortUrl, updateData: EditLinkData) => {
            // Validate URL only if it's being updated
            if (updateData.url !== undefined) {
                const error = validateUrl(updateData.url);
                if (error) {
                    return { success: false, error };
                }
            }

            // Ensure at least one field is being updated
            if (!updateData.url && !updateData.expirationData) {
                return { success: false, error: "Please update at least one field (URL or expiration)" };
            }

            setUpdating(true);
            try {
                const payload: {
                    url?: string;
                    expiration_preset?:
                    | "default"
                    | "1hour"
                    | "12hours"
                    | "1day"
                    | "7days"
                    | "1month"
                    | "6months"
                    | "1year";
                    custom_expiration?: {
                        years: string;
                        months: string;
                        days: string;
                        hours: string;
                        minutes: string;
                    };
                } = {};

                if (updateData.url) {
                    payload.url = updateData.url;
                }

                if (updateData.expirationData) {
                    if (updateData.expirationData.expiration_preset) {
                        payload.expiration_preset =
                            updateData.expirationData.expiration_preset;
                    } else if (updateData.expirationData.custom_expiration) {
                        payload.custom_expiration =
                            updateData.expirationData.custom_expiration;
                    }
                }

                const response = await apiService.updateShortUrl(
                    link.short_code,
                    payload
                );

                if (response.success && response.data) {
                    const updatedLink = response.data;
                    addToast({
                        title: "Link updated successfully",
                        description: `Short link ${updatedLink.short_code} has been updated`,
                        color: "success",
                    });

                    onLinksUpdate?.((prev) =>
                        prev.map((l) =>
                            l.short_code === link.short_code ? { ...l, ...updatedLink } : l
                        )
                    );

                    // Refresh stats if the link is currently expanded
                    if (expandedCode === link.short_code) {
                        onStatsRefresh?.(link.short_code);
                    }

                    setUpdating(false);
                    return { success: true };
                } else {
                    const message = mapApiErrorMessage(
                        response.message,
                        response.error?.code
                    );

                    // Handle specific error cases
                    if (response.error?.code === "HTTP_410") {
                        addToast({
                            title: "Cannot update expired link",
                            description:
                                "Update the expiration date to reactivate this link.",
                            color: "warning",
                        });
                        setUpdating(false);
                        return { success: false, error: "This link has expired. Update the expiration date to reactivate it." };
                    } else {
                        addToast({
                            title: "Unable to update link",
                            description: message,
                            color: "danger",
                        });
                        setUpdating(false);
                        return { success: false, error: message };
                    }
                }
            } catch (error) {
                console.error("Failed to update link:", error);
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to update link";
                addToast({
                    title: "Unable to update link",
                    description: errorMessage,
                    color: "danger",
                });
                setUpdating(false);
                return { success: false, error: errorMessage };
            }
        },
        [onLinksUpdate, onStatsRefresh, expandedCode]
    );

    const handleCopy = useCallback(async (code: string) => {
        try {
            await navigator.clipboard.writeText(resolveShortUrl(code));
            addToast({
                title: "Copied to clipboard",
                description: `Short link for ${code}`,
                color: "success",
            });
        } catch (error) {
            console.error("Clipboard copy failed", error);
            addToast({
                title: "Copy failed",
                description: "Unable to copy the link. Please try again.",
                color: "danger",
            });
        }
    }, []);

    return {
        creating,
        deletingCode,
        updatingStatusCode,
        updating,
        handleCreateLink,
        handleDeleteLink,
        handlePauseResume,
        handleUpdateLink,
        handleCopy,
    };
}

