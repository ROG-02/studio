'use client';

import { useRef, useState, useTransition } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { AppData, Password, ApiKey, GoogleBackupCode } from '@/lib/types';
import { analyzeBackupReasoning } from '@/ai/flows/analyze-backup-reasoning';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, ShieldCheck, FileWarning, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export default function BackupSection() {
  const [passwords, setPasswords] = useLocalStorage<Password[]>('citadel-passwords', []);
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKey[]>('citadel-api-keys', []);
  const [googleCodes, setGoogleCodes] = useLocalStorage<GoogleBackupCode[]>('citadel-google-codes', []);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnalyzing, startAnalyzing] = useTransition();
  const [analysisResult, setAnalysisResult] = useState<{ manualDecryptionRequired: boolean; reasoning: string } | null>(null);
  const [importedData, setImportedData] = useState<string | null>(null);

  const handleExport = () => {
    const appData: AppData = { passwords, apiKeys, googleCodes };
    const content = JSON.stringify(appData, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `citadel-guard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Full backup exported successfully!' });
  };
  
  const triggerFileImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportedData(content);
        startAnalyzing(async () => {
          try {
            const result = await analyzeBackupReasoning({ backupFileContent: content });
            setAnalysisResult(result);
          } catch (error) {
            console.error(error);
            toast({ title: 'AI analysis failed.', description: 'Proceeding without AI insights.', variant: 'destructive' });
            setAnalysisResult({manualDecryptionRequired: false, reasoning: 'AI analysis failed. Please manually verify the file content.'});
          }
        });
      };
      reader.readAsText(file);
    }
     // Reset file input
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const proceedWithImport = () => {
    if (!importedData) return;
    try {
      const dataToImport = JSON.parse(importedData) as AppData;
      // Basic validation
      if (Array.isArray(dataToImport.passwords) && Array.isArray(dataToImport.apiKeys) && Array.isArray(dataToImport.googleBackupCodes)) {
        setPasswords(dataToImport.passwords);
        setApiKeys(dataToImport.apiKeys);
        setGoogleCodes(dataToImport.googleBackupCodes);
        toast({ title: 'Data restored successfully!' });
      } else {
        throw new Error('Invalid backup file format.');
      }
    } catch (error) {
      toast({ title: 'Import failed.', description: 'The selected file is not a valid backup file.', variant: 'destructive' });
    } finally {
        setAnalysisResult(null);
        setImportedData(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Backup & Restore</CardTitle>
          <CardDescription>Export all your data into a single file or restore from a backup.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                            For enhanced security, you can manually encrypt the backup file using an external tool like GPG or VeraCrypt after exporting. Citadel Guard will remind you that manual decryption might be needed upon import.
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
                    <Button variant="outline" onClick={triggerFileImport} disabled={isAnalyzing}>
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" /> Import from Backup
                        </>
                      )}
                    </Button>
                </CardContent>
            </Card>
        </CardContent>
      </Card>

      <Dialog open={!!analysisResult} onOpenChange={(open) => !open && setAnalysisResult(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    {analysisResult?.manualDecryptionRequired ? <FileWarning className="text-destructive"/> : <ShieldCheck className="text-primary"/>}
                    AI Backup Analysis
                </DialogTitle>
                <DialogDescription>
                    Our AI has analyzed your backup file. Here's what it found:
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p className="text-sm font-semibold">
                    Manual Decryption Required: 
                    <span className={analysisResult?.manualDecryptionRequired ? "text-destructive" : "text-primary"}>
                        {analysisResult?.manualDecryptionRequired ? ' Yes' : ' No'}
                    </span>
                </p>
                <div>
                    <Label htmlFor="reasoning">Reasoning:</Label>
                    <Textarea id="reasoning" readOnly value={analysisResult?.reasoning} className="mt-1 h-32 bg-muted/50" />
                </div>
                <p className="text-xs text-muted-foreground">
                    Note: This analysis is suggestive. Always ensure you handle encrypted files correctly.
                </p>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button type="button">Proceed with Import</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Overwrite all existing data?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. Importing a backup will replace all passwords, API keys, and codes currently stored in the application.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={proceedWithImport}>Yes, Overwrite Data</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
