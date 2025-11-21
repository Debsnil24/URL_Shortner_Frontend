"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Divider from "./divider";
import FooterLinks from "./Footer/FooterLinks";
import SocialLinks from "./Footer/SocialLinks";

export default function Footer() {
  const router = useRouter();
  return (
    <div
      className=" flex-col flex-wrap items-center justify-between w-full px-12 py-4"
      style={{ color: "var(--text-secondary)" }}
    >
      <div className="flex gap-4 items-center justify-between w-full px-4">
        <Image
          src="/SNIPLY.svg"
          alt="Sniply Logo"
          width={50}
          height={50}
          className="invert-100"
          onClick={() => router.push("/")}
        />
        <SocialLinks />
      </div>
      <div className="py-2">
        <Divider />
      </div>
      <div className="flex gap-4 items-center justify-between w-full px-4">
        <p className="text-gray-500 text-sm">
          © 2025 SNIPLY. All rights reserved.
        </p>
        <FooterLinks />
      </div>
    </div>
  );
}
export function MobileFooter() {
  return (
    <div
      className=" flex-col flex-wrap items-center justify-between w-full px-4 py-4"
      style={{ color: "var(--text-secondary)" }}
    >
      <div className="py-2">
        <Divider />
      </div>
      <div className="flex gap-4 items-center justify-between w-full px-4">
        <div>
          <h1
            className="font-jaro text-xl font-bold transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            SNIPLY
          </h1>
        </div>
        <SocialLinks />
      </div>
      <div className="flex gap-4 items-center justify-center w-full px-4 mt-4">
        <p className="text-gray-500 text-sm">
          © 2025 SNIPLY. All rights reserved.
        </p>
      </div>
      <div className="flex gap-4 items-center justify-center text-sm w-full">
        <FooterLinks />
      </div>
    </div>
  );
}
