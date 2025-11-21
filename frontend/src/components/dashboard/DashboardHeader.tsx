import { User } from "@/services/api";
import Image from "next/image";
import UserMenu from "./UserMenu";

interface DashboardHeaderProps {
  user: User | null;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center p-6 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <Image
          src="/SNIPLY.svg"
          alt="Sniply Logo"
          width={80}
          height={80}
          className="invert-100"
        />
      </div>

      <div className="flex items-center gap-4">
        <UserMenu user={user} />
      </div>
    </div>
  );
}
