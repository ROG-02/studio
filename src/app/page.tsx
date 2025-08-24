'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { ThemeProvider } from '@/components/theme-provider';

export default function Home() {
  const [activeView, setActiveView] = useState('passwords');

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <main className="h-screen flex flex-col">
        <AppLayout activeView={activeView} setActiveView={setActiveView} />
      </main>
    </ThemeProvider>
  );
}
