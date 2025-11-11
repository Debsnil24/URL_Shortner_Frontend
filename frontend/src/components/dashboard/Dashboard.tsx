"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useStore } from "@/store/useStore";
import { authToasts, toastBus } from "@/utils/toastUtils";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useStore();
  const { logout } = useAuth();

  // Consume auth success once when landing on dashboard
  useEffect(() => {
    const handleAuthSuccess = (
      type: "login" | "signup" | "oauth",
      firstName?: string
    ) => {
      if (type === "login") authToasts.loginSuccess();
      if (type === "signup") authToasts.signupSuccess(firstName ?? "");
      if (type === "oauth") authToasts.googleAuthSuccess();
    };

    const payload = toastBus.popAuthSuccess();
    if (payload) {
      handleAuthSuccess(payload.type, payload.firstName);
    }

    const unsubscribe = toastBus.subscribe((event) => {
      if (event.type !== "authSuccess") return;
      handleAuthSuccess(event.payload.variant, event.payload.firstName);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getInitials = () => {
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="font-sans flex flex-col min-h-screen md:min-h-[calc(100vh-85px)]"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Image
            src="/SNIPLY.svg"
            alt="Sniply Logo"
            width={40}
            height={40}
            className="invert-100"
          />
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="">
            <Dropdown className="backdrop-blur-md border border-white/10 shadow-xl bg-gray-500/20">
              <DropdownTrigger>
                <User
                  name={user?.name}
                  description={user?.email}
                  avatarProps={{
                    src: user?.avatar_url,
                    name: getInitials(),
                    showFallback: true,
                  }}
                />
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  color="danger"
                  className="text-danger"
                  key={"logout"}
                  onClick={logout}
                  startContent={<Icon icon="mdi:logout" className="w-4 h-4" />}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Links</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <Icon icon="mdi:link" className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Clicks</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <Icon
                  icon="mdi:cursor-click"
                  className="w-8 h-8 text-green-500"
                />
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Links</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
                <Icon
                  icon="mdi:check-circle"
                  className="w-8 h-8 text-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-4">
              <Button
                color="primary"
                startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
                className="font-medium"
              >
                Create New Link
              </Button>
              <Button
                variant="bordered"
                startContent={<Icon icon="mdi:upload" className="w-4 h-4" />}
                className="font-medium"
              >
                Bulk Import
              </Button>
              <Button
                variant="bordered"
                startContent={<Icon icon="mdi:analytics" className="w-4 h-4" />}
                className="font-medium"
              >
                View Analytics
              </Button>
            </div>
          </div>

          {/* Recent Links */}
          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Recent Links
            </h2>
            <div className="text-center py-12">
              <Icon
                icon="mdi:link-off"
                className="w-16 h-16 text-gray-500 mx-auto mb-4"
              />
              <p className="text-gray-400 mb-4">No links created yet</p>
              <Button
                color="primary"
                startContent={<Icon icon="mdi:plus" className="w-4 h-4" />}
              >
                Create Your First Link
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
