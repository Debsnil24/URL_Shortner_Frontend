import { apiService, ShortUrl } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook for loading and generating QR codes
 */
export const useQRCode = (link: ShortUrl, isOpen: boolean) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [regenerating, setRegenerating] = useState(false);

    const loadQRCode = useCallback(async () => {
        if (!link.qr_code_available) {
            setGenerating(true);
            try {
                const response = await apiService.generateQRCode(link.short_code, 512);
                if (response.success) {
                    setQrCodeUrl(apiService.getQRCodeUrl(link.short_code));
                }
            } catch (error) {
                console.error("Failed to generate QR code:", error);
            } finally {
                setGenerating(false);
            }
        } else {
            setQrCodeUrl(apiService.getQRCodeUrl(link.short_code));
        }
    }, [link]);

    const regenerateQRCode = useCallback(async (size: number = 512) => {
        setRegenerating(true);
        try {
            // Use regenerate=true query parameter to force regeneration
            // Cache-bust is already included in getQRCodeUrl
            const regeneratedUrl = apiService.getQRCodeUrl(link.short_code, false, true, size);
            setQrCodeUrl(regeneratedUrl);
        } catch (error) {
            console.error("Failed to regenerate QR code:", error);
        } finally {
            setRegenerating(false);
        }
    }, [link.short_code]);

    useEffect(() => {
        if (isOpen && link) {
            loadQRCode();
        }
    }, [isOpen, link, loadQRCode]);

    return { qrCodeUrl, generating, regenerating, regenerateQRCode };
};

