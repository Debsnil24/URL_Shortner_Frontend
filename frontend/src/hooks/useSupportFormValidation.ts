import { FIELD_LIMITS, SupportField } from "@/utils/supportConstants";
import { useCallback, useEffect, useState } from "react";

interface SupportFormData {
  name: string;
  email: string;
  message: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function useSupportFormValidation(formData: SupportFormData) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const checkFieldValidity = useCallback(
    (field: SupportField | string, value: string): boolean => {
      const typedField = field as SupportField;
      const trimmedValue = value.trim();
      const length = trimmedValue.length;

      switch (typedField) {
        case "name":
          return (
            length >= FIELD_LIMITS.name.min && length <= FIELD_LIMITS.name.max
          );
        case "email":
          return (
            length >= FIELD_LIMITS.email.min &&
            length <= FIELD_LIMITS.email.max &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
          );
        case "message":
          return (
            length >= FIELD_LIMITS.message.min &&
            length <= FIELD_LIMITS.message.max
          );
        default:
          return false;
      }
    },
    []
  );

  const validateField = useCallback(
    (field: SupportField | string, value: string) => {
      const typedField = field as SupportField;
      const trimmedValue = value.trim();
      const length = trimmedValue.length;

      switch (typedField) {
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
              message: `Message must be at least ${FIELD_LIMITS.message.min} character${
                FIELD_LIMITS.message.min > 1 ? "s" : ""
              }`,
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
    },
    []
  );

  // Validate form on data change
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

  return {
    errors,
    isFormValid,
    validateField,
    checkFieldValidity,
  };
}

