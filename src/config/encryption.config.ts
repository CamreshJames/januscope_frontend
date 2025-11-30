/**
 * Universal Encryption Configuration
 * Centralized encryption settings for the application
 * 
 * Features:
 * - Environment-based configuration
 * - Easy enable/disable
 * - Per-endpoint encryption control
 * - Development/production modes
 */

import { type EncryptionConfig } from '../utils/encryption';

/**
 * Load encryption configuration from environment
 */
export function getEncryptionConfig(): EncryptionConfig {
  const enabled = import.meta.env.VITE_ENCRYPTION_ENABLED === 'true';
  const key = import.meta.env.VITE_ENCRYPTION_KEY || '';
  
  return {
    enabled,
    key,
    encryptRequests: enabled,
    decryptResponses: enabled,
  };
}

/**
 * Encryption configuration presets
 */
export const EncryptionPresets = {
  /**
   * Development mode - encryption disabled for easier debugging
   */
  development: (): EncryptionConfig => ({
    enabled: false,
    key: '',
    encryptRequests: false,
    decryptResponses: false,
  }),

  /**
   * Production mode - full encryption enabled
   */
  production: (key: string): EncryptionConfig => ({
    enabled: true,
    key,
    encryptRequests: true,
    decryptResponses: true,
  }),

  /**
   * Testing mode - encryption enabled but with test key
   */
  testing: (): EncryptionConfig => ({
    enabled: true,
    key: 'dGVzdC1lbmNyeXB0aW9uLWtleS0zMi1ieXRlcw==', // Test key (not for production!)
    encryptRequests: true,
    decryptResponses: true,
  }),

  /**
   * Custom configuration
   */
  custom: (config: Partial<EncryptionConfig>): EncryptionConfig => ({
    enabled: config.enabled ?? false,
    key: config.key ?? '',
    encryptRequests: config.encryptRequests ?? true,
    decryptResponses: config.decryptResponses ?? true,
  }),
};

/**
 * Endpoint-specific encryption rules
 * Define which endpoints should use encryption
 */
export const EncryptionRules = {
  /**
   * Endpoints that should always be encrypted
   */
  alwaysEncrypt: [
    '/auth/login',
    '/auth/register',
    '/auth/change-password',
    '/users/profile',
    '/users/update',
  ],

  /**
   * Endpoints that should never be encrypted
   */
  neverEncrypt: [
    '/health',
    '/metrics',
    '/public',
  ],

  /**
   * Check if endpoint should be encrypted
   */
  shouldEncrypt: (endpoint: string, defaultValue: boolean = false): boolean => {
    // Check never encrypt list first
    if (EncryptionRules.neverEncrypt.some(path => endpoint.startsWith(path))) {
      return false;
    }

    // Check always encrypt list
    if (EncryptionRules.alwaysEncrypt.some(path => endpoint.startsWith(path))) {
      return true;
    }

    // Use default value
    return defaultValue;
  },
};

/**
 * Encryption status helper
 */
export class EncryptionStatus {
  private static instance: EncryptionStatus;
  private config: EncryptionConfig;
  private initialized: boolean = false;

  private constructor(config: EncryptionConfig) {
    this.config = config;
  }

  static getInstance(config?: EncryptionConfig): EncryptionStatus {
    if (!EncryptionStatus.instance && config) {
      EncryptionStatus.instance = new EncryptionStatus(config);
    }
    return EncryptionStatus.instance;
  }

  isEnabled(): boolean {
    return this.config.enabled && this.initialized;
  }

  setInitialized(value: boolean): void {
    this.initialized = value;
  }

  getConfig(): EncryptionConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<EncryptionConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

/**
 * Validate encryption configuration
 */
export function validateEncryptionConfig(config: EncryptionConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.enabled) {
    if (!config.key) {
      errors.push('Encryption key is required when encryption is enabled');
    } else {
      // Validate base64 format
      try {
        atob(config.key);
      } catch {
        errors.push('Encryption key must be valid base64');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a new encryption key (for setup/testing)
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

/**
 * Log encryption configuration (safe for production)
 */
export function logEncryptionConfig(config: EncryptionConfig): void {
  console.log('🔐 Encryption Configuration:', {
    enabled: config.enabled,
    keySet: !!config.key,
    keyLength: config.key ? config.key.length : 0,
    encryptRequests: config.encryptRequests,
    decryptResponses: config.decryptResponses,
  });
}

// Export default configuration
export default getEncryptionConfig();
