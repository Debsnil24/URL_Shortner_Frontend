import { apiService, UrlStats } from "@/services/api";
import { mapApiErrorMessage } from "@/utils/apiUtils";
import { addToast } from "@heroui/react";
import { useCallback, useState } from "react";

export interface StatsState {
    loading: boolean;
    error?: string;
    data?: UrlStats;
}

export function useLinkStats() {
    const [statsState, setStatsState] = useState<Record<string, StatsState>>({});

    const loadStats = useCallback(async (code: string) => {
        setStatsState((prev) => ({
            ...prev,
            [code]: {
                loading: true,
                error: undefined,
                data: prev[code]?.data,
            },
        }));

        const response = await apiService.getShortUrlStats(code);
        if (response.success && response.data) {
            setStatsState((prev) => ({
                ...prev,
                [code]: {
                    loading: false,
                    data: response.data,
                    error: undefined,
                },
            }));
        } else {
            const message = mapApiErrorMessage(
                response.message,
                response.error?.code
            );
            setStatsState((prev) => ({
                ...prev,
                [code]: {
                    loading: false,
                    data: undefined,
                    error: message,
                },
            }));
            addToast({
                title: "Unable to fetch stats",
                description: message,
                color: "warning",
            });
        }
    }, []);

    const createToggleStats = useCallback(
        (setExpandedCode: React.Dispatch<React.SetStateAction<string | null>>, expandedCodeRef: React.MutableRefObject<string | null>) => {
            return (code: string) => {
                setExpandedCode((current: string | null) => {
                    const nextCode = current === code ? null : code;
                    expandedCodeRef.current = nextCode;
                    if (nextCode) {
                        // Always reload stats when expanding to get fresh data
                        void loadStats(nextCode);
                    }
                    return nextCode;
                });
            };
        },
        [loadStats]
    );

    const clearStats = useCallback((code: string) => {
        setStatsState((prev) => {
            const next = { ...prev };
            delete next[code];
            return next;
        });
    }, []);

    const initializeStats = useCallback((code: string) => {
        setStatsState((prev) => ({
            ...prev,
            [code]: { loading: false },
        }));
    }, []);

    return {
        statsState,
        loadStats,
        createToggleStats,
        clearStats,
        initializeStats,
    };
}

