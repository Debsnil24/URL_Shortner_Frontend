import { ExpirationData } from "@/components/dashboard/CreateLinkModal";
import { CustomTimeInputs } from "@/components/dashboard/CustomTimeInputs";
import {
    DEFAULT_PRESET,
    EMPTY_CUSTOM_TIME,
    ExpirationPreset,
} from "@/utils/expirationConstants";
import { useCallback, useMemo, useState } from "react";

interface UseExpirationFormOptions {
    initialPreset?: ExpirationPreset;
    initialCustomTime?: CustomTimeInputs;
    onReset?: () => void;
}

export function useExpirationForm(options: UseExpirationFormOptions = {}) {
    const { initialPreset = DEFAULT_PRESET, initialCustomTime = EMPTY_CUSTOM_TIME, onReset } = options;

    const [selectedPreset, setSelectedPreset] = useState<ExpirationPreset>(initialPreset);
    const [customTime, setCustomTime] = useState<CustomTimeInputs>(initialCustomTime);

    const resetForm = useCallback(() => {
        setSelectedPreset(DEFAULT_PRESET);
        setCustomTime(EMPTY_CUSTOM_TIME);
        onReset?.();
    }, [onReset]);

    const handlePresetSelect = useCallback((preset: string | ExpirationPreset) => {
        const typedPreset = preset as ExpirationPreset;
        setSelectedPreset(typedPreset);
        if (typedPreset !== "custom") {
            setCustomTime(EMPTY_CUSTOM_TIME);
        }
    }, []);

    const handleCustomTimeChange = useCallback(
        (key: keyof CustomTimeInputs, value: string) => {
            setCustomTime((prev) => ({ ...prev, [key]: value }));
        },
        []
    );

    const isCustomSelected = useMemo(
        () => selectedPreset === "custom",
        [selectedPreset]
    );

    const buildExpirationData = useCallback((): ExpirationData => {
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

        return expirationData;
    }, [selectedPreset, customTime]);

    const initializeFromDate = useCallback((expiresAt: string | null | undefined) => {
        // This will be handled by the component using calculateExpirationFromDate
        // We just provide a way to set the values
    }, []);

    return {
        selectedPreset,
        customTime,
        isCustomSelected,
        setSelectedPreset,
        setCustomTime,
        resetForm,
        handlePresetSelect,
        handleCustomTimeChange,
        buildExpirationData,
    };
}

