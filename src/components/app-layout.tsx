'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

import PasswordsSection from '@/components/sections/passwords';
import AddPasswordSection from '@/components/sections/add-password';
import ApiKeysSection from '@/components/sections/api-keys';
import GoogleCodesSection from '@/components/sections/google-codes';
import BackupSection from '@/components/sections/backup';
import { CitadelGuardLogo } from '@/components/icons';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from '@/components/ui/menubar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Password } from '@/lib/types';

interface AppLayoutProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

export function AppLayout({ activeView, setActiveView }: AppLayoutProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [passwords, setPasswords] = useLocalStorage<Password[]>('citadel-passwords', []);


  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'passwords', label: 'View Passwords' },
    { id: 'add-password', label: 'Add Password' },
    { id: 'api-keys', label: 'AI Credentials' },
    { id: 'google-codes', label: 'Backup Codes' },
    { id: 'backup', label: 'Backup & Restore' },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'passwords':
        return <PasswordsSection passwords={passwords} setPasswords={setPasswords} />;
      case 'add-password':
        return <AddPasswordSection setPasswords={setPasswords} setActiveView={setActiveView} />;
      case 'api-keys':
        return <ApiKeysSection />;
      case 'google-codes':
        return <GoogleCodesSection />;
      case 'backup':
        return <BackupSection />;
      default:
        return <PasswordsSection passwords={passwords} setPasswords={setPasswords} />;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const renderThemeSwitcher = () => {
    if (!mounted) {
      return <div style={{width: '74px'}} />; // Reserve space to prevent layout shift
    }
    return (
      <div className="flex items-center justify-center space-x-2">
        <Sun className="h-4 w-4" />
        <Switch
          id="theme-switch"
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          aria-label="Toggle theme"
        />
        <Moon className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b">
        <div className="flex h-16 items-center justify-between bg-background px-4">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                    <CitadelGuardLogo className="h-7 w-7 text-primary" />
                    <h1 className="text-lg font-semibold tracking-tight">Citadel Guard</h1>
                </div>
                 <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                        <MenubarItem>New...</MenubarItem>
                        <MenubarItem>Export...</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>Exit</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>Settings</MenubarTrigger>
                         <MenubarContent>
                            <MenubarItem>Preferences...</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Master Password...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>Help</MenubarTrigger>
                         <MenubarContent>
                            <MenubarItem>About</MenubarItem>
                            <MenubarItem>Check for Updates...</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
            {renderThemeSwitcher()}
        </div>
        <div className="px-4">
            <Tabs value={activeView} onValueChange={setActiveView} className="h-full space-y-6">
                <TabsList>
                {menuItems.map((item) => (
                    <TabsTrigger key={item.id} value={item.id}>
                        {item.label}
                    </TabsTrigger>
                ))}
                </TabsList>
            </Tabs>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto bg-muted/30 p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>
    </div>
  );
}
