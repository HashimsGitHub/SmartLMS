import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "SmartLMS - Modern Cloud Learning Management System",
  description:
    "Lightweight, highly efficient LMS with Supabase PostgreSQL, Row Level Security, and Azure Blob Storage video streaming.",
  applicationName: "SmartLMS",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "SmartLMS", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased selection:bg-blue-500/20 selection:text-blue-700 dark:selection:text-blue-300">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-border/40" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-6">
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer className="hidden md:block border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 SmartLMS — Supabase & Azure Blob Media Powered</p>
              <p className="font-mono text-[11px]">Next.js 15 App Router · PostgreSQL RLS Policies</p>
            </div>
          </footer>
          <MobileNav />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
