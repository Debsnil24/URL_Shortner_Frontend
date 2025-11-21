import { useStore } from "@/store/useStore";
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "#support", label: "Support" },
  { href: "#privacy-policy", label: "Privacy Policy" },
  { href: "#terms-of-service", label: "Terms of Service" },
] as const;

export default function FooterLinks() {
  const { setIsSupportOpen, setIsPrivacyPolicyOpen, setIsTermsOfServiceOpen } =
    useStore();

  const handleClick = (href: string) => {
    if (href === "#support") {
      setIsSupportOpen(true);
    } else if (href === "#privacy-policy") {
      setIsPrivacyPolicyOpen(true);
    } else if (href === "#terms-of-service") {
      setIsTermsOfServiceOpen(true);
    }
  };

  return (
    <div className="flex gap-4 items-center justify-between text-sm">
      {FOOTER_LINKS.map((link) => (
        <Link
          key={link.href}
          onClick={() => handleClick(link.href)}
          className="hover:underline hover:underline-offset-4"
          href={link.href}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

