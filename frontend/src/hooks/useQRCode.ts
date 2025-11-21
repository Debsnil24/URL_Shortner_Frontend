import { apiService, ShortUrl } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

/**
 * Hook for loading and generating QR codes
 */
export const useQRCode = (link: ShortUrl, isOpen: boolean) => {
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

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

    useEffect(() => {
        if (isOpen && link) {
            loadQRCode();
        }
    }, [isOpen, link, loadQRCode]);

    return { qrCodeUrl, generating };
};

