'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { CitadelGuardLogo, GoogleIcon } from '@/components/icons';
import { KeyRound, Bot, Save, PanelLeft, Sun, Moon } from 'lucide-react';
import PasswordsSection from '@/components/sections/passwords';
import ApiKeysSection from '@/components/sections/api-keys';
import GoogleCodesSection from '@/components/sections/google-codes';
import BackupSection from '@/components/sections/backup';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';

interface AppLayoutProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

export function AppLayout({ activeView, setActiveView }: AppLayoutProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'passwords', label: 'Passwords', icon: KeyRound },
    { id: 'api-keys', label: 'AI API Keys', icon: Bot },
    { id: 'google-codes', label: 'Google Codes', icon: GoogleIcon },
    { id: 'backup', label: 'Backup & Restore', icon: Save },
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case 'passwords':
        return <PasswordsSection />;
      case 'api-keys':
        return <ApiKeysSection />;
      case 'google-codes':
        return <GoogleCodesSection />;
      case 'backup':
        return <BackupSection />;
      default:
        return <PasswordsSection />;
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  const renderThemeSwitcher = () => {
    if (!mounted) {
      return null;
    }
    return (
      <div className="flex items-center justify-center space-x-2">
        <Sun className="h-5 w-5" />
        <Switch
          id="theme-switch"
          checked={theme === 'dark'}
          onCheckedChange={toggleTheme}
          aria-label="Toggle theme"
        />
        <Moon className="h-5 w-5" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <CitadelGuardLogo className="h-7 w-7 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Citadel Guard</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    tooltip={item.label}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              {renderThemeSwitcher()}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 md:hidden">
            <SidebarTrigger>
              <PanelLeft />
            </SidebarTrigger>
            <div className="flex items-center gap-2">
              <CitadelGuardLogo className="h-7 w-7 text-primary" />
              <h1 className="text-lg font-semibold">Citadel Guard</h1>
            </div>
          </header>
          <div className="p-4 sm:p-6 lg:p-8">{renderActiveView()}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}