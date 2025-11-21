import { Select, SelectItem } from "@heroui/react";

interface CustomTimeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  isInvalid?: boolean;
  errorMessage?: string;
}

export default function CustomTimeSelect({
  label,
  value,
  onChange,
  options,
  isInvalid,
  errorMessage,
}: CustomTimeSelectProps) {
  // Handle empty value - treat as "0" for display
  const displayValue = value === "" || value === undefined ? "0" : value;
  const selectedKeys = displayValue ? [displayValue] : [];

  return (
    <Select
      label={label}
      placeholder="0"
      selectedKeys={selectedKeys}
      onSelectionChange={(keys) => {
        const selectedKeysArray = Array.from(keys);
        // If selection is cleared, set to "0" (which represents empty/zero)
        if (selectedKeysArray.length === 0 || !selectedKeysArray[0]) {
          onChange("0");
          return;
        }
        const selectedValue = selectedKeysArray[0] as string;
        // Only update if value actually changed to prevent unnecessary updates
        if (selectedValue !== value) {
          onChange(selectedValue);
        }
      }}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      labelPlacement="outside"
      size="sm"
      classNames={{
        trigger:
          "bg-gray-800/50 border-gray-600 hover:border-gray-500 hover:bg-gray-800/70 data-[hover=true]:bg-gray-800/70 [&_span]:!text-white [&_span[data-placeholder=true]]:!text-gray-400",
        label: "!text-white !text-xs !font-medium",
        value: "!text-white !text-sm !whitespace-nowrap",
        popoverContent: "bg-gray-800 border-gray-700",
      }}
      listboxProps={{
        itemClasses: {
          base: "!text-white !whitespace-nowrap data-[hover=true]:!bg-gray-700 data-[hover=true]:!text-white data-[selectable=true]:focus:!bg-gray-700 data-[selectable=true]:focus:!text-white [&>span]:!text-white [&>span]:!block [&>span]:!w-full",
        },
      }}
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          textValue={option.label}
          classNames={{
            base: "!text-white !whitespace-nowrap",
            title: "!text-white !whitespace-nowrap",
          }}
        >
          <span className="!text-white !whitespace-nowrap !block !w-full">
            {option.label}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}

