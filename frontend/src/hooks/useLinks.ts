import { apiService, ShortUrl } from "@/services/api";
import { mapApiErrorMessage } from "@/utils/apiUtils";
import { addToast } from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseLinksReturn {
    links: ShortUrl[];
    linksLoading: boolean;
    linksError: string | null;
    activeLinks: ShortUrl[];
    expiredLinks: ShortUrl[];
    totalLinks: number;
    totalClicks: number;
    activeLinksCount: number;
    fetchLinks: () => Promise<void>;
    setLinks: React.Dispatch<React.SetStateAction<ShortUrl[]>>;
}

export function useLinks(isAuthenticated: boolean): UseLinksReturn {
    const [links, setLinks] = useState<ShortUrl[]>([]);
    const [linksLoading, setLinksLoading] = useState(true);
    const [linksError, setLinksError] = useState<string | null>(null);

    const fetchLinks = useCallback(async () => {
        if (!isAuthenticated) {
            setLinks([]);
            setLinksLoading(false);
            return;
        }
        setLinksLoading(true);
        setLinksError(null);

        const response = await apiService.listShortUrls();
        if (response.success && response.data) {
            setLinks(response.data);
        } else {
            const message = mapApiErrorMessage(
                response.message,
                response.error?.code
            );
            setLinksError(message);
            addToast({
                title: "Unable to load links",
                description: message,
                color: "danger",
            });
        }
        setLinksLoading(false);
    }, [isAuthenticated]);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    // Separate active and expired links
    const { activeLinks, expiredLinks } = useMemo(() => {
        const now = new Date();
        const active: ShortUrl[] = [];
        const expired: ShortUrl[] = [];

        links.forEach((link) => {
            if (!link.expires_at) {
                // Links without expiration are considered active
                active.push(link);
            } else {
                try {
                    const expirationDate = new Date(link.expires_at);
                    if (expirationDate.getTime() < now.getTime()) {
                        expired.push(link);
                    } else {
                        active.push(link);
                    }
                } catch {
                    // If date parsing fails, treat as active
                    active.push(link);
                }
            }
        });

        return { activeLinks: active, expiredLinks: expired };
    }, [links]);

    const totalLinks = useMemo(() => links.length, [links]);
    const totalClicks = useMemo(
        () => links.reduce((acc, link) => acc + (link.click_count || 0), 0),
        [links]
    );
    const activeLinksCount = activeLinks.length;

    return {
        links,
        linksLoading,
        linksError,
        activeLinks,
        expiredLinks,
        totalLinks,
        totalClicks,
        activeLinksCount,
        fetchLinks,
        setLinks,
    };
}

