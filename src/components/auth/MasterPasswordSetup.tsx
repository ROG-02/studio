'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth, AuthSecurity } from '@/contexts/AuthContext';
import { calculatePasswordStrength } from '@/lib/crypto';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MasterPasswordSetupProps {
  onComplete: () => void;
}

export function MasterPasswordSetup({ onComplete }: MasterPasswordSetupProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { setupMasterPassword, error, clearError } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const passwordStrength = calculatePasswordStrength(password);

  useEffect(() => {
    // Apply screen protection
    if (passwordRef.current) {
      AuthSecurity.enableScreenProtection(passwordRef.current);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (passwordStrength.strength === 'Very Weak' || passwordStrength.strength === 'Weak') {
      setLocalError('Please choose a stronger password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await setupMasterPassword(password);
      if (success) {
        // Clear sensitive data
        AuthSecurity.clearFormData(formRef);
        setPassword('');
        setConfirmPassword('');
        onComplete();
      }
    } catch (err) {
      // Error handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'Very Weak': return 'bg-red-500';
      case 'Weak': return 'bg-orange-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Good': return 'bg-blue-500';
      case 'Strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const getStrengthPercentage = (score: number) => {
    return Math.min((score / 8) * 100, 100);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Setup Master Password</CardTitle>
        <CardDescription>
          Create a strong master password to protect your vault. This password encrypts all your data locally and cannot be changed once set.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Your master password cannot be recovered or changed. Make sure you remember it or store it safely.
          </AlertDescription>
        </Alert>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="master-password">Master Password</Label>
            <div className="relative">
              <Input
                ref={passwordRef}
                id="master-password"
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
            
            {password && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Password Strength:</span>
                  <span className={cn(
                    'font-medium',
                    passwordStrength.strength === 'Strong' ? 'text-green-600' :
                    passwordStrength.strength === 'Good' ? 'text-blue-600' :
                    passwordStrength.strength === 'Fair' ? 'text-yellow-600' :
                    'text-red-600'
                  )}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <Progress 
                  value={getStrengthPercentage(passwordStrength.score)} 
                  className="h-2"
                />
                {passwordStrength.feedback.length > 0 && (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <li key={index}>• {feedback}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your master password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {confirmPassword && password && (
              <div className="flex items-center space-x-1 text-sm">
                {password === confirmPassword ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Passwords match</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          {(error || localError) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || localError}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={
              isLoading || 
              !password || 
              !confirmPassword || 
              password !== confirmPassword ||
              passwordStrength.strength === 'Very Weak' ||
              passwordStrength.strength === 'Weak'
            }
          >
            {isLoading ? 'Setting up...' : 'Setup Master Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
