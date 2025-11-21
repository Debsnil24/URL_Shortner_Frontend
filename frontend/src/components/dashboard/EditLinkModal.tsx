"use client";

import { useExpirationForm } from "@/hooks/useExpirationForm";
import { calculateExpirationFromDate } from "@/utils/dateUtils";
import {
  CUSTOM_TIME_FIELDS,
  EXPIRATION_PRESETS,
} from "@/utils/expirationConstants";
import { Button, Checkbox, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useEffect, useState } from "react";
import CustomModal from "../customModal";
import { ExpirationData } from "./CreateLinkModal";
import CustomTimeInputs from "./CustomTimeInputs";
import ExpirationPresetSelector from "./ExpirationPresetSelector";

export interface EditLinkData {
  url?: string;
  expirationData?: ExpirationData;
}

interface EditLinkModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  originalUrl: string;
  expiresAt: string | null | undefined;
  error: string | null;
  isLoading: boolean;
  onUrlChange: (value: string) => void;
  onSubmit: (data: EditLinkData) => void;
}

export default function EditLinkModal({
  isOpen,
  onOpenChange,
  originalUrl,
  expiresAt,
  error,
  isLoading,
  onUrlChange,
  onSubmit,
}: EditLinkModalProps) {
  const [modifyExpiration, setModifyExpiration] = useState(false);
  const [originalUrlRef, setOriginalUrlRef] = useState(originalUrl);
  const [originalExpiresAtRef, setOriginalExpiresAtRef] = useState(expiresAt);

  const {
    selectedPreset,
    customTime,
    isCustomSelected,
    setSelectedPreset,
    setCustomTime,
    handlePresetSelect,
    handleCustomTimeChange,
    resetForm: resetExpirationForm,
    buildExpirationData,
  } = useExpirationForm();

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Store original values when modal opens
      setOriginalUrlRef(originalUrl);
      setOriginalExpiresAtRef(expiresAt);
      setModifyExpiration(false);
      const { preset, customTime: calculatedCustomTime } =
        calculateExpirationFromDate(expiresAt);
      setSelectedPreset(preset);
      setCustomTime(calculatedCustomTime);
    }
  }, [isOpen, originalUrl, expiresAt, setSelectedPreset, setCustomTime]);

  const resetForm = useCallback(() => {
    setModifyExpiration(false);
    const { preset, customTime: calculatedCustomTime } =
      calculateExpirationFromDate(originalExpiresAtRef);
    setSelectedPreset(preset);
    setCustomTime(calculatedCustomTime);
    resetExpirationForm();
  }, [
    originalExpiresAtRef,
    setSelectedPreset,
    setCustomTime,
    resetExpirationForm,
  ]);

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
          Edit Short Link
        </h2>
        <div className="flex flex-col gap-4 -mt-8">
          <Input
            type="url"
            placeholder="https://example.com/very/long/url"
            value={originalUrl}
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

          <Checkbox
            isSelected={modifyExpiration}
            onValueChange={setModifyExpiration}
            classNames={{
              label: "text-gray-300 text-sm",
            }}
          >
            <span className="text-sm text-gray-300">
              Modify expiration date
            </span>
          </Checkbox>

          {modifyExpiration && (
            <>
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
            </>
          )}

          <Button
            color="warning"
            radius="full"
            isLoading={isLoading}
            isDisabled={isLoading}
            onPress={() => {
              const updateData: EditLinkData = {};

              // Only include URL if it changed
              if (originalUrl.trim() !== originalUrlRef.trim()) {
                updateData.url = originalUrl.trim();
              }

              // Only include expiration data if modification is enabled
              if (modifyExpiration) {
                updateData.expirationData = buildExpirationData();
              }

              onSubmit(updateData);
            }}
            className="text-md font-semibold w-full"
            startContent={<Icon icon="mdi:pencil" className="w-4 h-4" />}
          >
            Update Link
          </Button>
        </div>
        <p className="text-gray-500 text-xs md:text-sm">
          Update the URL and expiration settings for this link.
        </p>
      </div>
    </CustomModal>
  );
}
