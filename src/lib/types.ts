export interface Password {
  id: string;
  name: string;
  username?: string;
  email: string;
  value: string;
  category?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  value: string;
}

export type GoogleBackupCode = string;

export interface AppData {
  passwords: Password[];
  apiKeys: ApiKey[];
  googleCodes: GoogleBackupCode[];
}
