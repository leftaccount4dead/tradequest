import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { STARTING_BALANCE } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TradeQuest — Learn Day Trading",
  description: `A realistic day trading simulator. Start with $${STARTING_BALANCE}, learn from guides, compete on the leaderboard, and practice with an AI coach that never gives trade picks.`,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "TradeQuest",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0f0d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
