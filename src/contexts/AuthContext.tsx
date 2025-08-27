'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User } from 'firebase/auth'
import { firebaseAuth, AuthResult } from '@/lib/firebase'
import { masterPasswordService, MasterPasswordSetupResult, MasterPasswordStatus } from '@/services/MasterPasswordService'
import { SecurityEnforcer } from '@/lib/security'
import { useRouter } from 'next/navigation'

// Auth context types
interface AuthContextType {
  // Firebase Authentication
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  
  // Firebase Auth Methods
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  
  // Master Password Management
  masterPasswordStatus: MasterPasswordStatus
  isVaultUnlocked: boolean
  setupMasterPassword: (password: string) => Promise<boolean>
  unlockVault: (password: string) => Promise<boolean>
  lockVault: () => void
  
  // Utility methods
  clearError: () => void
  refreshSession: () => Promise<void>
  
  // Development only
  dangerousResetMasterPassword?: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Core authentication state
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Master password state
  const [masterPasswordStatus, setMasterPasswordStatus] = useState<MasterPasswordStatus>({
    isSet: false,
    userEmail: null
  })
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false)
  
  // Security enforcer
  const securityEnforcer = useRef<SecurityEnforcer>()
  const router = useRouter()

  // Mount detection
  useEffect(() => {
    setMounted(true)
  }, [])

  // Main authentication effect
  useEffect(() => {
    if (!mounted) return

    // Initialize security enforcer
    securityEnforcer.current = SecurityEnforcer.getInstance()
    securityEnforcer.current.initialize()

    // Listen for authentication state changes
    const unsubscribe = firebaseAuth.addAuthStateListener((user) => {
      console.log('Auth state changed:', user?.email || 'no user')
      
      setUser(user)
      setIsAuthenticated(!!user)
      setLoading(false)
      
      if (user) {
        // User is authenticated, update master password status
        updateMasterPasswordStatus()
      } else {
        // User is not authenticated, clear all state and redirect to login
        clearAllState()
        redirectToLogin()
      }
    })

    // Listen for vault lock events
    const handleVaultLocked = () => {
      console.log('Vault locked event received')
      setIsVaultUnlocked(false)
    }
    
    // Listen for beforeunload to logout on tab close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      console.log('Tab closing, logging out user')
      // Force logout without waiting for async operations
      masterPasswordService.lockVault()
      firebaseAuth.signOut()
    }
    
    // Listen for visibility change to auto-lock after period of inactivity
    const handleVisibilityChange = () => {
      if (document.hidden && isVaultUnlocked) {
        console.log('Tab hidden, auto-locking vault')
        lockVault()
      }
    }
    
    window.addEventListener('vault-locked', handleVaultLocked)
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      unsubscribe()
      window.removeEventListener('vault-locked', handleVaultLocked)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [mounted, isVaultUnlocked])

  // Auto-logout on app start if no valid session
  useEffect(() => {
    if (mounted) {
      // Check if we have a valid Firebase auth state
      const currentUser = firebaseAuth.getCurrentUser()
      if (!currentUser) {
        console.log('No valid session found, forcing logout')
        clearAllState()
        redirectToLogin()
      }
    }
  }, [mounted])

  // Clear all authentication and vault state
  const clearAllState = () => {
    setUser(null)
    setIsAuthenticated(false)
    setMasterPasswordStatus({
      isSet: false,
      userEmail: null
    })
    setIsVaultUnlocked(false)
    setError(null)
    masterPasswordService.lockVault()
  }

  // Redirect to login page
  const redirectToLogin = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      console.log('Redirecting to login page')
      router.push('/login')
    }
  }

  // Update master password status
  const updateMasterPasswordStatus = () => {
    try {
      const status = masterPasswordService.getMasterPasswordStatus()
      console.log('Master password status updated:', status)
      setMasterPasswordStatus(status)
      
      const isUnlocked = masterPasswordService.isVaultUnlocked()
      console.log('Vault unlock status:', isUnlocked)
      setIsVaultUnlocked(isUnlocked)
    } catch (error) {
      console.error('Error updating master password status:', error)
    }
  }

  // Firebase Authentication Methods
  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting to sign in:', email)
      
      const result: AuthResult = await firebaseAuth.signIn(email, password)
      
      if (result.success) {
        console.log('Sign in successful')
        // Authentication state listener will handle the rest
        return true
      } else {
        setError(result.error || 'Sign in failed')
        return false
      }
    } catch (error) {
      console.error('Sign in error:', error)
      setError('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, displayName?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Attempting to sign up:', email)
      
      const result: AuthResult = await firebaseAuth.signUp(email, password, displayName)
      
      if (result.success) {
        console.log('Sign up successful')
        // New user will need to setup master password
        return true
      } else {
        setError(result.error || 'Sign up failed')
        return false
      }
    } catch (error) {
      console.error('Sign up error:', error)
      setError('An unexpected error occurred')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('Logging out user')
      
      // Lock vault before logout
      masterPasswordService.lockVault()
      
      const result: AuthResult = await firebaseAuth.signOut()
      
      if (!result.success) {
        setError(result.error || 'Logout failed')
      } else {
        // Clear all state and redirect
        clearAllState()
        redirectToLogin()
      }
    } catch (error) {
      console.error('Logout error:', error)
      setError('An unexpected error occurred during logout')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null)
      
      const result: AuthResult = await firebaseAuth.resetPassword(email)
      
      if (result.success) {
        return true
      } else {
        setError(result.error || 'Password reset failed')
        return false
      }
    } catch (error) {
      setError('An unexpected error occurred')
      return false
    }
  }

  // Master Password Methods
  const setupMasterPassword = async (password: string): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Setting up master password')
      
      const result: MasterPasswordSetupResult = await masterPasswordService.setupMasterPassword(password)
      
      if (result.success) {
        console.log('Master password setup successful')
        updateMasterPasswordStatus()
        return true
      } else {
        setError(result.error || 'Master password setup failed')
        return false
      }
    } catch (error) {
      console.error('Master password setup error:', error)
      setError('An unexpected error occurred')
      return false
    }
  }

  const unlockVault = async (password: string): Promise<boolean> => {
    try {
      setError(null)
      
      console.log('Attempting to unlock vault')
      
      const result: MasterPasswordSetupResult = await masterPasswordService.unlockVault(password)
      
      if (result.success) {
        console.log('Vault unlocked successfully')
        setIsVaultUnlocked(true)
        updateMasterPasswordStatus()
        return true
      } else if (result.requiresSetup) {
        console.log('Master password setup required')
        // Explicitly set the master password status to not set
        setMasterPasswordStatus({
          isSet: false,
          userEmail: user?.email || null
        })
        updateMasterPasswordStatus()
        setError('Master password must be set up first')
        return false
      } else {
        setError(result.error || 'Failed to unlock vault')
        return false
      }
    } catch (error) {
      console.error('Unlock vault error:', error)
      setError('An unexpected error occurred')
      return false
    }
  }

  const lockVault = (): void => {
    console.log('Locking vault')
    masterPasswordService.lockVault()
    setIsVaultUnlocked(false)
  }

  // Utility methods
  const clearError = (): void => {
    setError(null)
  }

  const refreshSession = async (): Promise<void> => {
    try {
      const user = firebaseAuth.getCurrentUser()
      if (user) {
        await user.getIdToken(true) // Force refresh
      }
    } catch (error) {
      console.error('Failed to refresh session:', error)
    }
  }

  // Development only method for testing
  const dangerousResetMasterPassword = (): boolean => {
    if (process.env.NODE_ENV === 'development') {
      const success = masterPasswordService.dangerousResetMasterPassword()
      if (success) {
        updateMasterPasswordStatus()
      }
      return success
    }
    return false
  }

  const value: AuthContextType = {
    // Firebase Authentication
    user,
    loading,
    error,
    isAuthenticated,
    
    // Firebase Auth Methods
    signIn,
    signUp,
    logout,
    resetPassword,
    
    // Master Password Management
    masterPasswordStatus,
    isVaultUnlocked,
    setupMasterPassword,
    unlockVault,
    lockVault,
    
    // Utility methods
    clearError,
    refreshSession,
    
    // Development only
    ...(process.env.NODE_ENV === 'development' && { dangerousResetMasterPassword })
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Safe hook that returns null during SSR
export function useAuthSafe() {
  try {
    const context = useContext(AuthContext)
    return context || null
  } catch {
    return null
  }
}

// Security utilities for forms
export const AuthSecurity = {
  getSecureInputProps: () => ({
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'off',
    spellCheck: false,
    'data-form-type': 'password'
  }),
  
  enableScreenProtection: (element: HTMLElement) => {
    element.style.setProperty('-webkit-touch-callout', 'none')
    element.style.setProperty('-webkit-user-select', 'none')
    element.style.setProperty('user-select', 'none')
  },
  
  clearFormData: (formRef: React.RefObject<HTMLFormElement>) => {
    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('input[type="password"], input[data-sensitive="true"]')
      inputs.forEach((input) => {
        ;(input as HTMLInputElement).value = ''
      })
    }
  }
}
