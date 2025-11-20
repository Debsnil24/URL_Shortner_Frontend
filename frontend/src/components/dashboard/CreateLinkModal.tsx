"use client";

import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useMemo, useState } from "react";
import CustomModal from "../customModal";
import CustomTimeInputs, {
  CustomTimeField,
  CustomTimeInputs as CustomTimeInputsType,
} from "./CustomTimeInputs";
import ExpirationPresetSelector, {
  ExpirationPresetOption,
} from "./ExpirationPresetSelector";

type ExpirationPreset =
  | "default"
  | "1hour"
  | "12hours"
  | "1day"
  | "7days"
  | "1month"
  | "6months"
  | "1year"
  | "custom";

const EXPIRATION_PRESETS: ExpirationPresetOption[] = [
  { value: "default", label: "5 Years", icon: "mdi:calendar-clock" },
  { value: "1hour", label: "1 Hour", icon: "mdi:clock-outline" },
  { value: "12hours", label: "12 Hours", icon: "mdi:clock-time-twelve" },
  { value: "1day", label: "1 Day", icon: "mdi:calendar-today" },
  { value: "7days", label: "7 Days", icon: "mdi:calendar-week" },
  { value: "1month", label: "1 Month", icon: "mdi:calendar-month" },
  { value: "6months", label: "6 Months", icon: "mdi:calendar-range" },
  { value: "1year", label: "1 Year", icon: "mdi:calendar-star" },
  { value: "custom", label: "Custom", icon: "mdi:calendar-edit" },
];

const CUSTOM_TIME_FIELDS: CustomTimeField[] = [
  { key: "years", label: "Years", placeholder: "Years", min: 0, max: 4 },
  { key: "months", label: "Months", placeholder: "Months", min: 0, max: 11 },
  { key: "days", label: "Days", placeholder: "Days", min: 0, max: 30 },
  { key: "hours", label: "Hours", placeholder: "Hours", min: 0, max: 23 },
  { key: "minutes", label: "Minutes", placeholder: "Minutes", min: 0, max: 59 },
];

const DEFAULT_PRESET: ExpirationPreset = "default";
const EMPTY_CUSTOM_TIME: CustomTimeInputsType = {
  years: "0",
  months: "0",
  days: "0",
  hours: "0",
  minutes: "0",
};

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
  const [selectedPreset, setSelectedPreset] =
    useState<ExpirationPreset>(DEFAULT_PRESET);
  const [customTime, setCustomTime] =
    useState<CustomTimeInputsType>(EMPTY_CUSTOM_TIME);

  const resetForm = useCallback(() => {
    setSelectedPreset(DEFAULT_PRESET);
    setCustomTime(EMPTY_CUSTOM_TIME);
  }, []);

  const handlePresetSelect = useCallback((preset: ExpirationPreset) => {
    setSelectedPreset(preset);
    if (preset !== "custom") {
      setCustomTime(EMPTY_CUSTOM_TIME);
    }
  }, []);

  const handleCustomTimeChange = useCallback(
    (key: keyof CustomTimeInputsType, value: string) => {
      setCustomTime((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    },
    [onOpenChange, resetForm]
  );

  const isCustomSelected = useMemo(
    () => selectedPreset === "custom",
    [selectedPreset]
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
            onPresetSelect={(preset) =>
              handlePresetSelect(preset as ExpirationPreset)
            }
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
