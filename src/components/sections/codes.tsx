'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { StoredGoogleCode } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Upload, Eye } from 'lucide-react';
import { SecureClipboard } from '@/lib/crypto';

export default function CodesSection() {
  const [googleCodes, setGoogleCodes] = useLocalStorage<StoredGoogleCode[]>('citadel-google-codes', []);
    // Filter out duplicate ids
    const uniqueGoogleCodes = googleCodes.filter((item, idx, arr) => arr.findIndex(c => c.id === item.id) === idx);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [usedCodes, setUsedCodes] = useState<{ [email: string]: Set<string> }>({});
  const { toast } = useToast();

  // Get codes for selected email
  const codesForSelectedEmail = selectedEmail
    ? googleCodes.filter(code => code.email === selectedEmail)
    : [];

  // Handle copying a code
  const handleCopyCode = async (email: string, code: string) => {
    try {
      await SecureClipboard.copy(code, 30000);
      // Mark code as used by adding to usedCodes, without modifying the code value itself
      setUsedCodes(prev => {
        const updated = { ...prev };
        if (!updated[email]) updated[email] = new Set();
        updated[email].add(code);
        return updated;
      });
      toast({ title: 'Code copied!', description: 'This backup code has been used.' });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({ 
        title: 'Copy failed', 
        description: 'Unable to copy backup code. Please try again or ensure the page is focused.', 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Card className="animate-slide-in-from-right">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          CODES
        </CardTitle>
        <CardDescription>
          Manage and store your backup codes from various platforms (Google, GitHub, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Import Backup Codes Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Backup Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = (form.email as HTMLInputElement).value.trim();
                  const platform = (form.platform as HTMLInputElement).value.trim();
                  const file = (form.codes as HTMLInputElement).files?.[0];
                  
                  if (!email || !platform || !file) {
                    toast({ title: 'Missing fields', description: 'Please provide email, platform, and select a .txt file.', variant: 'destructive' });
                    return;
                  }
                  
                  try {
                    const text = await file.text();
                    
                    // Parse Google backup codes format
                    const lines = text.split(/\r?\n/);
                    const codes: string[] = [];
                    
                    for (const line of lines) {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) continue;
                      
                      // Handle Google backup codes format - extract all 4-digit pairs
                      // This will match patterns like "1. 1213 2333" or "1213 2333" anywhere in the line
                      const codeMatches = trimmedLine.match(/\d{4}\s+\d{4}/g);
                      if (codeMatches) {
                        for (const match of codeMatches) {
                          // Normalize spacing to single space
                          const normalizedCode = match.replace(/\s+/, ' ');
                          codes.push(normalizedCode);
                        }
                      }
                    }
                    
                    // Remove duplicates if any
                    const uniqueCodes = [...new Set(codes)];
                    
                    if (uniqueCodes.length === 0) {
                      toast({ 
                        title: 'No valid codes found', 
                        description: 'The file does not contain any valid backup codes. Please check the file format.', 
                        variant: 'destructive' 
                      });
                      return;
                    }
                    
                    // Store codes under the correct email/platform combination
                    setGoogleCodes(prev => {
                      // Remove any existing entry for this email/platform combination
                      const filtered = prev.filter(c => !(c.email === email && c.platform === platform));
                      return [
                        ...filtered,
                        { id: `${email}-${platform}-${Date.now()}`, email, platform, codes: uniqueCodes }
                      ];
                    });
                    
                    toast({ 
                      title: 'Backup codes imported successfully!', 
                      description: `Imported ${uniqueCodes.length} valid codes for ${email} (${platform}).` 
                    });
                    form.reset();
                    
                  } catch (error) {
                    console.error('Import error:', error);
                    toast({ 
                      title: 'Import failed', 
                      description: 'Failed to read or parse the backup codes file.', 
                      variant: 'destructive' 
                    });
                  }
                }}
              >
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Email Address:</label>
                  <input 
                    name="email" 
                    type="email" 
                    className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="example@gmail.com"
                    required 
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Platform:</label>
                  <input 
                    name="platform" 
                    type="text" 
                    className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    placeholder="Google, GitHub, etc."
                    required 
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Import from .txt file:</label>
                  <input 
                    name="codes" 
                    type="file" 
                    accept=".txt" 
                    className="border rounded-md px-3 py-2 w-full file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                    required 
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Upload a .txt file with backup codes (supports Google backup codes format).
                    Expected format: Lines containing 4-digit codes like "1213 2333" or numbered like "1. 1213 2333"
                  </div>
                </div>
                <Button type="submit" variant="default" className="w-full">
                  Import Backup Codes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* View Backup Codes Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Stored Codes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedEmail ? (
                <div>
                  <label className="block mb-2 font-medium">Stored backup codes:</label>
                  <div className="space-y-2">
                    {googleCodes.length === 0 && (
                      <div className="text-muted-foreground">No backup codes found.</div>
                    )}
          {uniqueGoogleCodes.map(({ id, email, platform, codes }) => (
                      <div 
            key={`${id}-${email}-${platform}`}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center"
                      >
                        <div onDoubleClick={() => setSelectedEmail(email)} className="flex-1">
                          <div className="font-medium">{email}</div>
                          <div className="text-sm text-muted-foreground">Platform: {platform}</div>
                          <div className="text-xs text-muted-foreground">{codes.length} codes available</div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => {
                          setGoogleCodes(prev => prev.filter(c => c.id !== id));
                          if (selectedEmail === email) setSelectedEmail(null);
                        }}>
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                  {googleCodes.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Double-click an entry to view backup codes
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button variant="ghost" size="sm" className="mb-2" onClick={() => setSelectedEmail(null)}>
                    ← Back to list
                  </Button>
                  <label className="block mb-2 font-medium">Backup Codes for {selectedEmail}:</label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {codesForSelectedEmail.length === 0 && (
                      <div className="text-muted-foreground">No codes found for this email.</div>
                    )}
                    {codesForSelectedEmail.flatMap(({ codes, platform }) =>
                      codes.map((code, index) => {
                        const isUsed = usedCodes[selectedEmail]?.has(code);
                        // Use code value and index for unique key
                        return (
                          <div
                            key={`${selectedEmail}-${platform}-${code}-${index}`}
                            className={`flex items-center justify-between p-3 mb-2 rounded-lg shadow-sm transition-colors ${isUsed ? 'opacity-60 bg-gradient-to-r from-gray-700 to-gray-900 border border-gray-700' : 'bg-gradient-to-r from-purple-600 to-blue-600 border border-purple-700'}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base text-white font-bold">{index + 1}.</span>
                              <span className={`font-mono px-3 py-2 rounded border text-lg font-semibold ${isUsed ? 'bg-gray-900 text-gray-400 border-gray-700' : 'bg-white text-purple-700 border-purple-400'}`}>{code}</span>
                            </div>
                            {!isUsed ? (
                              <Button size="sm" variant="secondary" className="bg-blue-700 text-white hover:bg-blue-800" onClick={() => handleCopyCode(selectedEmail, code)}>
                                Copy
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400 font-semibold">USED</span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        
      </CardContent>
    </Card>
  );
}
