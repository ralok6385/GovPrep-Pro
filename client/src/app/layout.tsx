import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from 'react-hot-toast';

import { NotificationProvider } from "@/context/NotificationContext";
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Lalan RailPath - Your Path to Railway Success",
  description: "Premier preparation platform for RRB, NTPC, Group D, ALP, and JE.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/lalan_logo.png",
    apple: "/images/lalan_logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RailPath",
  },
};

export const viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
         * SECURITY: Theme initialization is loaded as a static external script
         * (/public/theme-init.js) instead of dangerouslySetInnerHTML to comply
         * with Content-Security-Policy script-src 'self' — no 'unsafe-inline' needed.
         * The script runs synchronously before React hydrates, preventing FOUC.
         */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/theme-init.js" />
      </head>
      <body
        className={`${plusJakarta.variable} ${manrope.variable} antialiased`}
      >
        <AuthProvider>
          <NotificationProvider>
            <ThemeProvider>
              <Toaster position="top-center" />
              {children}
            </ThemeProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
