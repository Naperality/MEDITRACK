import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";

// Metadata handles the SEO and PWA manifest linking
export const metadata: Metadata = {
  title: "MediTrack",
  description: "Your Personal Medication Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediTrack",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Viewport handles the mobile theme color (the bar at the very top of the phone)
export const viewport: Viewport = {
  themeColor: "#eb2577",
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
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}