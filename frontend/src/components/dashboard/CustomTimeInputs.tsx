import { useMemo } from "react";
import CustomTimeSelect from "./CustomTimeSelect";

export interface CustomTimeInputs {
  years: string;
  months: string;
  days: string;
  hours: string;
  minutes: string;
}

export interface CustomTimeField {
  key: keyof CustomTimeInputs;
  label: string;
  placeholder: string;
  min: number;
  max: number;
}

const MAX_YEARS = 4; // Maximum 4 years (less than 5)
const MAX_MONTHS = 11;
const MAX_DAYS = 30;
const MAX_HOURS = 23;
const MAX_MINUTES = 59;

interface CustomTimeInputsProps {
  values: CustomTimeInputs;
  fields: CustomTimeField[];
  onChange: (key: keyof CustomTimeInputs, value: string) => void;
}

function generateOptions(
  max: number,
  unit: string
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [
    { value: "0", label: "0" },
  ];
  for (let i = 1; i <= max; i++) {
    options.push({
      value: i.toString(),
      label: i.toString(), // Just show the number, no unit
    });
  }
  return options;
}

export default function CustomTimeInputs({
  values,
  fields,
  onChange,
}: CustomTimeInputsProps) {
  // Calculate total time in milliseconds to validate against 5 years
  const totalTimeMs = useMemo(() => {
    // Treat empty string and "0" as 0
    const years = parseInt(
      values.years === "" || values.years === "0" ? "0" : values.years,
      10
    );
    const months = parseInt(
      values.months === "" || values.months === "0" ? "0" : values.months,
      10
    );
    const days = parseInt(
      values.days === "" || values.days === "0" ? "0" : values.days,
      10
    );
    const hours = parseInt(
      values.hours === "" || values.hours === "0" ? "0" : values.hours,
      10
    );
    const minutes = parseInt(
      values.minutes === "" || values.minutes === "0" ? "0" : values.minutes,
      10
    );

    const totalDays =
      years * 365 + months * 30 + days + hours / 24 + minutes / (24 * 60);
    return totalDays * 24 * 60 * 60 * 1000;
  }, [values]);

  const fiveYearsMs = 5 * 365 * 24 * 60 * 60 * 1000;
  const isInvalid = totalTimeMs >= fiveYearsMs;
  const errorMessage = isInvalid
    ? "Total expiration must be less than 5 years"
    : undefined;

  // Generate options for each field
  const fieldOptions = useMemo(() => {
    return {
      years: generateOptions(MAX_YEARS, "Years"),
      months: generateOptions(MAX_MONTHS, "Months"),
      days: generateOptions(MAX_DAYS, "Days"),
      hours: generateOptions(MAX_HOURS, "Hours"),
      minutes: generateOptions(MAX_MINUTES, "Minutes"),
    };
  }, []);

  // Calculate remaining time display
  const remainingTime = useMemo(() => {
    if (!isInvalid || totalTimeMs === 0) return null;
    const remainingMs = fiveYearsMs - totalTimeMs;
    const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    if (remainingDays > 0) {
      return `${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining`;
    }
    return "Less than 1 day remaining";
  }, [isInvalid, totalTimeMs, fiveYearsMs]);

  return (
    <div className="flex flex-col gap-4 p-5 bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl border border-gray-700/50 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full"></span>
          Custom Expiration
        </label>
        {totalTimeMs > 0 && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isInvalid
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-green-500/20 text-green-400 border border-green-500/30"
            }`}
          >
            {isInvalid ? remainingTime || "Exceeds limit" : "Valid expiration"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-5 gap-3">
        {fields.map((field) => {
          const options =
            fieldOptions[field.key as keyof typeof fieldOptions] ||
            generateOptions(field.max, field.label);

          return (
            <CustomTimeSelect
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onChange={(value) => onChange(field.key, value)}
              options={options}
              isInvalid={isInvalid}
              errorMessage={
                isInvalid && field.key === "years" ? errorMessage : undefined
              }
            />
          );
        })}
      </div>

      {isInvalid && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="text-red-400 text-sm">⚠️</span>
          <p className="text-xs text-red-300 flex-1">
            The total expiration time exceeds 5 years. Please adjust the values
            to be less than 5 years.
          </p>
        </div>
      )}

      {totalTimeMs > 0 && !isInvalid && (
        <div className="text-xs text-gray-400 text-center">
          Total: ~
          {(() => {
            const years = parseInt(
              values.years === "" || values.years === "0" ? "0" : values.years,
              10
            );
            const months = parseInt(
              values.months === "" || values.months === "0"
                ? "0"
                : values.months,
              10
            );
            const days = parseInt(
              values.days === "" || values.days === "0" ? "0" : values.days,
              10
            );
            const hours = parseInt(
              values.hours === "" || values.hours === "0" ? "0" : values.hours,
              10
            );
            const minutes = parseInt(
              values.minutes === "" || values.minutes === "0"
                ? "0"
                : values.minutes,
              10
            );

            const parts: string[] = [];
            if (years > 0) {
              parts.push(`${years} year${years !== 1 ? "s" : ""}`);
            }
            if (months > 0) {
              parts.push(`${months} month${months !== 1 ? "s" : ""}`);
            }
            if (days > 0) {
              parts.push(`${days} day${days !== 1 ? "s" : ""}`);
            }
            if (hours > 0 && years === 0 && months === 0) {
              parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
            }
            if (minutes > 0 && years === 0 && months === 0 && days === 0) {
              parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
            }

            return parts.length > 0 ? parts.join(" ") : "0";
          })()}
        </div>
      )}
    </div>
  );
}
