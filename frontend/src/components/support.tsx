"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { addToast, Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import CustomModal from "./customModal";

// Field constraints
const FIELD_LIMITS = {
  name: { min: 1, max: 100 },
  email: { min: 1, max: 255 },
  message: { min: 1, max: 5000 },
};

export default function Support() {
  const { isSupportOpen, setIsSupportOpen } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  // Validate form
  useEffect(() => {
    const nameLength = formData.name.trim().length;
    const emailLength = formData.email.trim().length;
    const messageLength = formData.message.trim().length;

    const nameValid =
      nameLength >= FIELD_LIMITS.name.min &&
      nameLength <= FIELD_LIMITS.name.max;
    const emailValid =
      emailLength >= FIELD_LIMITS.email.min &&
      emailLength <= FIELD_LIMITS.email.max &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
    const messageValid =
      messageLength >= FIELD_LIMITS.message.min &&
      messageLength <= FIELD_LIMITS.message.max;

    setIsFormValid(nameValid && emailValid && messageValid);

    // Clear errors when fields are valid
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (nameValid) delete newErrors.name;
      if (emailValid) delete newErrors.email;
      if (messageValid) delete newErrors.message;
      return newErrors;
    });
  }, [formData]);

  const validateField = (field: string, value: string) => {
    const trimmedValue = value.trim();
    const length = trimmedValue.length;

    switch (field) {
      case "name":
        if (length < FIELD_LIMITS.name.min) {
          setErrors((prev) => ({
            ...prev,
            name: `Name must be at least ${FIELD_LIMITS.name.min} character${
              FIELD_LIMITS.name.min > 1 ? "s" : ""
            }`,
          }));
        } else if (length > FIELD_LIMITS.name.max) {
          setErrors((prev) => ({
            ...prev,
            name: `Name must not exceed ${FIELD_LIMITS.name.max} characters`,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
        break;
      case "email":
        if (length < FIELD_LIMITS.email.min) {
          setErrors((prev) => ({
            ...prev,
            email: "Email is required",
          }));
        } else if (length > FIELD_LIMITS.email.max) {
          setErrors((prev) => ({
            ...prev,
            email: `Email must not exceed ${FIELD_LIMITS.email.max} characters`,
          }));
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
        break;
      case "message":
        if (length < FIELD_LIMITS.message.min) {
          setErrors((prev) => ({
            ...prev,
            message: `Message must be at least ${
              FIELD_LIMITS.message.min
            } character${FIELD_LIMITS.message.min > 1 ? "s" : ""}`,
          }));
        } else if (length > FIELD_LIMITS.message.max) {
          setErrors((prev) => ({
            ...prev,
            message: `Message must not exceed ${FIELD_LIMITS.message.max} characters`,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.message;
            return newErrors;
          });
        }
        break;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    validateField("name", formData.name);
    validateField("email", formData.email);
    validateField("message", formData.message);

    if (!isFormValid) {
      addToast({
        title: "Validation Error",
        description: "Please fill all fields correctly",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.submitSupportRequest({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      if (response.success) {
        // Success: Show success toast and close modal
        addToast({
          title: "Message Sent!",
          description:
            response.message ||
            "Support request submitted successfully. We'll get back to you soon!",
          color: "success",
        });

        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });
        setErrors({});
        setIsRateLimited(false);
        // Close modal on success
        setIsSupportOpen(false);
      } else {
        // Failure: Show error toast but keep modal open
        // Handle rate limiting (429)
        if (
          response.error?.code === "RATE_LIMIT_EXCEEDED" ||
          response.error?.code === "HTTP_429"
        ) {
          setIsRateLimited(true);
          addToast({
            title: "Rate Limit Exceeded",
            description:
              response.error?.message ||
              response.message ||
              "You've submitted too many requests. Please wait 15 minutes before submitting again.",
            color: "danger",
          });
          // Disable form temporarily
          setTimeout(() => {
            setIsRateLimited(false);
          }, 15 * 60 * 1000); // 15 minutes
        } else if (response.error?.code === "VALIDATION_ERROR") {
          // Handle validation errors (400)
          addToast({
            title: "Validation Error",
            description: response.error.message || response.message,
            color: "danger",
          });
        } else {
          // Handle server errors (500 or other)
          addToast({
            title: "Failed to Send",
            description:
              response.error?.message ||
              response.message ||
              "Unable to process your request at this time. Please try again later.",
            color: "danger",
          });
        }
        // Modal stays open on failure - user can retry
      }
    } catch (error) {
      // Network error: Show error toast but keep modal open
      console.error("Support request error:", error);
      addToast({
        title: "Network Error",
        description:
          "Unable to connect to the server. Please check your internet connection and try again.",
        color: "danger",
      });
      // Modal stays open on network error - user can retry
    } finally {
      setIsSubmitting(false);
    }
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
                // Enforce max length
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
            <div className="flex justify-end">
              <span
                className={`text-xs ml-1 ${
                  formData.name.length > FIELD_LIMITS.name.max
                    ? "text-red-500"
                    : formData.name.length > FIELD_LIMITS.name.max * 0.9
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                {formData.name.length}/{FIELD_LIMITS.name.max}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Input
              isClearable
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onValueChange={(value) => {
                // Enforce max length
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
            <div className="flex justify-end">
              <span
                className={`text-xs ml-1 ${
                  formData.email.length > FIELD_LIMITS.email.max
                    ? "text-red-500"
                    : formData.email.length > FIELD_LIMITS.email.max * 0.9
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                {formData.email.length}/{FIELD_LIMITS.email.max}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Textarea
              placeholder="Enter your message"
              value={formData.message}
              onValueChange={(value) => {
                // Enforce max length
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
            <div className="flex justify-end">
              <span
                className={`text-xs ml-1 ${
                  formData.message.length > FIELD_LIMITS.message.max
                    ? "text-red-500"
                    : formData.message.length > FIELD_LIMITS.message.max * 0.9
                    ? "text-yellow-500"
                    : "text-gray-400"
                }`}
              >
                {formData.message.length}/{FIELD_LIMITS.message.max}
              </span>
            </div>
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
