import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/auth/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GridironIQ™ — Football Intelligence OS",
  description:
    "Football intelligence operating system for coaches: Playbook, Scout, GamePlan, Call Sheet, and AI coaching agents.",
  keywords: [
    "GridironIQ",
    "Football",
    "Playbook",
    "Coach",
    "Scouting",
    "Game Plan",
    "Analytics",
    "AI",
  ],
  authors: [{ name: "RJ Business Solutions" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "GridironIQ™",
    description: "Football Intelligence Operating System",
    siteName: "GridironIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GridironIQ™",
    description: "Football Intelligence Operating System",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
