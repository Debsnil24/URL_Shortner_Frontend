import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function OAuthButtons() {
  const { handleGoogleAuth } = useAuth();

  return (
    <div className="flex flex-row gap-2 w-full justify-between items-center mb-3">
      <Button
        variant="solid"
        radius="full"
        onPress={handleGoogleAuth}
        startContent={
          <Icon icon="devicon:google" className="w-4 h-4 text-gray-700" />
        }
      >
        <p className="mt-0.5 text-xs md:text-sm">Continue with Google</p>
      </Button>
      <Button
        variant="solid"
        radius="full"
        startContent={
          <Icon icon="devicon:apple" className="w-4 h-4 text-gray-700" />
        }
      >
        <p className="mt-0.5 text-xs md:text-sm">Continue with Apple</p>
      </Button>
    </div>
  );
}

