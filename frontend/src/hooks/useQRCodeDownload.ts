import { apiService, ShortUrl } from "@/services/api";
import { downloadFile } from "@/utils/fileUtils";
import {
    canvasImageToDataUrl,
    fetchAuthenticatedImageAsDataUrl,
    waitForImages,
    blobToDataUrl,
} from "@/utils/imageUtils";
import { addToast } from "@heroui/react";
import * as htmlToImage from "html-to-image";
import { RefObject, useCallback, useState } from "react";
import { useQRCodeToken } from "./useQRCodeToken";

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
    const { getQRToken } = useQRCodeToken();

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
            `img[src*="${link.short_code}"], img[src*="qr"]`
        ) as HTMLImageElement;

        if (
            qrImgElement &&
            qrImgElement.complete &&
            qrImgElement.naturalWidth > 0
        ) {
            try {
                return canvasImageToDataUrl(qrImgElement);
            } catch {
                // Fallback to authenticated fetch with QR token
                const qrToken = await getQRToken(link.short_code);
                return fetchAuthenticatedImageAsDataUrl(absoluteQrUrl, qrToken || undefined);
            }
        }

        // Fetch with QR token
        const qrToken = await getQRToken(link.short_code);
        return fetchAuthenticatedImageAsDataUrl(absoluteQrUrl, qrToken || undefined);
    }, [containerRef, qrCodeUrl, link.short_code, getQRToken]);

    const getLogoDataUrl = useCallback(async (): Promise<string> => {
        const logoUrl = `${window.location.origin}/SNIPLY.svg`;
        
        try {
            // Try to get from DOM first
            const container = containerRef.current;
            if (container) {
                const logoImg = container.querySelector('img[src*="SNIPLY"], img[alt="Sniply Logo"]') as HTMLImageElement;
                if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
                    try {
                        return canvasImageToDataUrl(logoImg);
                    } catch {
                        // Fall through to fetch
                    }
                }
            }
            
            // Fetch the logo (no auth needed for local asset, but use same pattern)
            const response = await fetch(logoUrl, {
                credentials: "include",
                mode: "cors",
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch logo: ${response.status}`);
            }
            
            const blob = await response.blob();
            return blobToDataUrl(blob);
        } catch (error) {
            console.error("Failed to load logo:", error);
            // Return a transparent 1x1 pixel as fallback
            return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIi8+";
        }
    }, [containerRef]);

    const downloadQRImage = useCallback(async () => {
        const container = containerRef.current;
        if (!container || !qrCodeUrl) return;

        setDownloading(true);
        try {
            // Get QR code and logo as data URLs
            const [qrImageDataUrl, logoDataUrl] = await Promise.all([
                getQRCodeDataUrl(),
                getLogoDataUrl(),
            ]);

            // Wait for other images to load
            await waitForImages(container, qrCodeUrl);

            // Capture the component as PNG
            const dataUrl = await htmlToImage.toPng(container, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: QR_COLORS.gray950,
                cacheBust: true,
                filter: (node) => {
                    // Replace images with data URLs to avoid CORS
                    if (node instanceof HTMLImageElement) {
                        // Replace QR code
                        if (node.src.includes(link.short_code) || node.src.includes("qr") || node.alt === "QR Code") {
                            node.src = qrImageDataUrl;
                        }
                        // Replace logo
                        else if (node.src.includes("SNIPLY") || node.alt === "Sniply Logo") {
                            node.src = logoDataUrl;
                        }
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
    }, [containerRef, qrCodeUrl, link.short_code, getQRCodeDataUrl, getLogoDataUrl]);

    return { downloading, downloadQRImage };
};

