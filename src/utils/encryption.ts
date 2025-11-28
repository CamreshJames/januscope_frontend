/**
 * Universal AES-GCM Encryption Utility 
 */

export interface EncryptionConfig {
  enabled: boolean;
  key: string; // Base64-encoded key
  encryptRequests: boolean;
  decryptResponses: boolean;
}

class EncryptionManager {
  private config: EncryptionConfig;
  private cryptoKey: CryptoKey | null = null;

  constructor(config: EncryptionConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) return;

    try {
      const keyData = this.base64ToArrayBuffer(this.config.key);
      this.cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.config.enabled = false;
    }
  }

  /**
   * Encrypt plaintext to base64 string
   * Format: base64(iv + ciphertext)
   */
  async encrypt(plaintext: string): Promise<string> {
    if (!this.config.enabled || !this.cryptoKey) {
      return plaintext;
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        this.cryptoKey,
        data
      );

      // Combine IV + ciphertext
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(ciphertext), iv.length);

      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      return plaintext;
    }
  }

  /**
   * Decrypt base64 string to plaintext
   * Input: base64(iv + ciphertext)
   */
  async decrypt(encrypted: string): Promise<string> {
    if (!this.config.enabled || !this.cryptoKey) {
      return encrypted;
    }

    try {
      const combined = this.base64ToArrayBuffer(encrypted);
      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv, tagLength: 128 },
        this.cryptoKey,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(plaintext);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encrypted;
    }
  }

  /**
   * Encrypt request body if configured
   */
  async encryptRequest(body: any): Promise<{ body: string; headers: Record<string, string> }> {
    if (!this.config.enabled || !this.config.encryptRequests) {
      return { body: JSON.stringify(body), headers: {} };
    }

    const plaintext = JSON.stringify(body);
    const encrypted = await this.encrypt(plaintext);

    return {
      body: encrypted,
      headers: {
        'X-Encrypted-Request': 'true',
        'X-Encryption-Enabled': 'true',
      },
    };
  }

  /**
   * Decrypt response body if configured
   */
  async decryptResponse(encrypted: string): Promise<any> {
    if (!this.config.enabled || !this.config.decryptResponses) {
      return JSON.parse(encrypted);
    }

    const decrypted = await this.decrypt(encrypted);
    return JSON.parse(decrypted);
  }

  isEnabled(): boolean {
    return this.config.enabled && this.cryptoKey !== null;
  }

  // Utility methods
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Singleton instance
let encryptionManager: EncryptionManager | null = null;

/**
 * Initialize encryption with configuration
 */
export async function initializeEncryption(config: EncryptionConfig): Promise<void> {
  encryptionManager = new EncryptionManager(config);
  await encryptionManager.initialize();
}

/**
 * Get encryption manager instance
 */
export function getEncryptionManager(): EncryptionManager | null {
  return encryptionManager;
}

/**
 * Generate a new encryption key (for setup)
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
 * Quick encrypt function
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!encryptionManager) {
    throw new Error('Encryption not initialized');
  }
  return encryptionManager.encrypt(plaintext);
}

/**
 * Quick decrypt function
 */
export async function decrypt(encrypted: string): Promise<string> {
  if (!encryptionManager) {
    throw new Error('Encryption not initialized');
  }
  return encryptionManager.decrypt(encrypted);
}

// Default configuration (can be overridden)
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  enabled: false, // Disabled by default for development
  key: '', // Must be set from environment
  encryptRequests: true,
  decryptResponses: true,
};
