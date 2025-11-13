import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomModal from "../customModal";

interface CreateLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  error: string | null;
  isLoading: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
}

export default function CreateLinkModal({
  isOpen,
  onOpenChange,
  url,
  error,
  isLoading,
  onUrlChange,
  onSubmit,
}: CreateLinkModalProps) {
  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="md"
    >
      <div className="flex flex-col gap-4 -mt-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          Create a Short Link
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            type="url"
            placeholder="https://example.com/very/long/url"
            value={url}
            onValueChange={onUrlChange}
            isInvalid={!!error}
            errorMessage={error || undefined}
            startContent={
              <Icon icon="mdi:link" className="w-5 h-5 text-gray-700" />
            }
            labelPlacement="outside"
            classNames={{
              input: ["placeholder:text-xs", "text-black"],
            }}
            className="w-full"
          />
          <Button
            color="primary"
            radius="full"
            isLoading={isLoading}
            isDisabled={isLoading}
            onPress={onSubmit}
            className="text-md font-semibold w-full"
            startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
          >
            Shorten URL
          </Button>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">
          Links are tied to your account and can be managed from this dashboard.
        </p>
      </div>
    </CustomModal>
  );
}

