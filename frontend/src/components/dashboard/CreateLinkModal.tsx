"use client";

import { useExpirationForm } from "@/hooks/useExpirationForm";
import {
  CUSTOM_TIME_FIELDS,
  EXPIRATION_PRESETS,
} from "@/utils/expirationConstants";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback } from "react";
import CustomModal from "../customModal";
import CustomTimeInputs from "./CustomTimeInputs";
import ExpirationPresetSelector from "./ExpirationPresetSelector";

export interface ExpirationData {
  expiration_preset?:
    | "default"
    | "1hour"
    | "12hours"
    | "1day"
    | "7days"
    | "1month"
    | "6months"
    | "1year";
  custom_expiration?: {
    years: string;
    months: string;
    days: string;
    hours: string;
    minutes: string;
  };
}

interface CreateLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  error: string | null;
  isLoading: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (expirationData: ExpirationData) => void;
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
  const {
    selectedPreset,
    customTime,
    isCustomSelected,
    handlePresetSelect,
    handleCustomTimeChange,
    resetForm,
    buildExpirationData,
  } = useExpirationForm();

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    },
    [onOpenChange, resetForm]
  );

  return (
    <CustomModal isOpen={isOpen} onOpenChange={handleModalClose} size="md">
      <div className="flex flex-col gap-4 -mt-4">
        <h2 className="text-xl font-semibold text-white mb-2">
          Create a Short Link
        </h2>
        <div className="flex flex-col gap-4 -mt-8">
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
            label="URL"
            classNames={{
              input: ["placeholder:text-xs", "text-black"],
            }}
            className="w-full"
          />

          <ExpirationPresetSelector
            presets={EXPIRATION_PRESETS}
            selectedPreset={selectedPreset}
            onPresetSelect={handlePresetSelect}
          />

          {isCustomSelected && (
            <CustomTimeInputs
              values={customTime}
              fields={CUSTOM_TIME_FIELDS}
              onChange={handleCustomTimeChange}
            />
          )}

          <Button
            color="primary"
            radius="full"
            isLoading={isLoading}
            isDisabled={isLoading}
            onPress={() => {
              onSubmit(buildExpirationData());
            }}
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
