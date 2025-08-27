'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { MasterPasswordSetup } from '@/components/auth/MasterPasswordSetup';
import { VaultUnlock } from '@/components/auth/VaultUnlock';

export default function Home() {
  const [activeView, setActiveView] = useState('add-password');
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, loading, user, isVaultUnlocked, masterPasswordStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (mounted && !loading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    } else if (isAuthenticated && !isVaultUnlocked) {
      console.log('Authenticated but vault locked, redirecting to add-password tab');
      setActiveView('add-password');
    }
  }, [mounted, loading, isAuthenticated, isVaultUnlocked, router]);

  // Force re-evaluation of auth state after completing auth steps
  const handleAuthStepComplete = () => {
    console.log('Auth step completed, state should auto-update...');
    // The AuthContext should automatically update the state
    // Just set a default view for when the app loads
    setActiveView('passwords');
  };

  const handleViewPasswords = () => {
    if (!isVaultUnlocked) {
      console.log('Vault locked, prompting for master password');
      setActiveView('vault-unlock');
    } else {
      setActiveView('view-passwords');
    }
  };

  // Show loading while checking authentication
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  // Show authentication screens if needed
  if (!masterPasswordStatus.isSet) {
    return <MasterPasswordSetup onComplete={handleAuthStepComplete} />;
  }

  if (!isVaultUnlocked) {
    return <VaultUnlock onUnlock={handleAuthStepComplete} />;
  }

  // Show main app only if fully authenticated and vault is unlocked
  return (
    <main className="h-screen flex flex-col" data-vault-content>
      <AppLayout activeView={activeView} setActiveView={setActiveView} />
    </main>
  );
}
