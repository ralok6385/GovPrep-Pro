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

// Theme init script — runs before React hydrates to prevent flash of wrong theme.
// This is a static, hardcoded string (no user input). Safe from XSS.
// NOTE: next/script strategy="beforeInteractive" is NOT supported in App Router
// layouts (Next.js 16) — it causes the self.__next_r invariant hydration error
// that breaks all React event handlers. dangerouslySetInnerHTML is the correct
// approach for pre-hydration scripts in App Router.
const themeInitScript = `
(function(){try{
  var t=localStorage.getItem('theme');
  var v=['dark','light','warm'];
  if(t&&v.indexOf(t)===-1)t=null;
  if(t==='dark')document.documentElement.classList.add('dark');
  else if(t==='light')document.documentElement.classList.add('light');
  else if(t==='warm')document.documentElement.classList.add('warm');
  else if(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)document.documentElement.classList.add('dark');
}catch(e){}})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
