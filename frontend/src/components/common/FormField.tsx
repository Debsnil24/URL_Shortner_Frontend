import { Input, InputProps } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

interface FormFieldProps extends Omit<InputProps, "label"> {
  label: string;
  icon?: string;
  error?: string;
}

export default function FormField({
  label,
  icon,
  error,
  classNames,
  ...inputProps
}: FormFieldProps) {
  return (
    <Input
      {...inputProps}
      isInvalid={!!error}
      errorMessage={error}
      label={<p className="text-white ml-1">{label}</p>}
      labelPlacement="outside"
      className="text-white"
      startContent={
        icon ? <Icon icon={icon} className="w-5 h-5 text-gray-700" /> : undefined
      }
      classNames={{
        clearButton: "text-black",
        input: ["placeholder:text-xs", "text-black"],
        ...classNames,
      }}
    />
  );
}

