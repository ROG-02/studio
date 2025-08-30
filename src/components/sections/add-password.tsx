'use client';

import { useState } from 'react';
import type { Password } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, PlusCircle } from 'lucide-react';
import { getPasswordStrength, generatePassword } from '@/lib/utils';

interface AddPasswordSectionProps {
  passwords: Password[];
  setPasswords: React.Dispatch<React.SetStateAction<Password[]>>;
  setActiveView: (view: string) => void;
}

const getCategoryForPlatform = (platformName: string): string => {
    if (!platformName) return 'General';
    const name = platformName.toLowerCase();
    if (['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok', 'snapchat', 'pinterest', 'x'].some(p => name.includes(p))) return 'Social Media';
    if (['google', 'microsoft', 'apple', 'icloud'].some(p => name.includes(p))) return 'Account';
    if (['amazon', 'ebay', 'walmart', 'shopify', 'etsy'].some(p => name.includes(p))) return 'Shopping';
    if (['github', 'gitlab', 'bitbucket', 'jira', 'stackoverflow'].some(p => name.includes(p))) return 'Development';
    if (['netflix', 'hulu', 'spotify', 'youtube', 'disney+'].some(p => name.includes(p))) return 'Entertainment';
    if (['chase', 'bank of america', 'paypal', 'wells fargo', 'citi'].some(p => name.includes(p))) return 'Finance';
    if (['slack', 'zoom', 'teams', 'notion', 'asana'].some(p => name.includes(p))) return 'Work';
    if (['aws', 'gcp', 'azure', 'digitalocean', 'heroku'].some(p => name.includes(p))) return 'Cloud Services';
    return 'General';
};

export default function AddPasswordSection({ setPasswords, setActiveView }: AddPasswordSectionProps) {
  const [category, setCategory] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [platform, setPlatform] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const passwordStrength = getPasswordStrength(passwordValue);

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const platformName = e.target.value;
  setPlatform(platformName);
  const suggestedCategory = getCategoryForPlatform(platformName);
  setCategory(suggestedCategory);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    let cat = formData.get('category') as string;
    const platformValue = formData.get('name') as string;
    const usernameValue = formData.get('username') as string;
    const emailValue = formData.get('email') as string;
    const passwordVal = formData.get('value') as string;
    if (!cat || cat.trim() === '') {
      cat = platformValue;
    }
    const newPassword: Password = {
      id: crypto.randomUUID(),
      name: platformValue,
      username: usernameValue,
      email: emailValue,
      value: passwordVal,
      category: cat,
    };

    if (getPasswordStrength(newPassword.value) === 'Weak') {
      toast({ title: 'Password is too weak!', variant: 'destructive' });
      return;
    }

    setPasswords((prev) => {
      // Prevent duplicate by id
      if (prev.some(p => p.id === newPassword.id)) {
        toast({ title: 'Password already exists!', variant: 'destructive' });
        return prev;
      }
      return [...prev, newPassword];
    });
    toast({ title: 'Password added successfully!' });
    e.currentTarget.reset();
    setCategory('');
    setPasswordValue('');
    setPlatform('');
    setUsername('');
    setEmail('');
    setActiveView('passwords');
  };

  return (
    <Card className="max-w-2xl mx-auto animate-slide-in-from-right">
      <CardHeader>
        <CardTitle>Add a New Password</CardTitle>
        <CardDescription>Fill in the details below to save a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6" autoComplete="off">
          <div className="space-y-2">
            <Label htmlFor="name">Platform</Label>
            <Input 
                id="name" 
                name="name" 
                placeholder="e.g. Google, Facebook" 
                required 
                value={platform} 
                onChange={handlePlatformChange} 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username (Optional)</Label>
            <Input 
                id="username" 
                name="username" 
                placeholder="e.g. your_username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="e.g. user@example.com" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Password</Label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                id="value"
                name="value"
                type={isPasswordVisible ? 'text' : 'password'}
                value={passwordValue}
                onChange={e => setPasswordValue(e.target.value)}
                required
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <Button type="button" variant="ghost" onClick={() => setIsPasswordVisible(v => !v)}>
                {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className={`text-xs font-bold mb-4 ${passwordStrength === 'Strong' ? 'text-green-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
              Strength: {passwordStrength}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            <p className="text-xs text-muted-foreground">Category is automatically suggested based on the platform.</p>
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
