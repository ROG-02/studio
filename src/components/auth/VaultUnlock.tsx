'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, AuthSecurity } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react';
import { MasterPasswordSetup } from './MasterPasswordSetup';

interface VaultUnlockProps {
  onUnlock: () => void;
}

export function VaultUnlock({ onUnlock }: VaultUnlockProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  const { unlockVault, error, clearError, user, dangerousResetMasterPassword } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;
  const showResetOption = attempts >= 3;

  useEffect(() => {
    // Apply screen protection
    if (passwordRef.current) {
      AuthSecurity.enableScreenProtection(passwordRef.current);
    }

    // Focus password input
    if (passwordRef.current && !isLocked) {
      passwordRef.current.focus();
    }
  }, [isLocked]);

  useEffect(() => {
    // Clear error when component mounts
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) return;
    
    clearError();
    setIsLoading(true);

    try { 
      const success = await unlockVault(password);
      if (success) {
        // Clear sensitive data
        AuthSecurity.clearFormData(formRef);
        setPassword('');
        setAttempts(0);
        onUnlock();
      } else {
        setAttempts(prev => prev + 1);
        setPassword('');
      }
    } catch (err) {
      setAttempts(prev => prev + 1);
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAttempts(0);
    setPassword('');
    clearError();
  };

  const handleResetMasterPassword = () => {
    if (dangerousResetMasterPassword && dangerousResetMasterPassword()) {
      // Reset successful, reload the page to show setup screen
      window.location.reload();
    }
  };

  if (isLocked) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-600">Vault Locked</CardTitle>
          <CardDescription>
            Too many failed attempts. Please try again later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your vault has been temporarily locked due to multiple failed unlock attempts. 
              Please wait a few minutes before trying again.
            </AlertDescription>
          </Alert>
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="w-full mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Unlock Your Vault</CardTitle>
        <CardDescription>
          Welcome back, {user?.email}. Enter your master password to access your vault.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="vault-password">Master Password</Label>
            <div className="relative">
              <Input
                ref={passwordRef}
                id="vault-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="pr-10"
                required
                disabled={isLoading}
                {...AuthSecurity.getSecureInputProps()}
                data-sensitive="true"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {attempts > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Incorrect password. {maxAttempts - attempts} attempt(s) remaining.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {showResetOption && process.env.NODE_ENV === 'development' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Having trouble accessing your vault? You can reset your master password, but this will require setting up a new one.
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-sm ml-2 text-blue-600"
                  onClick={handleResetMasterPassword}
                >
                  Reset Master Password
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !password}
          >
            <Shield className="mr-2 h-4 w-4" />
            {isLoading ? 'Unlocking...' : 'Unlock Vault'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Forgot your master password?{' '}
            <Button variant="link" className="p-0 h-auto text-sm">
              Learn about recovery options
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
