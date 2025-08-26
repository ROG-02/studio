'use client';

import { useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { GoogleBackupCode, StoredGoogleCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2, PlusCircle, Pencil, Copy, MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { generatePassword } from '@/lib/utils'; // Adjust the import based on your project structure


export default function GoogleCodesSection() {
  const [codes, setCodes] = useLocalStorage<StoredGoogleCode[]>('citadel-google-codes', []);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [totpSecret, setTotpSecret] = useState('');

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const importedCodes = content.split(/\s+/).filter(c => c.length > 0 && /^\d+$/.test(c));
        
        if (importedCodes.length > 0) {
          const newStoredCodes: StoredGoogleCode = {
            id: crypto.randomUUID(),
            platform: `Imported ${file.name}`,
            email: "N/A",
            codes: importedCodes,
          };
          setCodes(prev => [...prev, newStoredCodes]);
          toast({ title: `${importedCodes.length} codes imported successfully!` });
        } else {
          toast({ title: 'No valid codes found in the file.', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleExport = (format: 'txt' | 'json', codesToExport: GoogleBackupCode[]) => {
    if (codesToExport.length === 0) {
        toast({ title: 'No codes to export.', variant: 'destructive' });
        return;
    }
    const content = format === 'json' ? JSON.stringify(codesToExport, null, 2) : codesToExport.join('\n');
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-backup-codes.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: `Codes exported as .${format}` });
  };

  const clearAllCodes = () => {
    setCodes([]);
    toast({ title: 'All codes have been deleted.', variant: 'destructive' });
  };
  
  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const platform = formData.get('platform') as string;
    const email = formData.get('email') as string;
    const codesRaw = formData.get('codes') as string;
    const parsedCodes = codesRaw.split(/[\s,]+/).filter(c => c.length > 0 && /^\d+$/.test(c));

    if (!platform || !email || parsedCodes.length === 0) {
        toast({ title: "Validation Error", description: "Please fill all fields and provide valid codes.", variant: "destructive"});
        return;
    }

    const newCodeSet: StoredGoogleCode = {
        id: crypto.randomUUID(),
        platform,
        email,
        codes: parsedCodes,
    }
    setCodes(prev => [...prev, newCodeSet]);
    toast({ title: "Backup codes saved successfully!"});
    (e.target as HTMLFormElement).reset();
  };

  const handleDeleteSet = (id: string) => {
    setCodes(codes.filter((set) => set.id !== id));
    toast({ title: 'Code set deleted.', variant: 'destructive' });
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!', description: 'Content will be cleared in 30 seconds.' });
     setTimeout(() => {
        navigator.clipboard.writeText(' ');
    }, 30000);
  }

  return (
    <Card className="animate-slide-in-from-right">
      <CardHeader>
        <CardTitle>Google Backup Codes & MFA</CardTitle>
        <CardDescription>Manage your backup codes and set up multi-factor authentication (MFA).</CardDescription>
        <div className="mt-4">
          <Label htmlFor="totp-secret">TOTP Secret (for MFA)</Label>
          <Input id="totp-secret" type="text" value={totpSecret} onChange={e => setTotpSecret(e.target.value)} placeholder="Enter or generate TOTP secret" />
          <Button type="button" variant="outline" onClick={() => setTotpSecret(generatePassword(20))} className="mt-2">Generate Secret</Button>
          <div className="text-xs mt-2">Use this secret in your authenticator app (e.g., Google Authenticator).</div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="store">
            <TabsList>
                <TabsTrigger value="store">Store/Import Codes</TabsTrigger>
                <TabsTrigger value="view">View Codes</TabsTrigger>
            </TabsList>
            <TabsContent value="store" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Store Manually</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform</Label>
                                    <Input id="platform" name="platform" placeholder="e.g., Google, Github" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Associated Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="user@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="codes">Backup Codes</Label>
                                    <Input id="codes" name="codes" placeholder="Paste codes here, separated by space or comma" required />
                                </div>
                                <Button type="submit"><PlusCircle/> Store Backup Code</Button>
                            </form>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Import from File</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Import a plain .txt file containing a list of backup codes. Each code should be on a new line or separated by a space.
                            </p>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileImport}
                              accept=".txt"
                              className="hidden"
                            />
                            <Button onClick={triggerFileImport}>
                              <Upload className="mr-2 h-4 w-4" /> Import .txt
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="view" className="mt-4">
               {codes.length > 0 ? (
                  <div className="space-y-6">
                    {codes.map(set => (
                        <Card key={set.id}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-xl">{set.platform}</CardTitle>
                                        <CardDescription>{set.email}</CardDescription>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleExport('txt', set.codes)}>
                                          <Download className="mr-2 h-4 w-4" /> Export .txt
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('json', set.codes)}>
                                          <Download className="mr-2 h-4 w-4" /> Export .json
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will delete the code set for {set.platform}. This action cannot be undone.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteSet(set.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                  {set.codes.map((code, index) => (
                                    <div key={index} className="bg-muted p-3 rounded-lg flex items-center justify-between group">
                                      <span className="font-mono text-lg tracking-widest">{code}</span>
                                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(code)}>
                                        <Copy className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <div className="mt-6 flex justify-end">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Clear All Codes
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete all your stored Google backup codes.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={clearAllCodes}>Yes, delete all</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <p>No Google backup codes found.</p>
                    <p>Go to the "Store/Import Codes" tab to add your first set.</p>
                  </div>
                )}
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
