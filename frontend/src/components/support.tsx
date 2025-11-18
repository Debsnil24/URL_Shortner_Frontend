"use client";

import { apiService } from "@/services/api";
import { useStore } from "@/store/useStore";
import { addToast, Button, Input, Textarea } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import CustomModal from "./customModal";

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

  // Validate form
  useEffect(() => {
    const nameValid = formData.name.trim().length >= 2;
    const emailValid =
      formData.email.includes("@") &&
      formData.email.includes(".") &&
      formData.email.length > 5;
    const messageValid = formData.message.trim().length >= 10;

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
    switch (field) {
      case "name":
        if (value.trim().length < 2) {
          setErrors((prev) => ({
            ...prev,
            name: "Name must be at least 2 characters",
          }));
        }
        break;
      case "email":
        if (!value.includes("@") || !value.includes(".") || value.length <= 5) {
          setErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        }
        break;
      case "message":
        if (value.trim().length < 10) {
          setErrors((prev) => ({
            ...prev,
            message: "Message must be at least 10 characters",
          }));
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
        // Close modal on success
        setIsSupportOpen(false);
      } else {
        // Failure: Show error toast but keep modal open
        // Handle validation errors (400)
        if (response.error?.code === "VALIDATION_ERROR") {
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
          <Input
            isClearable
            type="text"
            placeholder="Enter your full name"
            value={formData.name}
            onValueChange={(value) => handleInputChange("name", value)}
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
          />

          <Input
            isClearable
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onValueChange={(value) => handleInputChange("email", value)}
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
          />

          <Textarea
            placeholder="Enter your message (minimum 10 characters)"
            value={formData.message}
            onValueChange={(value) => handleInputChange("message", value)}
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
          />

          <Button
            type="submit"
            color="primary"
            isDisabled={!isFormValid || isSubmitting}
            isLoading={isSubmitting}
            radius="full"
            className={`text-md font-semibold ${
              !isFormValid || isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </div>
    </CustomModal>
  );
}
