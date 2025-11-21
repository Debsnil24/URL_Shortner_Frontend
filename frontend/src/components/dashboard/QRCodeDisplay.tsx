import { resolveShortUrl } from "@/utils/urlUtils";
import Image from "next/image";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { apiService } from "@/services/api";
import { useQRCodeToken } from "@/hooks/useQRCodeToken";

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  shortCode: string;
  tagline?: string;
  showTagline: boolean;
  containerRef: RefObject<HTMLDivElement | null>;
}

const COLORS = {
  gray950: "#030712",
  gray800: "#1f2937",
  gray400: "#9ca3af",
  white: "#ffffff",
} as const;

export default function QRCodeDisplay({
  qrCodeUrl,
  shortCode,
  tagline,
  showTagline,
  containerRef,
}: QRCodeDisplayProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const { getQRToken } = useQRCodeToken();

  // Add cache-bust to ensure fresh request
  const freshQrCodeUrl = useMemo(() => {
    if (!qrCodeUrl) return qrCodeUrl;
    
    // Remove existing _t parameter to avoid duplicates
    const cleanUrl = qrCodeUrl.split('&_t=')[0].split('?_t=')[0];
    const separator = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${separator}_t=${Date.now()}`;
  }, [qrCodeUrl]);

  // Fetch image with QR token for cross-origin requests
  useEffect(() => {
    if (!freshQrCodeUrl) {
      setImageSrc("");
      setImageError(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    // Fetch QR token and then fetch image
    getQRToken(shortCode)
      .then(async (qrToken) => {
        if (!isMounted) return;
        
        try {
          // Use QR token for authenticated fetch
          const blob = await apiService.fetchAuthenticatedImage(freshQrCodeUrl, qrToken || undefined);
          
          if (!isMounted) return;
          const url = URL.createObjectURL(blob);
          // Clean up previous blob URL
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current);
          }
          blobUrlRef.current = url;
          setImageSrc(url);
          setImageError(false);
        } catch (error) {
          // If QR token fetch fails, try fallback without token (cookie auth)
          if (!isMounted) return;
          console.error("Failed to load QR code image with token:", error);
          
          // Try fallback: fetch without token (will use cookie)
          try {
            const blob = await apiService.fetchAuthenticatedImage(freshQrCodeUrl);
            if (!isMounted) return;
            const url = URL.createObjectURL(blob);
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
            }
            blobUrlRef.current = url;
            setImageSrc(url);
            setImageError(false);
          } catch (fallbackError) {
            // If fallback also fails, use direct URL (will work if CORS is fixed on backend)
            console.error("Fallback fetch also failed:", fallbackError);
            // Note: Direct URL will only work if backend adds CORS headers
            // For now, set error state but still try to display
            setImageError(true);
            setImageSrc(freshQrCodeUrl); // Last resort: direct URL (may fail due to CORS)
          }
        }
      })
      .catch((error) => {
        if (!isMounted || error.name === 'AbortError') return;
        console.error("Failed to get QR token:", error);
        
        // Try to fetch without token (cookie auth)
        apiService.fetchAuthenticatedImage(freshQrCodeUrl)
          .then((blob) => {
            if (!isMounted) return;
            const url = URL.createObjectURL(blob);
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current);
            }
            blobUrlRef.current = url;
            setImageSrc(url);
            setImageError(false);
          })
          .catch((fallbackError) => {
            if (!isMounted) return;
            console.error("Fallback fetch failed:", fallbackError);
            setImageError(true);
            // Last resort: direct URL
            setImageSrc(freshQrCodeUrl);
          });
      });

    return () => {
      isMounted = false;
      abortController.abort();
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [freshQrCodeUrl, shortCode, getQRToken]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-950 border border-gray-800 pt-6 pb-12 px-6 rounded-lg"
      style={{
        backgroundColor: COLORS.gray950,
        borderColor: COLORS.gray800,
      }}
    >
      <div className="flex items-center justify-center mb-4">
        <Image
          src="/SNIPLY.svg"
          alt="Sniply Logo"
          width={100}
          height={100}
          className="invert-100"
        />
      </div>
      <div
        className="bg-white p-4 rounded-lg"
        style={{ backgroundColor: COLORS.white }}
      >
        {imageError ? (
          <div className="w-64 h-64 flex items-center justify-center text-gray-400">
            Failed to load QR code
          </div>
        ) : (
          <img
            src={imageSrc || freshQrCodeUrl}
            alt="QR Code"
            className="w-64 h-64"
            key={freshQrCodeUrl}
          />
        )}
      </div>
      {showTagline && (
        <div className="flex flex-col items-center justify-center mt-4">
          <p
            className="text-sm text-white font-bold italic"
            style={{ color: COLORS.white }}
          >
            {tagline?.trim() || "Your tagline appears here"}
          </p>
        </div>
      )}
      <div className="flex flex-col items-center justify-center mt-4">
        <p className="text-sm text-gray-400" style={{ color: COLORS.gray400 }}>
          Scan the QR code to open the link
        </p>
        <p
          className="text-sm text-gray-400 font-bold"
          style={{ color: COLORS.gray400 }}
        >
          {resolveShortUrl(shortCode)}
        </p>
      </div>
    </div>
  );
}
