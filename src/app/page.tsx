'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { ThemeProvider } from '@/components/theme-provider';
import Link from 'next/link';

export default function Home() {
  const [activeView, setActiveView] = useState('add-password');

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="h-screen flex flex-col">
        <AppLayout activeView={activeView} setActiveView={setActiveView} />
        <footer className="mt-auto p-4 bg-gray-100 text-center">
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </footer>
      </main>
    </ThemeProvider>
  );
}
