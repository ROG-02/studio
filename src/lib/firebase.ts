/**
 * Firebase Configuration and Authentication
 * Handles email authentication and user management
 */

import { initializeApp } from 'firebase/app'
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  AuthError,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth'

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_wf0Yew8slRJkoIvnH_tmzRZkdnbQXeQ",
  authDomain: "citadel-guard-nya4s.firebaseapp.com",
  projectId: "citadel-guard-nya4s",
  storageBucket: "citadel-guard-nya4s.firebasestorage.app",
  messagingSenderId: "397789642202",
  appId: "1:397789642202:web:99397c09799affb44f14e3"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Legacy functions for backward compatibility
export async function signUpWithEmail(email: string, password: string): Promise<UserCredential> {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email: string, password: string): Promise<UserCredential> {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutUser(): Promise<void> {
  return await signOut(auth);
}

// Types for authentication
export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export interface UserSession {
  uid: string
  email: string
  emailVerified: boolean
  displayName?: string
  createdAt: string
  lastLoginAt: string
}

/**
 * Firebase Authentication Service
 */
export class FirebaseAuthService {
  private static instance: FirebaseAuthService
  private currentUser: User | null = null
  private authStateListeners: ((user: User | null) => void)[] = []

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService()
    }
    return FirebaseAuthService.instance
  }

  constructor() {
    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user
      this.notifyAuthStateListeners(user)
    })
  }

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile if display name provided
      if (displayName) {
        await updateProfile(user, { displayName })
      }

      return {
        success: true,
        user: user
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error as AuthError)
      }
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error as AuthError)
      }
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error as AuthError)
      }
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: this.handleAuthError(error as AuthError)
      }
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser
  }

  /**
   * Get user session information
   */
  getUserSession(): UserSession | null {
    if (!this.currentUser) return null

    return {
      uid: this.currentUser.uid,
      email: this.currentUser.email!,
      emailVerified: this.currentUser.emailVerified,
      displayName: this.currentUser.displayName || undefined,
      createdAt: this.currentUser.metadata.creationTime!,
      lastLoginAt: this.currentUser.metadata.lastSignInTime!
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  /**
   * Wait for authentication state to be determined
   */
  waitForAuthState(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }

  /**
   * Add authentication state listener
   */
  addAuthStateListener(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback)
      if (index > -1) {
        this.authStateListeners.splice(index, 1)
      }
    }
  }

  /**
   * Notify all auth state listeners
   */
  private notifyAuthStateListeners(user: User | null): void {
    this.authStateListeners.forEach(listener => listener(user))
  }

  /**
   * Handle Firebase authentication errors
   */
  private handleAuthError(error: AuthError): string {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection'
      case 'auth/user-disabled':
        return 'This account has been disabled'
      case 'auth/invalid-credential':
        return 'Invalid credentials provided'
      default:
        console.error('Firebase Auth Error:', error)
        return 'Authentication failed. Please try again'
    }
  }
}

// Export singleton instance
export const firebaseAuth = FirebaseAuthService.getInstance()
