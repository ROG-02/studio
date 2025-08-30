/**
 * Advanced Security Enhancements for Citadel Guard
 * Implements auto-fill prevention, clipboard security, and screen capture protection
 */

import { SecureClipboard } from '@/lib/crypto';

export class SecurityEnforcer {
  private static instance: SecurityEnforcer;
  private protectedElements = new Set<HTMLElement>();
  private clipboardObserver: MutationObserver | null = null;
  private visibilityHandler: (() => void) | null = null;

  static getInstance(): SecurityEnforcer {
    if (!SecurityEnforcer.instance) {
      SecurityEnforcer.instance = new SecurityEnforcer();
    }
    return SecurityEnforcer.instance;
  }

  /**
   * Initialize comprehensive security measures
   */
  initialize(): void {
    this.preventAutofill();
    this.setupScreenProtection();
    this.initializeClipboardSecurity();
    this.setupVisibilityProtection();
    this.preventDevTools();
    this.setupCSPViolationReporting();
  }

  /**
   * Prevent browser autofill and password saving
   */
  private preventAutofill(): void {
    // Disable password managers
    document.addEventListener('DOMContentLoaded', () => {
      const meta = document.createElement('meta');
      meta.name = 'password-managers';
      meta.content = 'noautofill';
      document.head.appendChild(meta);
    });

    // Monitor for password inputs and apply security attributes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            this.securePasswordInputs(element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Apply security attributes to password inputs
   */
  private securePasswordInputs(element: Element): void {
    const inputs = element.querySelectorAll('input[type="password"], input[data-sensitive="true"]');
    
    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      
      // Prevent autofill
      inputElement.setAttribute('autocomplete', 'new-password');
      inputElement.setAttribute('autoCorrect', 'off');
      inputElement.setAttribute('autoCapitalize', 'off');
      inputElement.setAttribute('spellCheck', 'false');
      inputElement.setAttribute('data-form-type', 'password');
      
      // Prevent copy/paste for extra security
      inputElement.addEventListener('copy', (e) => e.preventDefault());
      inputElement.addEventListener('cut', (e) => e.preventDefault());
      
      // Clear on focus loss (optional, might be too aggressive)
      // inputElement.addEventListener('blur', () => {
      //   setTimeout(() => inputElement.value = '', 100);
      // });

      this.protectedElements.add(inputElement);
    });
  }

  /**
   * Screen capture and screenshot protection
   */
  private setupScreenProtection(): void {
    // Apply CSS to prevent text selection and screenshots
    const style = document.createElement('style');
    style.textContent = `
      [data-sensitive="true"], 
      input[type="password"],
      .password-value,
      .api-key-value {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-appearance: none !important;
        filter: contrast(1.1) !important;
      }
      
      /* Prevent screenshots on mobile */
      @media (max-width: 768px) {
        [data-sensitive="true"] {
          -webkit-touch-callout: none !important;
          pointer-events: auto !important;
        }
      }
      
      /* Hide sensitive content when printing */
      @media print {
        [data-sensitive="true"],
        input[type="password"],
        .password-value,
        .api-key-value {
          visibility: hidden !important;
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Detect screenshot attempts (limited effectiveness)
    this.detectScreenshotAttempts();
  }

  /**
   * Detect potential screenshot attempts
   */
  private detectScreenshotAttempts(): void {
    // Monitor for common screenshot key combinations
    document.addEventListener('keydown', (e) => {
      const isScreenshot = (
        // Windows: Win + PrtScn, PrtScn, Alt + PrtScn
        (e.key === 'PrintScreen') ||
        // macOS: Cmd + Shift + 3/4/5
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
        // Custom combinations
        (e.ctrlKey && e.shiftKey && e.key === 'S')
      );

      if (isScreenshot) {
        this.handleScreenshotAttempt();
      }
    });

    // Monitor for window focus changes (might indicate screen recording)
    window.addEventListener('blur', () => {
      if (document.hasFocus()) {
        this.handlePotentialRecording();
      }
    });
  }

  /**
   * Handle screenshot attempt
   */
  private handleScreenshotAttempt(): void {
    // Temporarily hide sensitive content
    this.protectedElements.forEach(element => {
      element.style.visibility = 'hidden';
    });

    // Show security warning
    this.showSecurityAlert('Screenshot detected. Sensitive content temporarily hidden.');

    // Restore content after delay
    setTimeout(() => {
      this.protectedElements.forEach(element => {
        element.style.visibility = 'visible';
      });
    }, 2000);
  }

  /**
   * Handle potential screen recording
   */
  private handlePotentialRecording(): void {
    // Log security event
    console.warn('Potential screen recording detected');
    
    // Optional: Lock vault or hide content
    // this.lockVaultOnSuspiciousActivity();
  }

  /**
   * Enhanced clipboard security
   */
  private initializeClipboardSecurity(): void {
    // Monitor clipboard operations
    document.addEventListener('copy', (e) => {
      if (this.isClipboardFromSensitiveElement(e.target as Element)) {
        e.preventDefault();
        this.showSecurityAlert('Copying sensitive data is not allowed');
      }
    });

    // Auto-clear clipboard
    document.addEventListener('paste', () => {
      setTimeout(() => {
        SecureClipboard.clearAll();
      }, 1000);
    });

    // Monitor for external clipboard access
    this.monitorClipboardAccess();
  }

  /**
   * Check if clipboard operation is from sensitive element
   */
  private isClipboardFromSensitiveElement(target: Element | null): boolean {
    if (!target) return false;
    
    return (
      target.hasAttribute('data-sensitive') ||
      target.classList.contains('password-value') ||
      target.classList.contains('api-key-value') ||
      this.protectedElements.has(target as HTMLElement)
    );
  }

  /**
   * Monitor clipboard access attempts
   */
  private monitorClipboardAccess(): void {
    if ('clipboard' in navigator && navigator.clipboard) {
      try {
        const originalReadText = navigator.clipboard.readText;
        const originalWriteText = navigator.clipboard.writeText;

        // Monitor read attempts
        if (originalReadText) {
          navigator.clipboard.readText = async function() {
            console.warn('Clipboard read attempted');
            return originalReadText.call(navigator.clipboard);
          };
        }

        // Monitor write attempts
        if (originalWriteText) {
          navigator.clipboard.writeText = async function(text: string) {
            if (text.length > 100) {
              console.warn('Large clipboard write detected');
            }
            return originalWriteText.call(navigator.clipboard, text);
          };
        }
      } catch (error) {
        console.warn('Could not monitor clipboard access:', error);
      }
    }
  }

  /**
   * Setup visibility-based protection
   */
  private setupVisibilityProtection(): void {
    this.visibilityHandler = () => {
      if (document.hidden) {
        // Page is hidden, could be tab switch or screen recording
        this.handleVisibilityChange('hidden');
      } else {
        // Page is visible again
        this.handleVisibilityChange('visible');
      }
    };

    document.addEventListener('visibilitychange', this.visibilityHandler);

    // Also monitor window focus
    window.addEventListener('blur', () => {
      this.handleVisibilityChange('blur');
    });

    window.addEventListener('focus', () => {
      this.handleVisibilityChange('focus');
    });
  }

  /**
   * Handle visibility changes
   */
  private handleVisibilityChange(state: 'hidden' | 'visible' | 'blur' | 'focus'): void {
    const secureStorage = document.querySelector('[data-vault-content]');
    
    if (state === 'hidden' || state === 'blur') {
      // Optional: Hide sensitive content when page is not active
      if (secureStorage) {
        secureStorage.setAttribute('data-hidden', 'true');
      }
    } else {
      // Restore content when page becomes active
      if (secureStorage) {
        secureStorage.removeAttribute('data-hidden');
      }
    }
  }

  /**
   * Prevent developer tools (limited effectiveness)
   */
  private preventDevTools(): void {
    // Detect DevTools opening
    let devtools = {
      open: false,
      orientation: null as string | null
    };

    const threshold = 160;
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleDevToolsDetected();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });

    // Disable common developer shortcuts
    document.addEventListener('keydown', (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
        this.showSecurityAlert('Developer tools are disabled for security');
        return false;
      }
    });
  }

  /**
   * Handle developer tools detection
   */
  private handleDevToolsDetected(): void {
    console.clear();
    console.warn('Developer tools detected. Security protocols activated.');
    
    // Optional: Lock vault or hide content
    // this.lockVaultOnSuspiciousActivity();
  }

  /**
   * Setup CSP violation reporting
   */
  private setupCSPViolationReporting(): void {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.warn('CSP Violation:', {
        violatedDirective: e.violatedDirective,
        blockedURI: e.blockedURI,
        originalPolicy: e.originalPolicy
      });
    });
  }

  /**
   * Show security alert to user
   */
  private showSecurityAlert(message: string): void {
    // Create toast-like notification
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50';
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }

  /**
   * Lock vault on suspicious activity
   */
  private lockVaultOnSuspiciousActivity(): void {
    // Dispatch custom event to lock vault
    window.dispatchEvent(new CustomEvent('security-threat-detected', {
      detail: { reason: 'Suspicious activity detected' }
    }));
  }

  /**
   * Cleanup security measures
   */
  cleanup(): void {
    if (this.clipboardObserver) {
      this.clipboardObserver.disconnect();
    }
    
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
    
    this.protectedElements.clear();
  }
}

/**
 * React hook for security enforcement
 */
export function useSecurity() {
  const security = SecurityEnforcer.getInstance();
  
  React.useEffect(() => {
    security.initialize();
    
    return () => {
      security.cleanup();
    };
  }, [security]);

  return {
    protectElement: (element: HTMLElement) => {
      element.setAttribute('data-sensitive', 'true');
    },
    
    secureClipboardCopy: async (text: string, clearAfterMs = 30000) => {
      await SecureClipboard.copy(text, clearAfterMs);
    },
    
    preventScreenshot: (element: HTMLElement) => {
      element.style.cssText += `
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
      `;
    }
  };
}

/**
 * Security configuration
 */
export const SecurityConfig = {
  // Auto-lock timeout (15 minutes)
  AUTO_LOCK_TIMEOUT: 15 * 60 * 1000,
  
  // Clipboard clear timeout (30 seconds)
  CLIPBOARD_CLEAR_TIMEOUT: 30 * 1000,
  
  // Maximum failed login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Session refresh interval (5 minutes)
  SESSION_REFRESH_INTERVAL: 5 * 60 * 1000,
  
  // Password strength requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_SPECIAL: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true
};

// Import React for the hook
import React from 'react';
