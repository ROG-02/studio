'use client';

import { useRef } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { GoogleBackupCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function GoogleCodesSection() {
  const [codes, setCodes] = useLocalStorage<GoogleBackupCode[]>('citadel-google-codes', []);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newCodes = content.split(/\s+/).filter(c => c.length > 0 && /^\d+$/.test(c));
        if (newCodes.length > 0) {
          setCodes(newCodes);
          toast({ title: `${newCodes.length} codes imported successfully!` });
        } else {
          toast({ title: 'No valid codes found in the file.', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };
  
  const handleExport = (format: 'txt' | 'json') => {
    if (codes.length === 0) {
        toast({ title: 'No codes to export.', variant: 'destructive' });
        return;
    }

    const content = format === 'json' ? JSON.stringify(codes, null, 2) : codes.join('\n');
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

  const clearCodes = () => {
    setCodes([]);
    toast({ title: 'All codes have been deleted.', variant: 'destructive' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Google Backup Codes</CardTitle>
            <CardDescription>Import, view, and export your Google backup codes.</CardDescription>
          </div>
          <div className="flex gap-2">
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
            <Button variant="outline" onClick={() => handleExport('txt')}>
                <Download className="mr-2 h-4 w-4" /> Export .txt
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
                <Download className="mr-2 h-4 w-4" /> Export .json
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {codes.length > 0 ? (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {codes.map((code, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg flex items-center justify-center">
                  <span className="font-mono text-lg tracking-widest">{code}</span>
                </div>
              ))}
            </div>
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
                            <AlertDialogAction onClick={clearCodes}>Yes, delete all</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
            <p>No Google backup codes found.</p>
            <p>Click "Import .txt" to add your codes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
