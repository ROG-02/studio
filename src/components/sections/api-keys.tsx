'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { ApiKey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, MoreHorizontal, Eye, EyeOff, Trash2, Pencil, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ApiKeysSection() {
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKey[]>('citadel-api-keys', []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentApiKey, setCurrentApiKey] = useState<ApiKey | null>(null);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newApiKey: ApiKey = {
      id: currentApiKey?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      value: formData.get('value') as string,
    };

    if (currentApiKey) {
      setApiKeys(apiKeys.map((k) => (k.id === currentApiKey.id ? newApiKey : k)));
      toast({ title: 'API Key updated successfully!' });
    } else {
      setApiKeys([...apiKeys, newApiKey]);
      toast({ title: 'API Key added successfully!' });
    }
    setIsDialogOpen(false);
    setCurrentApiKey(null);
  };
  
  const handleDelete = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
    toast({ title: 'API Key deleted.', variant: 'destructive' });
  };

  const toggleVisibility = (id: string) => {
    setVisibleApiKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: 'Content will be cleared in 30 seconds.'});
    setTimeout(() => {
        navigator.clipboard.writeText(' ');
    }, 30000);
  }

  const openDialog = (apiKey: ApiKey | null) => {
    setCurrentApiKey(apiKey);
    setIsDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-in-from-right">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
             <CardTitle>AI Credentials</CardTitle>
             <CardDescription>Securely store and manage your AI provider API keys.</CardDescription>
          </CardHeader>
          <CardContent>
            {apiKeys.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((k) => (
                    <TableRow key={k.id} onDoubleClick={() => openDialog(k)} className="cursor-pointer">
                      <TableCell className="font-medium">{k.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {visibleApiKeys[k.id] ? k.value : '••••••••••••••••••••••••'}
                          </span>
                          <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); toggleVisibility(k.id)}} aria-label={visibleApiKeys[k.id] ? "Hide API Key" : "Show API Key"}>
                            {visibleApiKeys[k.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={(e) => {e.stopPropagation(); copyToClipboard(k.value)}} aria-label="Copy API Key">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openDialog(k)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete this API key.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(k.id)}>Delete</AlertDialogAction>
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
                <p>No API keys saved yet.</p>
                <p>Use the form to add a new one.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{currentApiKey ? 'Edit API Key' : 'Add New API Key'}</CardTitle>
          </CardHeader>
          <CardContent>
             <form onSubmit={handleSave}>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service</Label>
                    <Input id="name" name="name" placeholder="e.g. OpenAI" defaultValue={currentApiKey?.name} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">API Key</Label>
                    <Input id="value" name="value" type="password" defaultValue={currentApiKey?.value} required />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                    <Button type="submit">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {currentApiKey ? 'Save Changes' : 'Add Key'}
                    </Button>
                </div>
              </form>
          </CardContent>
        </Card>
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{currentApiKey ? 'Edit API Key' : 'Add New API Key'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Service</Label>
                    <Input id="edit-name" name="name" defaultValue={currentApiKey?.name} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-value" className="text-right">API Key</Label>
                    <Input id="edit-value" name="value" type="password" defaultValue={currentApiKey?.value} className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

    </div>
  );
}
