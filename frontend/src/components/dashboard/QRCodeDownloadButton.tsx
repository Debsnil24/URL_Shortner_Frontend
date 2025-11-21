import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

interface QRCodeDownloadButtonProps {
  onDownload: () => void;
  downloading: boolean;
}

export default function QRCodeDownloadButton({
  onDownload,
  downloading,
}: QRCodeDownloadButtonProps) {
  return (
    <Button
      color="primary"
      variant="solid"
      onPress={onDownload}
      isLoading={downloading}
      startContent={
        !downloading && <Icon icon="mdi:download" className="w-4 h-4" />
      }
    >
      {downloading ? "Downloading..." : "Download QR Code"}
    </Button>
  );
}
