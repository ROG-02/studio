'use client';

import { useState } from 'react';
import type { Password } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, PlusCircle } from 'lucide-react';

interface AddPasswordSectionProps {
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
  const { toast } = useToast();

  const handlePlatformChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const platformName = e.target.value;
    const suggestedCategory = getCategoryForPlatform(platformName);
    setCategory(suggestedCategory);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword: Password = {
      id: crypto.randomUUID(),
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      value: formData.get('value') as string,
      category: formData.get('category') as string,
    };

    setPasswords((prev) => [...prev, newPassword]);
    toast({ title: 'Password added successfully!' });
    e.currentTarget.reset();
    setCategory('');
    setActiveView('passwords');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add a New Password</CardTitle>
        <CardDescription>Fill in the details below to save a new password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Platform</Label>
            <Input id="name" name="name" placeholder="e.g. Google, Facebook" required onChange={handlePlatformChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username (Optional)</Label>
            <Input id="username" name="username" placeholder="e.g. your_username" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="e.g. user@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Password</Label>
            <div className="relative">
                <Input id="value" name="value" type={isPasswordVisible ? 'text' : 'password'} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={togglePasswordVisibility}>
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
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
