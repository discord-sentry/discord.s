import type { Metadata, Viewport } from "next";
import { Roboto_Mono } from "next/font/google";
import "./globals.css";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "discord.sentry | dashboard",
    template: "%s | discord.sentry"
  },
  description: "Monitor and manage your game servers with discord.sentry - The watchful guardian for your game servers.",
  keywords: ["Discord", "bot", "game server", "monitoring", "dashboard", "real-time", "statistics"],
  authors: [{ name: "discord.sentry Team", url: "https://discordsentry.cc" }],
  creator: "discord.sentry Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://discordsentry.cc",
    siteName: "discord.sentry | dashboard",
    title: "discord.sentry | dashboard",
    description: "Real-time monitoring and management for your game servers",
    images: [
      {
        url: "https://discordsentry.cc/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "discord.sentry Dashboard Preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "discord.sentry | dashboard",
    description: "Real-time game server monitoring and management",
    images: ["https://discordsentry.cc/twitter-image.jpg"],
    creator: "@discordsentry"
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/site.webmanifest"
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#212121" }
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${robotoMono.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
