import { Checkbox, Input } from "@heroui/react";

interface QRCodeTaglineInputProps {
  includeTagline: boolean;
  tagline: string;
  onIncludeTaglineChange: (value: boolean) => void;
  onTaglineChange: (value: string) => void;
}

export default function QRCodeTaglineInput({
  includeTagline,
  tagline,
  onIncludeTaglineChange,
  onTaglineChange,
}: QRCodeTaglineInputProps) {
  return (
    <div className="flex flex-col gap-3 w-full px-4 mb-4">
      <Checkbox
        isSelected={includeTagline}
        onValueChange={onIncludeTaglineChange}
        classNames={{ label: "text-white" }}
      >
        <span className="text-sm text-white">Include custom tagline</span>
      </Checkbox>
      {includeTagline && (
        <Input
          placeholder="Enter your tagline"
          value={tagline}
          onValueChange={onTaglineChange}
          size="sm"
          classNames={{
            input: "text-white",
            inputWrapper: "bg-gray-800 border-gray-700",
          }}
        />
      )}
    </div>
  );
}
