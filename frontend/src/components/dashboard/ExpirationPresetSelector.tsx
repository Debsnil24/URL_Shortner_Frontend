import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

export interface ExpirationPresetOption {
  value: string;
  label: string;
  icon: string;
}

interface PresetButtonProps {
  preset: ExpirationPresetOption;
  isSelected: boolean;
  onSelect: () => void;
}

function PresetButton({ preset, isSelected, onSelect }: PresetButtonProps) {
  return (
    <Button
      variant={isSelected ? "solid" : "bordered"}
      color={isSelected ? "primary" : "default"}
      onPress={onSelect}
      className={`
        min-w-0 flex items-center justify-center gap-2
        ${
          isSelected
            ? ""
            : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50"
        }
      `}
      size="sm"
    >
      <Icon icon={preset.icon} className="w-4 h-4" />
      <span className="text-sm font-medium">{preset.label}</span>
    </Button>
  );
}

interface ExpirationPresetSelectorProps {
  presets: ExpirationPresetOption[];
  selectedPreset: string;
  onPresetSelect: (preset: string) => void;
}

export default function ExpirationPresetSelector({
  presets,
  selectedPreset,
  onPresetSelect,
}: ExpirationPresetSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">
        Expiration Time
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {presets.map((preset) => (
          <PresetButton
            key={preset.value}
            preset={preset}
            isSelected={selectedPreset === preset.value}
            onSelect={() => onPresetSelect(preset.value)}
          />
        ))}
      </div>
    </div>
  );
}
