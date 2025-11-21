import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { authToasts } from "@/utils/toastUtils";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import FormField from "../common/FormField";

export default function Signup() {
  const { setAuthDialogOpen, setIsLogin } = useStore();
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasSpecialChar: false,
  });

  const [confirmPasswordMatch, setConfirmPasswordMatch] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Password validation rules
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidation({
      minLength,
      hasUppercase,
      hasSpecialChar,
    });
  };

  // Check if passwords match
  const checkPasswordMatch = (confirmPassword: string) => {
    setConfirmPasswordMatch(
      confirmPassword === formData.password && confirmPassword.length > 0
    );
  };

  // Check if all validations are met
  useEffect(() => {
    const allPasswordValid =
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasSpecialChar;
    const emailValid =
      formData.email.includes("@") && formData.email.includes(".");
    const nameValid =
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0;

    setIsFormValid(
      allPasswordValid && confirmPasswordMatch && emailValid && nameValid
    );
  }, [
    passwordValidation,
    confirmPasswordMatch,
    formData.email,
    formData.firstName,
    formData.lastName,
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "password") {
      validatePassword(value);
      // Re-check confirm password match when password changes
      if (formData.confirmPassword) {
        checkPasswordMatch(formData.confirmPassword);
      }
    } else if (field === "confirmPassword") {
      checkPasswordMatch(value);
    }
  };

  const handleSignup = async () => {
    if (!isFormValid) return;

    const result = await signup(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password
    );

    if (result.success) {
      setAuthDialogOpen(false);
      // User will be automatically redirected to dashboard via ProtectedRoute
    } else {
      const message = result.error || "Signup failed. Please try again.";
      authToasts.signupFailed(message);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome!</h1>
        <p className="text-sm text-gray-400">Create an account to continue</p>
      </div>
      <div className="flex flex-row gap-2">
        <FormField
          isClearable
          type="text"
          placeholder="Enter your first name"
          value={formData.firstName}
          onValueChange={(value) => handleInputChange("firstName", value)}
          label="First Name"
          icon="mdi:people"
        />
        <FormField
          isClearable
          type="text"
          placeholder="Enter your last name"
          value={formData.lastName}
          onValueChange={(value) => handleInputChange("lastName", value)}
          label="Last Name"
          icon="mdi:people-outline"
        />
      </div>
      <FormField
        isClearable
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onValueChange={(value) => handleInputChange("email", value)}
        label="Email"
        icon="mdi:email"
      />
      <div className="flex flex-row gap-2">
        <FormField
          isClearable
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onValueChange={(value) => handleInputChange("password", value)}
          label="Password"
          icon="mdi:lock"
        />
        <FormField
          isClearable
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onValueChange={(value) => handleInputChange("confirmPassword", value)}
          label="Confirm Password"
          icon="mdi:lock"
          error={
            formData.confirmPassword.length > 0 && !confirmPasswordMatch
              ? "Passwords do not match"
              : undefined
          }
        />
      </div>

      <div className="flex gap-2 w-full justify-between items-center -mt-1.5">
        <div className="flex flex-row gap-1 items-center">
          <span
            className={`text-[10px]  md:text-xs ${
              passwordValidation.minLength ? "text-green-500" : "text-gray-500"
            }`}
          >
            At least 8 Characters
          </span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <span
            className={`text-[10px]  md:text-xs ${
              passwordValidation.hasUppercase
                ? "text-green-500"
                : "text-gray-500"
            }`}
          >
            One Uppercase Letter
          </span>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <span
            className={`text-[10px]  md:text-xs ${
              passwordValidation.hasSpecialChar
                ? "text-green-500"
                : "text-gray-500"
            }`}
          >
            One Special Character
          </span>
        </div>
      </div>

      {/* Errors are handled via toast notifications; no inline error block */}

      <Button
        color="primary"
        isDisabled={!isFormValid || isLoading}
        isLoading={isLoading}
        onPress={handleSignup}
        radius="full"
        className={`text-md font-semibold ${
          !isFormValid || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
      <p className="text-sm text-gray-400 flex justify-center">
        Already have an account!&nbsp;
        <span
          onClick={() => {
            setIsLogin(true);
          }}
          className="text-sm cursor-pointer hover:underline text-gray-300"
        >
          Sign in
        </span>
      </p>
    </>
  );
}
