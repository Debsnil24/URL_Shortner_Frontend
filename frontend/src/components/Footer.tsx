"use client";
import { useStore } from "@/store/useStore";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Divider from "./divider";

export default function Footer() {
  const router = useRouter();
  const { setIsPrivacyPolicyOpen, setIsTermsOfServiceOpen, setIsSupportOpen } =
    useStore();
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
        <div className="flex gap-4 items-center justify-between">
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://www.linkedin.com/in/debsnil24samudra/"
          >
            <Icon icon="mdi:linkedin" className="w-5 h-5" />
          </Link>
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://drive.google.com/file/d/1wJif25oy9YWxalOUUe5sfglah12sxjq2/view?usp=drivesdk"
          >
            <Icon icon="mdi:resume" className="w-5 h-5" />
          </Link>
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/Debsnil24"
          >
            <Icon icon="mdi:github" className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <div className="py-2">
        <Divider />
      </div>
      <div className="flex gap-4 items-center justify-between w-full px-4">
        <p className="text-gray-500 text-sm">
          © 2025 SNIPLY. All rights reserved.
        </p>
        <div className="flex gap-4 items-center justify-between text-sm">
          <Link
            onClick={() => setIsSupportOpen(true)}
            className="hover:underline hover:underline-offset-4"
            href="#support"
          >
            Support
          </Link>
          <Link
            onClick={() => setIsPrivacyPolicyOpen(true)}
            className="hover:underline hover:underline-offset-4"
            href="#privacy-policy"
          >
            Privacy Policy
          </Link>
          <Link
            onClick={() => setIsTermsOfServiceOpen(true)}
            className="hover:underline hover:underline-offset-4"
            href="#terms-of-service"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
export function MobileFooter() {
  const { setIsPrivacyPolicyOpen, setIsTermsOfServiceOpen, setIsSupportOpen } =
    useStore();
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

        <div className="flex gap-4 items-center justify-between">
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://www.linkedin.com/in/debsnil24samudra/"
          >
            <Icon icon="mdi:linkedin" className="w-5 h-5" />
          </Link>
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://drive.google.com/file/d/1wJif25oy9YWxalOUUe5sfglah12sxjq2/view?usp=drivesdk"
          >
            <Icon icon="mdi:resume" className="w-5 h-5" />
          </Link>
          <Link
            target="_blank"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://github.com/Debsnil24"
          >
            <Icon icon="mdi:github" className="w-5 h-5" />
          </Link>
        </div>
      </div>
      <div className="flex gap-4 items-center justify-center w-full px-4 mt-4">
        <p className="text-gray-500 text-sm">
          © 2025 SNIPLY. All rights reserved.
        </p>
      </div>
      <div className="flex gap-4 items-center justify-center text-sm w-full">
        <Link
          onClick={() => setIsSupportOpen(true)}
          className="hover:underline hover:underline-offset-4"
          href="#support"
        >
          Support
        </Link>
        <Link
          onClick={() => setIsPrivacyPolicyOpen(true)}
          className="hover:underline hover:underline-offset-4"
          href="#privacy-policy"
        >
          Privacy Policy
        </Link>
        <Link
          onClick={() => setIsTermsOfServiceOpen(true)}
          className="hover:underline hover:underline-offset-4"
          href="#terms-of-service"
        >
          Terms of Service
        </Link>
      </div>
    </div>
  );
}
