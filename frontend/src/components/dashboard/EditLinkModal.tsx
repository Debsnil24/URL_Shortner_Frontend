"use client";

import { Button, Checkbox, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomModal from "../customModal";
import CustomTimeInputs, {
  CustomTimeField,
  CustomTimeInputs as CustomTimeInputsType,
} from "./CustomTimeInputs";
import ExpirationPresetSelector, {
  ExpirationPresetOption,
} from "./ExpirationPresetSelector";
import { ExpirationData } from "./CreateLinkModal";

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

// Calculate expiration preset/custom from expires_at
function calculateExpirationFromDate(
  expiresAt: string | null | undefined
): {
  preset: ExpirationPreset;
  customTime: CustomTimeInputsType;
} {
  if (!expiresAt) {
    return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
  }

  try {
    const expirationDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expirationDate.getTime() - now.getTime();

    if (diffMs < 0) {
      // Already expired, return default
      return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Check if it matches a preset
    const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    const oneHourMs = 60 * 60 * 1000;

    // Check with some tolerance (within 1 hour)
    const tolerance = 60 * 60 * 1000;
    if (Math.abs(diffMs - fiveYearsMs) < tolerance) {
      return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneYearMs) < tolerance) {
      return { preset: "1year", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - sixMonthsMs) < tolerance) {
      return { preset: "6months", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneMonthMs) < tolerance) {
      return { preset: "1month", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - sevenDaysMs) < tolerance) {
      return { preset: "7days", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneDayMs) < tolerance) {
      return { preset: "1day", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - twelveHoursMs) < tolerance) {
      return { preset: "12hours", customTime: EMPTY_CUSTOM_TIME };
    } else if (Math.abs(diffMs - oneHourMs) < tolerance) {
      return { preset: "1hour", customTime: EMPTY_CUSTOM_TIME };
    } else {
      // Calculate custom time
      const years = Math.floor(diffDays / 365);
      const remainingDaysAfterYears = diffDays % 365;
      const months = Math.floor(remainingDaysAfterYears / 30);
      const days = remainingDaysAfterYears % 30;
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return {
        preset: "custom",
        customTime: {
          years: years > 4 ? "4" : years.toString(),
          months: months.toString(),
          days: days.toString(),
          hours: hours.toString(),
          minutes: minutes.toString(),
        },
      };
    }
  } catch {
    return { preset: "default", customTime: EMPTY_CUSTOM_TIME };
  }
}

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
  const [selectedPreset, setSelectedPreset] =
    useState<ExpirationPreset>(DEFAULT_PRESET);
  const [customTime, setCustomTime] =
    useState<CustomTimeInputsType>(EMPTY_CUSTOM_TIME);
  const [modifyExpiration, setModifyExpiration] = useState(false);
  const [originalUrlRef, setOriginalUrlRef] = useState(originalUrl);
  const [originalExpiresAtRef, setOriginalExpiresAtRef] = useState(expiresAt);

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
  }, [isOpen]); // Only run when modal opens/closes

  const resetForm = useCallback(() => {
    setModifyExpiration(false);
    const { preset, customTime: calculatedCustomTime } =
      calculateExpirationFromDate(originalExpiresAtRef);
    setSelectedPreset(preset);
    setCustomTime(calculatedCustomTime);
  }, [originalExpiresAtRef]);

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
                const expirationData: ExpirationData = {};

                if (selectedPreset === "custom") {
                  // Only send custom_expiration if at least one value is not "0"
                  const hasNonZeroValue = Object.values(customTime).some(
                    (value) => value !== "0" && value !== ""
                  );
                  if (hasNonZeroValue) {
                    expirationData.custom_expiration = customTime;
                  }
                  // If all values are "0", don't send custom_expiration (backend will default to 5 years)
                } else if (selectedPreset !== "default") {
                  expirationData.expiration_preset = selectedPreset;
                }
                // If "default" is selected, don't send expiration_preset (backend will default to 5 years)

                updateData.expirationData = expirationData;
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

