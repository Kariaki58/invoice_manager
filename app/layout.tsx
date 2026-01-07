import type { Metadata } from "next";
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
  title: "Invoice Manager - Nigeria",
  description: "Professional invoice generator for Nigerian freelancers and businesses",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InvoiceNG",
  },
};

import { InvoiceProvider } from './context/InvoiceContext';
import Navigation from './components/Navigation';
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration';
import InstallPrompt from './components/InstallPrompt';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="InvoiceNG" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <InvoiceProvider>
          <ServiceWorkerRegistration />
          <InstallPrompt />
          <div className="flex min-h-screen bg-gray-50">
            <Navigation />
            <main className="flex-1 pb-20 md:pb-0 md:ml-20">
              {children}
            </main>
          </div>
        </InvoiceProvider>
      </body>
    </html>
  );
}
