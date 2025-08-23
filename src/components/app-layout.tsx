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
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { CitadelGuardLogo, GoogleIcon } from '@/components/icons';
import { KeyRound, Bot, Save, PanelLeft } from 'lucide-react';
import PasswordsSection from '@/components/sections/passwords';
import ApiKeysSection from '@/components/sections/api-keys';
import GoogleCodesSection from '@/components/sections/google-codes';
import BackupSection from '@/components/sections/backup';
import type { Dispatch, SetStateAction } from 'react';

interface AppLayoutProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

export function AppLayout({ activeView, setActiveView }: AppLayoutProps) {
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
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full">
              <CitadelGuardLogo className="h-6 w-6 text-primary" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold tracking-tight">Citadel Guard</h2>
            </div>
          </div>
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
      </Sidebar>
      <SidebarInset className="max-h-screen overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
          <SidebarTrigger>
            <PanelLeft />
          </SidebarTrigger>
          <div className="flex items-center gap-2">
            <CitadelGuardLogo className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Citadel Guard</h1>
          </div>
        </header>
        <div className="p-4 sm:p-6">{renderActiveView()}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
