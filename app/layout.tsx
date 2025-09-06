import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileFooterNav } from "@/components/ui/mobile-footer-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientProvider } from "@/components/ClientProvider";
import { Toaster } from "@/components/ui/toaster";
import { ComparisonButton } from "@/components/comparison-button";

export const metadata: Metadata = {
  title: "PSO2NGS 商品価格一覧",
  description:
    "「Phantasy Star Online 2 New Genesis（PSO2NGS）」内で販売されているアイテムの価格を、シップごとに一覧表示するアプリです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientProvider>
            <div className="flex min-h-screen bg-gradient-to-br from-background to-background/95">
              <Sidebar />
              <div className="flex-1 transition-all duration-300 ease-in-out md:ml-16 pb-16 md:pb-0">
                <main className="container mx-auto p-4 animate-fade-in">{children}</main>
              </div>
              <MobileFooterNav />
              <ComparisonButton />
            </div>
            <Toaster />
          </ClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
