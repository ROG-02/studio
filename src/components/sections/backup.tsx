'use client';

import { useRef, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AppData, Password, ApiKey, GoogleBackupCode, StoredGoogleCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, ShieldCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { encryptData, decryptData } from '@/lib/utils';

export default function BackupSection() {
  const [passwords, setPasswords] = useLocalStorage<Password[]>('citadel-passwords', []);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKey[]>('citadel-api-keys', []);
  const [googleCodes, setGoogleCodes] = useLocalStorage<StoredGoogleCode[]>('citadel-google-codes', []);
  const [importedData, setImportedData] = useState<AppData | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleExport = () => {
    const secret = prompt('Enter a passphrase to encrypt your backup:');
    if (!secret) return toast({ title: 'Export cancelled.' });
    const appData: AppData = { passwords, apiKeys, googleCodes };
    const encrypted = encryptData(JSON.stringify(appData), secret);
    const blob = new Blob([encrypted], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citadel-guard-backup-${new Date().toISOString().split('T')[0]}.enc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Encrypted backup exported successfully!' });
  };
  
  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const encrypted = e.target?.result as string;
          const secret = prompt('Enter the passphrase to decrypt your backup:');
          if (!secret) throw new Error('No passphrase provided.');
          const decrypted = decryptData(encrypted, secret);
          const data = JSON.parse(decrypted) as AppData;
          // Basic validation
          if (Array.isArray(data.passwords) && Array.isArray(data.apiKeys) && Array.isArray(data.googleCodes)) {
            setImportedData(data);
          } else {
            throw new Error('Invalid backup file format.');
          }
        } catch (error) {
           toast({ title: 'Import failed.', description: 'The selected file is not a valid encrypted backup file.', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
     // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const proceedWithImport = () => {
    if (!importedData) return;
    setPasswords(importedData.passwords);
    setApiKeys(importedData.apiKeys);
    setGoogleCodes(importedData.googleCodes);
    toast({ title: 'Data restored successfully!' });
    setImportedData(null);
  };

  return (
    <>
      <Card className="animate-slide-in-from-right">
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Export all your data into a single file or restore from a backup.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Export Data</CardTitle>
                    <Download className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Create a full backup of all your passwords, API keys, and Google codes. Keep this file safe!
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>
                          <Download className="mr-2 h-4 w-4" /> Export Full Backup
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2"><ShieldCheck/> Manual Encryption (Optional)</AlertDialogTitle>
                          <AlertDialogDescription>
                            For enhanced security, you can manually encrypt the backup file using an external tool like GPG or VeraCrypt after exporting.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleExport}>Export Unencrypted</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium">Import Data</CardTitle>
                     <Upload className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Restore your data from a previously exported backup file. This will overwrite all current data.
                    </p>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                    <Button variant="outline" onClick={triggerFileImport}>
                      <Upload className="mr-2 h-4 w-4" /> Import from Backup
                    </Button>
                </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!importedData} onOpenChange={(open) => !open && setImportedData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Overwrite all existing data?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Importing a backup will replace all passwords, API keys, and codes currently stored in the application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setImportedData(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithImport}>Yes, Overwrite Data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
