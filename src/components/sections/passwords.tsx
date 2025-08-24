'use client';

import { useState } from 'react';
import type { Password } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, EyeOff, Trash2, Pencil, Copy, Search } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface PasswordsSectionProps {
  passwords: Password[];
  setPasswords: React.Dispatch<React.SetStateAction<Password[]>>;
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


export default function PasswordsSection({ passwords, setPasswords }: PasswordsSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState<Password | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [isEditPasswordVisible, setIsEditPasswordVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
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
      id: currentPassword!.id,
      name: formData.get('name') as string,
      username: formData.get('username') as string,
      email: formData.get('email') as string,
      value: formData.get('value') as string,
      category: formData.get('category') as string,
    };

    setPasswords(passwords.map((p) => (p.id === currentPassword!.id ? newPassword : p)));
    toast({ title: 'Password updated successfully!' });
    
    setIsDialogOpen(false);
    setCurrentPassword(null);
    setCategory('');
  };
  
  const handleDelete = (id: string) => {
    setPasswords(passwords.filter((p) => p.id !== id));
    toast({ title: 'Password deleted.', variant: 'destructive' });
  };

  const toggleVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEditPasswordVisibility = () => {
    setIsEditPasswordVisible((prev) => !prev);
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  }

  const openDialog = (password: Password) => {
    setCurrentPassword(password);
    setCategory(password.category || '');
    setIsEditPasswordVisible(false);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentPassword(null);
    setCategory('');
  }

  const filteredPasswords = passwords.filter(p => {
    const searchTermLower = searchTerm.toLowerCase();
    const platformFilterLower = platformFilter.toLowerCase();
    const categoryFilterLower = tagFilter.toLowerCase(); // Using 'tag' filter for category
    return (
        (p.name.toLowerCase().includes(searchTermLower) || 
         (p.username && p.username.toLowerCase().includes(searchTermLower)) || 
         p.email.toLowerCase().includes(searchTermLower)) &&
        p.name.toLowerCase().includes(platformFilterLower) &&
        (p.category && p.category.toLowerCase().includes(categoryFilterLower))
    )
  });

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Password Manager</CardTitle>
              <CardDescription>Securely store, manage, and search your passwords.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Card className='mb-6'>
              <CardHeader>
                  <CardTitle className='text-base'>Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                          <Label htmlFor="search" className="shrink-0">Search:</Label>
                          <div className="relative w-full">
                             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                             <Input id="search" placeholder="Search..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <Label htmlFor="platform" className="shrink-0">Platform:</Label>
                          <Input id="platform" placeholder="Filter by platform..." value={platformFilter} onChange={e => setPlatformFilter(e.target.value)} />
                      </div>
                      <div className="flex items-center gap-2">
                          <Label htmlFor="tags" className="shrink-0">Tags:</Label>
                          <Input id="tags" placeholder="Filter by category..." value={tagFilter} onChange={e => setTagFilter(e.target.value)} />
                      </div>
                  </div>
              </CardContent>
          </Card>

          {filteredPasswords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Platform</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Email/Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPasswords.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                     <TableCell>
                      <Badge variant="secondary">{p.category || 'General'}</Badge>
                    </TableCell>
                    <TableCell>{p.email || p.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {visiblePasswords[p.id] ? p.value : '••••••••••••'}
                        </span>
                        <Button variant="ghost" size="icon" onClick={() => toggleVisibility(p.id)} aria-label={visiblePasswords[p.id] ? "Hide password" : "Show password"}>
                          {visiblePasswords[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => copyToClipboard(p.value)} aria-label="Copy password">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openDialog(p)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete this password.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <p>No passwords found matching your criteria.</p>
              <p>Try adjusting your search or add a new password.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (open) setIsDialogOpen(true);
        else closeDialog();
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Platform</Label>
                <Input id="name" name="name" defaultValue={currentPassword?.name} className="col-span-3" required onChange={handlePlatformChange} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" name="username" defaultValue={currentPassword?.username} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={currentPassword?.email} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">Password</Label>
                <div className="relative col-span-3">
                    <Input id="value" name="value" type={isEditPasswordVisible ? 'text' : 'password'} defaultValue={currentPassword?.value} required />
                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={toggleEditPasswordVisibility}>
                        {isEditPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={closeDialog}>Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
