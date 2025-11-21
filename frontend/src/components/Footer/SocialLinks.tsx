import { Icon } from "@iconify/react";
import Link from "next/link";

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/debsnil24samudra/",
    icon: "mdi:linkedin",
    label: "LinkedIn",
  },
  {
    href: "https://drive.google.com/file/d/1wJif25oy9YWxalOUUe5sfglah12sxjq2/view?usp=drivesdk",
    icon: "mdi:resume",
    label: "Resume",
  },
  {
    href: "https://github.com/Debsnil24",
    icon: "mdi:github",
    label: "GitHub",
  },
];

export default function SocialLinks() {
  return (
    <div className="flex gap-4 items-center justify-between">
      {SOCIAL_LINKS.map((link) => (
        <Link
          key={link.href}
          target="_blank"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href={link.href}
          aria-label={link.label}
        >
          <Icon icon={link.icon} className="w-5 h-5" />
        </Link>
      ))}
    </div>
  );
}

