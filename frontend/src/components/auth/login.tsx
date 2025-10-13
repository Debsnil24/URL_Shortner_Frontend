import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { authToasts } from "@/utils/toastUtils";
import { Button, Input } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";

export default function Login() {
  const { setAuthDialogOpen, setIsLogin } = useStore();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [, setError] = useState("");

  // Check if all fields are filled
  useEffect(() => {
    const emailValid = formData.email.trim().length > 0;
    const passwordValid = formData.password.trim().length > 0;

    setIsFormValid(emailValid && passwordValid);
  }, [formData.email, formData.password]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const handleLogin = async () => {
    if (!isFormValid) return;

    setError("");
    const result = await login(formData.email, formData.password);

    if (result.success) {
      setAuthDialogOpen(false);
      // User will be automatically redirected to dashboard via ProtectedRoute
    } else {
      const message = result.error || "Login failed. Please try again.";
      setError(message);
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
      <Input
        isClearable
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onValueChange={(value) => handleInputChange("email", value)}
        startContent={
          <Icon icon="mdi:email" className="w-5 h-5 text-gray-700" />
        }
        label={<p className="text-white ml-1">Email</p>}
        labelPlacement="outside"
        classNames={{
          clearButton: "text-black",
          input: ["placeholder:text-xs", "text-black"],
        }}
      />
      <Input
        isClearable
        type="password"
        placeholder="Enter your password"
        value={formData.password}
        onValueChange={(value) => handleInputChange("password", value)}
        startContent={
          <Icon icon="mdi:lock" className="w-5 h-5 text-gray-700" />
        }
        label={<p className="text-white ml-1">Password</p>}
        labelPlacement="outside"
        classNames={{
          clearButton: "text-black",
          input: ["placeholder:text-xs", "text-black"],
        }}
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
