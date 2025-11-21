import { CustomTimeField, CustomTimeInputs as CustomTimeInputsType } from "@/components/dashboard/CustomTimeInputs";
import { ExpirationPresetOption } from "@/components/dashboard/ExpirationPresetSelector";

export type ExpirationPreset =
    | "default"
    | "1hour"
    | "12hours"
    | "1day"
    | "7days"
    | "1month"
    | "6months"
    | "1year"
    | "custom";

export const EXPIRATION_PRESETS: ExpirationPresetOption[] = [
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

export const CUSTOM_TIME_FIELDS: CustomTimeField[] = [
    { key: "years", label: "Years", placeholder: "Years", min: 0, max: 4 },
    { key: "months", label: "Months", placeholder: "Months", min: 0, max: 11 },
    { key: "days", label: "Days", placeholder: "Days", min: 0, max: 30 },
    { key: "hours", label: "Hours", placeholder: "Hours", min: 0, max: 23 },
    { key: "minutes", label: "Minutes", placeholder: "Minutes", min: 0, max: 59 },
];

export const DEFAULT_PRESET: ExpirationPreset = "default";

export const EMPTY_CUSTOM_TIME: CustomTimeInputsType = {
    years: "0",
    months: "0",
    days: "0",
    hours: "0",
    minutes: "0",
};

