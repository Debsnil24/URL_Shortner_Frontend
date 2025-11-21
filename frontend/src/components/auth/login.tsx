import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { authToasts } from "@/utils/toastUtils";
import { Button } from "@heroui/react";
import { useEffect, useState } from "react";
import FormField from "../common/FormField";

export default function Login() {
  const { setAuthDialogOpen, setIsLogin } = useStore();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Check if all fields are filled
  useEffect(() => {
    const emailValid = formData.email.trim().length > 0;
    const passwordValid = formData.password.trim().length > 0;

    setIsFormValid(emailValid && passwordValid);
  }, [formData.email, formData.password]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!isFormValid) return;

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setAuthDialogOpen(false);
      // User will be automatically redirected to dashboard via ProtectedRoute
    } else {
      const message = result.error || "Login failed. Please try again.";
      authToasts.loginFailed(message);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
        <p className="text-sm text-gray-400">
          Sign in to your account to continue
        </p>
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
      <FormField
        isClearable
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onValueChange={(value) => handleInputChange("password", value)}
        label="Password"
        icon="mdi:lock"
      />
      <div className="flex gap-2 w-full justify-end items-center -mt-1.5 ">
        <Button
          variant="solid"
          className="bg-transparent text-gray-300 h-4 text-xs hover:underline"
        >
          Forgot Password?
        </Button>
      </div>
      {/* Errors are handled via toast notifications; no inline error block */}

      <Button
        color="primary"
        isDisabled={!isFormValid || isLoading}
        isLoading={isLoading}
        onPress={handleLogin}
        radius="full"
        className={`text-md font-semibold ${
          !isFormValid || isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>
      <p className="text-sm text-gray-400 flex justify-center">
        Don&apos;t have an account?&nbsp;
        <span
          onClick={() => {
            setIsLogin(false);
          }}
          className="text-sm cursor-pointer hover:underline text-gray-300"
        >
          Sign up
        </span>
      </p>
    </>
  );
}
