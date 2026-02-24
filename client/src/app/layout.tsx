import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from 'react-hot-toast';

import { NotificationProvider } from "@/context/NotificationContext";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('Forcefully unregistered service worker:', registration);
                }
              }).catch(function(err) {
                console.log('Service Worker unregistration failed: ', err);
              });
              
              // Also clear out caches to be absolutely safe
              caches.keys().then((keyList) => {
                return Promise.all(keyList.map((key) => caches.delete(key)));
              });
            }
          `
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
