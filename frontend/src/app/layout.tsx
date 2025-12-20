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
  metadataBase: new URL('https://dealz-market.vercel.app'),
  title: {
    default: "Dealz - Top Marketplace in Middle East",
    template: "%s | Dealz"
  },
  description: "Buy and sell cars, properties, phones, and more in Egypt, UAE, and KSA. The best deals are here.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dealz-market.vercel.app',
    siteName: 'Dealz',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Dealz Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dealz - Your Local Marketplace',
    description: 'Find the best deals in Egypt, UAE, and KSA.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.png',
    },
  },
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

};

import { LanguageProvider } from "../context/LanguageContext";
import { ThemeProvider } from "../context/ThemeContext";
import { ToastProvider } from "../context/ToastContext";
import { FavoriteProvider } from "../context/FavoriteContext";
import { CountryProvider } from "../context/CountryContext";
import { RecentlyViewedProvider } from "../context/RecentlyViewedContext";
import { ComparisonProvider } from "../context/ComparisonContext";

import SchemaOrg from "../components/SchemaOrg";
import NotificationManager from "../components/NotificationManager";
import Footer from "../components/Footer";
import SplashScreen from "../components/SplashScreen";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SplashScreen />
        <SchemaOrg />
        <LanguageProvider>
          <ThemeProvider>
            <ToastProvider>
              <FavoriteProvider>
                <RecentlyViewedProvider>
                  <ComparisonProvider>
                    <CountryProvider>
                      <NotificationManager />
                      {children}
                      <Footer />
                    </CountryProvider>
                  </ComparisonProvider>
                </RecentlyViewedProvider>
              </FavoriteProvider>
            </ToastProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

