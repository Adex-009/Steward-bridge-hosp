import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "StewardBridge — Where great people meet great places",
    template: "%s | StewardBridge",
  },
  description:
    "StewardBridge connects ambitious talent with hotels and hospitality businesses that care about service, standards and people.",
  metadataBase: new URL("https://stewardbridge.com"),
  openGraph: {
    title: "StewardBridge — Where great people meet great places",
    description:
      "Find work or find workers. StewardBridge is the bridge between capable people and the businesses that need them.",
    type: "website",
    siteName: "StewardBridge",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#f7f8f6] text-brand-950 antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
