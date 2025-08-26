"use client";
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { cn } from '@/lib/utils';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const [showHeader, setShowHeader] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = window.localStorage.getItem('isAuthenticated') === 'true';
      setShowHeader(isAuthenticated && pathname !== '/login');
      if (!isAuthenticated && pathname !== '/login') {
        router.push('/login');
      }

      // Auto-logout after 15 minutes of inactivity
      let logoutTimer: NodeJS.Timeout;
      const resetTimer = () => {
        clearTimeout(logoutTimer);
        logoutTimer = setTimeout(() => {
          window.localStorage.removeItem('isAuthenticated');
          router.push('/login');
        }, 15 * 60 * 1000); // 15 minutes
      };
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      resetTimer();
      return () => {
        clearTimeout(logoutTimer);
        window.removeEventListener('mousemove', resetTimer);
        window.removeEventListener('keydown', resetTimer);
      };
    }
  }, [pathname, router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased', inter.variable)} style={{margin:0, padding:0}}>
        {/* Remove header background and padding for seamless gradient */}
        {showHeader && (
          <header className="flex justify-between items-center" style={{background:'transparent', boxShadow:'none', padding:'1rem 2rem 0 2rem'}}>
            <Link href="/" className="text-blue-500 hover:underline">
              Home
            </Link>
            <Button type="button" variant="outline" onClick={() => {
              window.localStorage.removeItem('isAuthenticated');
              router.push('/login');
            }}>
              Logout
            </Button>
          </header>
        )}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
