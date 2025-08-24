'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import PasswordsSection from '@/components/sections/passwords';
import AddPasswordSection from '@/components/sections/add-password';
import ApiKeysSection from '@/components/sections/api-keys';
import GoogleCodesSection from '@/components/sections/google-codes';
import BackupSection from '@/components/sections/backup';
import { CitadelGuardLogo } from '@/components/icons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useHotkeys } from '@/hooks/use-hotkeys';
import type { Password } from '@/lib/types';

interface AppLayoutProps {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
}

export function AppLayout({ activeView, setActiveView }: AppLayoutProps) {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [passwords, setPasswords] = useLocalStorage<Password[]>('citadel-passwords', []);
  const [isShortcutDialogOpen, setIsShortcutDialogOpen] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'add-password', label: 'Add Password', shortcut: 'Ctrl + Alt + N' },
    { id: 'passwords', label: 'View Passwords', shortcut: 'Ctrl + Alt + V' },
    { id: 'api-keys', label: 'AI Credentials', shortcut: 'Ctrl + Alt + C' },
    { id: 'google-codes', label: 'Backup Codes', shortcut: 'Ctrl + Alt + B' },
    { id: 'backup', label: 'Backup & Restore', shortcut: 'Ctrl + Alt + R' },
  ];

  useHotkeys([
    ['?', () => setIsShortcutDialogOpen(true)],
    ['ctrl+alt+n', () => setActiveView('add-password')],
    ['ctrl+alt+v', () => setActiveView('passwords')],
    ['ctrl+alt+c', () => setActiveView('api-keys')],
    ['ctrl+alt+b', () => setActiveView('google-codes')],
    ['ctrl+alt+r', () => setActiveView('backup')],
  ]);


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
        return <AddPasswordSection setPasswords={setPasswords} setActiveView={setActiveView} />;
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
    <>
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b">
        <div className="flex h-16 items-center justify-between bg-background px-4">
            <div className='flex items-center gap-4'>
                <div className="flex items-center gap-2">
                    <CitadelGuardLogo className="h-7 w-7 text-primary" />
                    <h1 className="text-lg font-semibold tracking-tight">Citadel Guard</h1>
                </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setIsShortcutDialogOpen(true)}>
                <Keyboard className="h-4 w-4" />
                <span className="sr-only">Keyboard Shortcuts</span>
              </Button>
              {renderThemeSwitcher()}
            </div>
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
     <Dialog open={isShortcutDialogOpen} onOpenChange={setIsShortcutDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate and use the app more efficiently.
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Shortcut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Open this dialog</TableCell>
                <TableCell className="text-right">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">?</kbd>
                </TableCell>
              </TableRow>
              {menuItems.map((item) => (
                <TableRow key={`shortcut-${item.id}`}>
                  <TableCell>Go to {item.label}</TableCell>
                  <TableCell className="text-right">
                     <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      {item.shortcut}
                    </kbd>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </>
  );
}
