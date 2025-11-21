import { apiService } from "@/services/api";
import { addToast } from "@heroui/react";
import { useCallback, useState } from "react";

interface SupportFormData {
  name: string;
  email: string;
  message: string;
}

interface UseSupportSubmissionOptions {
  onSuccess?: () => void;
  checkFieldValidity: (field: string, value: string) => boolean;
  validateField: (field: string, value: string) => void;
}

export function useSupportSubmission({
  onSuccess,
  checkFieldValidity,
  validateField,
}: UseSupportSubmissionOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleSubmit = useCallback(
    async (formData: SupportFormData) => {
      // Validate all fields and update error messages
      validateField("name", formData.name);
      validateField("email", formData.email);
      validateField("message", formData.message);

      // Check validity synchronously to avoid stale state
      const nameValid = checkFieldValidity("name", formData.name);
      const emailValid = checkFieldValidity("email", formData.email);
      const messageValid = checkFieldValidity("message", formData.message);
      const formIsValid = nameValid && emailValid && messageValid;

      if (!formIsValid) {
        addToast({
          title: "Validation Error",
          description: "Please fill all fields correctly",
          color: "danger",
        });
        return { success: false };
      }

      setIsSubmitting(true);

      try {
        const response = await apiService.submitSupportRequest({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        });

        if (response.success) {
          // Success: Show success toast
          addToast({
            title: "Message Sent!",
            description:
              response.message ||
              "Support request submitted successfully. We'll get back to you soon!",
            color: "success",
          });

          setIsRateLimited(false);
          onSuccess?.();
          return { success: true };
        } else {
          // Failure: Show error toast
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
          return { success: false };
        }
      } catch (error) {
        // Network error: Show error toast
        console.error("Support request error:", error);
        addToast({
          title: "Network Error",
          description:
            "Unable to connect to the server. Please check your internet connection and try again.",
          color: "danger",
        });
        return { success: false };
      } finally {
        setIsSubmitting(false);
      }
    },
    [checkFieldValidity, validateField, onSuccess]
  );

  return {
    isSubmitting,
    isRateLimited,
    handleSubmit,
  };
}

