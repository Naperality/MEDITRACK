import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Navbar from "@/components/Navbar"; 
import "./globals.css";

// Metadata handles the SEO and PWA manifest linking
export const metadata: Metadata = {
  title: "MediNow",
  description: "Your Personal Medication Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediNow",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Viewport handles the mobile theme color (Updated to match Rose-600)
export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents zooming in
  userScalable: false, // This is where you put user-scalable=no
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* This helps with iOS splash screens */}
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
        </head>
        <body className="antialiased">
          <div className="fixed top-0 inset-x-0 z-[9999] pointer-events-none p-4 sm:p-6">
            <div className="max-w-4xl mx-auto pointer-events-auto">
              <Navbar />
            </div>
          </div>
          <div className="relative z-10">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}