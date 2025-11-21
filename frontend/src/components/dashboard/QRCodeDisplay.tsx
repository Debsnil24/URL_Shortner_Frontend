import { resolveShortUrl } from "@/utils/urlUtils";
import Image from "next/image";
import { RefObject, useMemo } from "react";

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
  // Add cache-bust to ensure fresh request (not from disk cache)
  // Generate fresh URL each time qrCodeUrl changes
  const freshQrCodeUrl = useMemo(() => {
    if (!qrCodeUrl) return qrCodeUrl;
    const separator = qrCodeUrl.includes("?") ? "&" : "?";
    return `${qrCodeUrl}${separator}_t=${Date.now()}`;
  }, [qrCodeUrl]);

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
        <img
          src={freshQrCodeUrl}
          alt="QR Code"
          className="w-64 h-64"
          key={freshQrCodeUrl}
        />
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
