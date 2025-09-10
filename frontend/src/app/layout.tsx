import Footer, { MobileFooter } from "@/components/Footer";
import AuthDialog from "@/components/auth/authDialog";
import PrivacyPolicy from "@/components/privacyPolicy";
import Support from "@/components/support";
import TermsCondition from "@/components/termsCondition";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Jaro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jaro = Jaro({
  variable: "--font-jaro",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: "/S.svg",
  },
  title: "Sniply",
  description: "Smarter links for a faster web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jaro.variable} antialiased`}
      >
        <Providers>
          {children}
          <AuthDialog />
          <PrivacyPolicy />
          <TermsCondition />
          <Support />
        </Providers>
        <div className="md:hidden">
          <MobileFooter />
        </div>
        <div className="hidden md:block">
          <Footer />
        </div>
      </body>
    </html>
  );
}
