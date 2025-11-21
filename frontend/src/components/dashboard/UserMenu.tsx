import { useAuth } from "@/components/auth/AuthProvider";
import { User as UserType } from "@/services/api";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@heroui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useMemo } from "react";

interface UserMenuProps {
  user: UserType | null;
}

export default function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();

  const userInitials = useMemo(() => {
    const name = user?.name || user?.email?.split("@")[0] || "User";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name, user?.email]);

  return (
    <Dropdown className="backdrop-blur-md border border-white/10 shadow-xl bg-gray-500/20">
      <DropdownTrigger>
        <div>
          <div className="md:hidden">
            <Avatar
              src={user?.avatar_url}
              name={userInitials}
              showFallback
              className="cursor-pointer"
            />
          </div>
          <div className="hidden md:block">
            <User
              name={user?.name}
              description={user?.email}
              avatarProps={{
                src: user?.avatar_url,
                name: userInitials,
                showFallback: true,
              }}
            />
          </div>
        </div>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          key="user-info"
          textValue="user-info"
          className="h-auto py-3 md:hidden"
          isReadOnly
        >
          <div className="flex flex-col gap-1">
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </DropdownItem>
        <DropdownItem
          color="danger"
          className="text-danger"
          key="logout"
          onClick={logout}
          startContent={<Icon icon="mdi:logout" className="w-4 h-4" />}
        >
          Log Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
