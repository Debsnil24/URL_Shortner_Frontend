"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import CustomModal from "../customModal";
import Login from "./login";
import Signup from "./signup";

export default function AuthDialog() {
  const { isAuthDialogOpen, setAuthDialogOpen, isLogin } = useStore();
  const { handleGoogleAuth } = useAuth();

  return (
    <CustomModal
      isOpen={isAuthDialogOpen}
      onOpenChange={setAuthDialogOpen}
      size="md"
    >
      <div className="flex flex-col gap-4 -mt-4">
        {isLogin ? <Login /> : <Signup />}

        <div className="flex flex-row gap-2 w-full justify-center items-center">
          <div className="w-1/2 h-px bg-gray-700"></div>
          <p className="text-gray-300 text-xs">or</p>
          <div className="w-1/2 h-px bg-gray-700"></div>
        </div>

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
      </div>
    </CustomModal>
  );
}
