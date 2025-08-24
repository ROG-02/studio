'use client';

import { useState, useRef } from 'react';
import type { Password } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, EyeOff, Trash2, Pencil, Copy, Search, RefreshCw, Upload, Download, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

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
  const [selectedPasswords, setSelectedPasswords] = useState<string[]>([]);
  const { toast } = useToast();
  const importFileInputRef = useRef<HTMLInputElement>(null);


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
  
  const handleDelete = (ids: string[]) => {
    setPasswords(passwords.filter((p) => !ids.includes(p.id)));
    setSelectedPasswords([]);
    toast({ title: `${ids.length} password(s) deleted.`, variant: 'destructive' });
  };

  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleEditPasswordVisibility = () => {
    setIsEditPasswordVisible((prev) => !prev);
  }
  
  const copyToClipboard = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: 'Content will be cleared in 30 seconds.' });
    setTimeout(() => {
        navigator.clipboard.writeText(' ');
    }, 30000);
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPasswords(filteredPasswords.map(p => p.id));
    } else {
      setSelectedPasswords([]);
    }
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPasswords(prev => [...prev, id]);
    } else {
      setSelectedPasswords(prev => prev.filter(pid => pid !== id));
    }
  }

  const handleEditSelected = () => {
    if (selectedPasswords.length !== 1) {
      toast({ title: 'Please select exactly one password to edit.', variant: 'destructive'});
      return;
    }
    const passwordToEdit = passwords.find(p => p.id === selectedPasswords[0]);
    if (passwordToEdit) {
      openDialog(passwordToEdit);
    }
  }

  const handleRefresh = () => {
    setSearchTerm('');
    setPlatformFilter('');
    setTagFilter('');
    setSelectedPasswords([]);
    toast({ title: 'Filters cleared and list refreshed.'});
  }

  const handleExport = () => {
    if(passwords.length === 0) {
      toast({ title: 'No passwords to export.', variant: 'destructive'});
      return;
    }
    const dataStr = JSON.stringify(passwords, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'passwords-export.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: 'All passwords exported successfully.' });
  }

  const handleImportClick = () => {
    importFileInputRef.current?.click();
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = JSON.parse(content) as Password[];
          // Basic validation
          if (Array.isArray(imported) && imported.every(p => p.id && p.name && p.value && p.email)) {
             const uniqueImported = imported.filter(ip => !passwords.some(pp => pp.id === ip.id));
             setPasswords(prev => [...prev, ...uniqueImported]);
            toast({ title: `${uniqueImported.length} new passwords imported successfully.` });
          } else {
            throw new Error('Invalid file format.');
          }
        } catch (error) {
          toast({ title: 'Import failed.', description: 'The file is not a valid password JSON export.', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
    if (importFileInputRef.current) {
        importFileInputRef.current.value = "";
    }
  }


  return (
    <div className="animate-slide-in-from-right">
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
          
          <div className="flex items-center gap-2 mb-4 flex-wrap">
             <Button variant="outline" onClick={handleEditSelected} disabled={selectedPasswords.length !== 1}>
                <Edit/> Edit Selected
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={selectedPasswords.length === 0}>
                        <Trash/> Delete Selected
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently delete {selectedPasswords.length} selected password(s). This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(selectedPasswords)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={handleExport}><Download/> Export All (JSON)</Button>
            
            <input type="file" ref={importFileInputRef} onChange={handleImport} accept=".json" className="hidden" />
            <Button variant="outline" onClick={handleImportClick}><Upload/> Import (JSON)</Button>

            <Button variant="outline" onClick={handleRefresh}><RefreshCw/> Refresh</Button>
          </div>

          {filteredPasswords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                        checked={selectedPasswords.length === filteredPasswords.length && filteredPasswords.length > 0}
                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Email/Username</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPasswords.map((p) => (
                  <TableRow 
                    key={p.id} 
                    data-state={selectedPasswords.includes(p.id) && "selected"}
                    onDoubleClick={() => openDialog(p)}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                            checked={selectedPasswords.includes(p.id)}
                            onCheckedChange={(checked) => handleSelectRow(p.id, checked as boolean)}
                            aria-label="Select row"
                        />
                    </TableCell>
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
                        <Button variant="ghost" size="icon" onClick={(e) => toggleVisibility(p.id, e)} aria-label={visiblePasswords[p.id] ? "Hide password" : "Show password"}>
                          {visiblePasswords[p.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                         <Button variant="ghost" size="icon" onClick={(e) => copyToClipboard(p.value, e)} aria-label="Copy password">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
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
                                <AlertDialogAction onClick={() => handleDelete([p.id])} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
            <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
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
    </div>
  );
}
