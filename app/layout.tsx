import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "SmartLMS - Modern Cloud Learning Management System",
  description:
    "Lightweight, highly efficient LMS with Supabase PostgreSQL, Row Level Security, and Azure Blob Storage video streaming.",
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
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center">Loading...</div>}>
              {children}
            </Suspense>
          </main>
          <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© 2026 SmartLMS — Supabase & Azure Blob Media Powered</p>
              <p className="font-mono text-[11px]">Next.js 15 App Router · PostgreSQL RLS Policies</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
