import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Roblox Group Games Finder",
  description: "Find and explore games from your favorite Roblox groups.",
  metadataBase: new URL('https://group-games.vercel.app'),
  openGraph: {
    title: "Roblox Group Games Finder",
    description: "Find and explore games from your favorite Roblox groups.",
    url: "https://group-games.vercel.app",
    siteName: "Roblox Group Games Finder",
    images: [
      {
        url: "/next.svg",
        width: 180,
        height: 38,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Roblox Group Games Finder",
    description: "Find and explore games from your favorite Roblox groups.",
    images: ["/next.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
