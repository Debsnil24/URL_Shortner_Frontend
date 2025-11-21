import { resolveShortUrl } from "@/utils/urlUtils";
import Image from "next/image";
import { RefObject } from "react";

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
        <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
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
