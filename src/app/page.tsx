'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';

export default function Home() {
  const [activeView, setActiveView] = useState('passwords');

  return (
    <main>
      <AppLayout activeView={activeView} setActiveView={setActiveView} />
    </main>
  );
}
