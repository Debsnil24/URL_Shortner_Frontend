import { apiService, ShortUrl } from "@/services/api";
import { downloadFile } from "@/utils/fileUtils";
import {
    canvasImageToDataUrl,
    fetchImageAsDataUrl,
    waitForImages,
} from "@/utils/imageUtils";
import { addToast } from "@heroui/react";
import * as htmlToImage from "html-to-image";
import { RefObject, useCallback, useState } from "react";

const QR_COLORS = {
    gray950: "#030712",
} as const;

/**
 * Hook for downloading QR code as image
 */
export const useQRCodeDownload = (
    qrCodeUrl: string | null,
    link: ShortUrl,
    containerRef: RefObject<HTMLDivElement | null>
) => {
    const [downloading, setDownloading] = useState(false);

    const getQRCodeDataUrl = useCallback(async (): Promise<string> => {
        if (!containerRef.current || !qrCodeUrl) {
            throw new Error("QR code container or URL not available");
        }

        const downloadQrUrl = apiService.getQRCodeUrl(link.short_code, true);
        const absoluteQrUrl = downloadQrUrl.startsWith("http")
            ? downloadQrUrl
            : `${window.location.origin}${downloadQrUrl}`;

        // Try to use already-loaded image from DOM
        const qrImgElement = containerRef.current.querySelector(
            `img[src="${qrCodeUrl}"], img[src*="${link.short_code}"]`
        ) as HTMLImageElement;

        if (
            qrImgElement &&
            qrImgElement.complete &&
            qrImgElement.naturalWidth > 0
        ) {
            try {
                return canvasImageToDataUrl(qrImgElement);
            } catch {
                // Fallback to fetch if canvas fails (CORS)
                return fetchImageAsDataUrl(absoluteQrUrl);
            }
        }

        // Fetch if not loaded
        return fetchImageAsDataUrl(absoluteQrUrl);
    }, [containerRef, qrCodeUrl, link.short_code]);

    const downloadQRImage = useCallback(async () => {
        const container = containerRef.current;
        if (!container || !qrCodeUrl) return;

        setDownloading(true);
        try {
            // Get QR code as data URL
            const qrImageDataUrl = await getQRCodeDataUrl();

            // Wait for other images (logo, etc.) to load
            await waitForImages(container, qrCodeUrl);

            // Capture the component as PNG
            const dataUrl = await htmlToImage.toPng(container, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: QR_COLORS.gray950,
                cacheBust: true,
                filter: (node) => {
                    // Replace QR code image src with data URL to avoid CORS
                    if (node instanceof HTMLImageElement && node.src === qrCodeUrl) {
                        node.src = qrImageDataUrl;
                    }
                    return true;
                },
            });

            // Download the image
            downloadFile(dataUrl, `sniply-qr-${link.short_code}.png`);

            addToast({
                title: "Success",
                description: "QR code downloaded successfully",
                color: "success",
            });
        } catch (error) {
            console.error("Failed to download QR code image:", error);
            addToast({
                title: "Error",
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to download QR code. Please try again.",
                color: "danger",
            });
        } finally {
            setDownloading(false);
        }
    }, [containerRef, qrCodeUrl, link.short_code, getQRCodeDataUrl]);

    return { downloading, downloadQRImage };
};

