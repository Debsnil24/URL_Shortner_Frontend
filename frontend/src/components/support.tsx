"use client";

import { useStore } from "@/store/useStore";
import { Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import CustomModal from "./customModal";
import CharacterCounter from "./common/CharacterCounter";
import { useSupportFormValidation } from "@/hooks/useSupportFormValidation";
import { useSupportSubmission } from "@/hooks/useSupportSubmission";
import { FIELD_LIMITS } from "@/utils/supportConstants";

export default function Support() {
  const { isSupportOpen, setIsSupportOpen } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const prevIsOpenRef = useRef(isSupportOpen);

  const { errors, isFormValid, validateField, checkFieldValidity } =
    useSupportFormValidation(formData);

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      message: "",
    });
  };

  const { isSubmitting, isRateLimited, handleSubmit: submitForm } =
    useSupportSubmission({
      onSuccess: () => {
        handleReset();
        setIsSupportOpen(false);
      },
      checkFieldValidity,
      validateField,
    });

  // Reset form when modal is closed
  useEffect(() => {
    // If modal was open and is now closed, reset the form
    if (prevIsOpenRef.current && !isSupportOpen) {
      handleReset();
    }
    // Update ref for next render
    prevIsOpenRef.current = isSupportOpen;
  }, [isSupportOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm(formData);
  };

  return (
    <CustomModal
      size="lg"
      isOpen={isSupportOpen}
      onOpenChange={setIsSupportOpen}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-row w-full justify-center items-center">
          <h1 className="text-2xl font-bold">Contact Support</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input
              isClearable
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onValueChange={(value) => {
                if (value.length <= FIELD_LIMITS.name.max) {
                  handleInputChange("name", value);
                }
              }}
              onBlur={() => validateField("name", formData.name)}
              startContent={
                <Icon icon="mdi:account" className="w-5 h-5 text-gray-700" />
              }
              label={
                <span className="text-white ml-1">
                  Name <span className="text-red-500">*</span>
                </span>
              }
              labelPlacement="outside"
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              classNames={{
                clearButton: "text-black",
                input: ["placeholder:text-xs", "text-black"],
              }}
              isDisabled={isRateLimited}
            />
            <CharacterCounter
              current={formData.name.length}
              max={FIELD_LIMITS.name.max}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Input
              isClearable
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onValueChange={(value) => {
                if (value.length <= FIELD_LIMITS.email.max) {
                  handleInputChange("email", value);
                }
              }}
              onBlur={() => validateField("email", formData.email)}
              startContent={
                <Icon icon="mdi:email" className="w-5 h-5 text-gray-700" />
              }
              label={
                <span className="text-white ml-1">
                  Email <span className="text-red-500">*</span>
                </span>
              }
              labelPlacement="outside"
              isInvalid={!!errors.email}
              errorMessage={errors.email}
              classNames={{
                clearButton: "text-black",
                input: ["placeholder:text-xs", "text-black"],
              }}
              isDisabled={isRateLimited}
            />
            <CharacterCounter
              current={formData.email.length}
              max={FIELD_LIMITS.email.max}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              placeholder="Enter your message"
              value={formData.message}
              onValueChange={(value) => {
                if (value.length <= FIELD_LIMITS.message.max) {
                  handleInputChange("message", value);
                }
              }}
              onBlur={() => validateField("message", formData.message)}
              label={
                <span className="text-white ml-1">
                  Message <span className="text-red-500">*</span>
                </span>
              }
              labelPlacement="outside"
              isInvalid={!!errors.message}
              errorMessage={errors.message}
              minRows={4}
              classNames={{
                input: ["placeholder:text-xs", "text-black"],
              }}
              isDisabled={isRateLimited}
            />
            <CharacterCounter
              current={formData.message.length}
              max={FIELD_LIMITS.message.max}
            />
          </div>

          <Button
            type="submit"
            color="primary"
            isDisabled={!isFormValid || isSubmitting || isRateLimited}
            isLoading={isSubmitting}
            radius="full"
            className={`text-md font-semibold ${
              !isFormValid || isSubmitting || isRateLimited
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting
              ? "Sending..."
              : isRateLimited
              ? "Rate Limited - Try Again Later"
              : "Send Message"}
          </Button>
          {isRateLimited && (
            <p className="text-sm text-yellow-500 text-center">
              You've exceeded the rate limit. Please wait 15 minutes before
              submitting again.
            </p>
          )}
        </form>
      </div>
    </CustomModal>
  );
}
