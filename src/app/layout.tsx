import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthProvider from "@/components/auth/AuthProvider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'PSU Leases',
  description: 'Find and post Penn State leases and subleases',
  metadataBase: new URL("https://psusublease.vercel.app"),
  openGraph: {
    title: 'PSU Leases',
    description: 'Find and post Penn State leases and subleases',
    url: 'https://psusublease.vercel.app',
    siteName: 'PSU Leases',
    images: [
      {
        url: '/preview_small.png',
        width: 800,
        height: 600,
        alt: 'PSU Leases Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PSU Leases',
    description: 'Find and post Penn State leases and subleases',
    images: ['/preview_small.png'],
    site: '@psusublease',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
