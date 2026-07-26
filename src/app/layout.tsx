import type { Metadata } from "next";
import localFont from "next/font/local";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Clouds Docs - Google Docs Clone",
    template: "%s | Clouds Docs",
  },
  description: "Enterprise rich-text document collaboration platform",
  applicationName: "Clouds Docs",
  authors: [{ name: "Clouds Team" }],
  creator: "Clouds Team",
  publisher: "Clouds Platform",
  generator: "Next.js",
  keywords: ["docs", "collaboration", "editor", "rich-text"],
  category: "productivity",
  robots: {
    index: true,
    follow: true,
  },
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://docs.clouds.com"),
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
    { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
  ],

  appleWebApp: {
    capable: true,
    title: "Clouds Docs",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "google-site-verification-code",
  },
  openGraph: {
    title: "Clouds Docs",
    description: "Enterprise rich-text document collaboration platform",
    url: "https://docs.clouds.com",
    siteName: "Clouds Docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clouds Docs",
    description: "Enterprise rich-text document collaboration platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
