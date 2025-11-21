"use client";

import { useStore } from "@/store/useStore";
import CustomModal from "../customModal";
import Login from "./login";
import Signup from "./signup";
import OAuthButtons from "./OAuthButtons";

export default function AuthDialog() {
  const { isAuthDialogOpen, setAuthDialogOpen, isLogin } = useStore();

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

        <OAuthButtons />
      </div>
    </CustomModal>
  );
}
