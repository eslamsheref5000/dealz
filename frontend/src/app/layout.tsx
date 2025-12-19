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
  title: "Dealz - Your Local Marketplace",
  description: "The best place to find deals on cars, properties, and more in your area.",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dealz",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { CountryProvider } from "../context/CountryContext";
import { RecentlyViewedProvider } from "../context/RecentlyViewedContext";
import { ComparisonProvider } from "../context/ComparisonContext";

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
        <LanguageProvider>
          <CountryProvider>
            <ToastProvider>
              <FavoriteProvider>
                <RecentlyViewedProvider>
                  <ComparisonProvider>
                    <ThemeProvider>
                      {children}
                    </ThemeProvider>
                  </ComparisonProvider>
                </RecentlyViewedProvider>
              </FavoriteProvider>
            </ToastProvider>
          </CountryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


