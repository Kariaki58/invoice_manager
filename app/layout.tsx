import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "invoiceme - Professional Invoice Manager",
  description: "Professional invoice generator for Nigerian freelancers and businesses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "invoiceme",
  },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { InvoiceProvider } from './context/InvoiceContext';
import { ThemeProvider } from './context/ThemeContext';
import Navigation from './components/Navigation';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import PWAUpdatePrompt from './components/PWAUpdatePrompt';
import InstallPrompt from './components/InstallPrompt';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="invoiceme" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        <ThemeProvider>
          <InvoiceProvider>
            <ServiceWorkerRegistration />
            <PWAUpdatePrompt />
            <InstallPrompt />
            <div className="flex min-h-screen bg-background transition-colors">
              <Navigation />
              <main className="flex-1 pb-20 md:pb-0 md:ml-20">
                {children}
              </main>
            </div>
          </InvoiceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
