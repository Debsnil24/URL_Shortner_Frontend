"use client";

import { useQRCode } from "@/hooks/useQRCode";
import { useQRCodeDownload } from "@/hooks/useQRCodeDownload";
import { ShortUrl } from "@/services/api";
import { Button, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRef, useState } from "react";
import CustomModal from "../customModal";
import QRCodeDisplay from "./QRCodeDisplay";
import QRCodeDownloadButton from "./QRCodeDownloadButton";
import QRCodeTaglineInput from "./QRCodeTaglineInput";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: ShortUrl;
}

export default function QRCodeModal({
  isOpen,
  onClose,
  link,
}: QRCodeModalProps) {
  const [includeTagline, setIncludeTagline] = useState(false);
  const [tagline, setTagline] = useState("");
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const { qrCodeUrl, generating, regenerating, regenerateQRCode } = useQRCode(
    link,
    isOpen
  );
  const { downloading, downloadQRImage } = useQRCodeDownload(
    qrCodeUrl,
    link,
    qrContainerRef
  );

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={(open: boolean) => !open && onClose()}
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-4">
          {generating ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner size="lg" />
              <p className="text-sm text-gray-400">Generating QR code...</p>
            </div>
          ) : qrCodeUrl ? (
            <QRCodeDisplay
              qrCodeUrl={qrCodeUrl}
              shortCode={link.short_code}
              tagline={tagline}
              showTagline={includeTagline}
              containerRef={qrContainerRef}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Unable to load QR code</p>
            </div>
          )}
        </div>
        {qrCodeUrl && (
          <>
            <QRCodeTaglineInput
              includeTagline={includeTagline}
              tagline={tagline}
              onIncludeTaglineChange={setIncludeTagline}
              onTaglineChange={setTagline}
            />
            <div className="flex justify-center gap-2">
              <Button
                color="secondary"
                variant="bordered"
                onPress={() => regenerateQRCode(512)}
                isLoading={regenerating}
                isDisabled={regenerating}
                startContent={
                  !regenerating && (
                    <Icon icon="mdi:refresh" className="w-4 h-4" />
                  )
                }
              >
                Regenerate QR
              </Button>
              <QRCodeDownloadButton
                onDownload={downloadQRImage}
                downloading={downloading}
              />
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
}
