import { getEncryptionManager } from './encryption';

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  baseUrl?: string;
  encrypt?: boolean; // Enable encryption for this request
}

export interface ApiResponse<T = any> {
  data: T | null;
  success: boolean;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private encryptionEnabled: boolean;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}, encryptionEnabled: boolean = false) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.encryptionEnabled = encryptionEnabled;
  }

  setEncryptionEnabled(enabled: boolean) {
    this.encryptionEnabled = enabled;
  }

  private buildUrl(endpoint: string, baseUrl?: string): string {
    const base = baseUrl || this.baseUrl;
    if (!base) {
      console.warn('No baseUrl provided, using endpoint directly:', endpoint);
    }
    const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    // console.log('Constructed URL:', url); // Debug: Log the final URL
    return url;
  }

  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...config.headers };
    if (config.token) {
      headers.Authorization = `Bearer ${config.token}`;
    }
    // console.log('Request Headers:', headers); // Debug: Log headers
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const isEncrypted = response.headers.get('X-Encrypted-Response') === 'true';
    
    let responseData: any;
    try {
      const rawData = isJson ? await response.json() : await response.text();
      
      // Decrypt if response is encrypted
      if (isEncrypted && typeof rawData === 'string') {
        const encryptionManager = getEncryptionManager();
        if (encryptionManager) {
          const decrypted = await encryptionManager.decrypt(rawData);
          responseData = JSON.parse(decrypted);
        } else {
          console.warn('Response is encrypted but encryption manager not initialized');
          responseData = rawData;
        }
      } else {
        responseData = rawData;
      }
    } catch (error) {
      // console.error('Response Parsing Error:', error); // Debug: Log parsing errors
      responseData = null;
    }
    // console.log('Response Data:', { status: response.status, data: responseData }); // Debug: Log response
    
    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: responseData?.message || responseData?.error || `HTTP ${response.status}`,
        message: responseData?.message || `Request failed with status ${response.status}`,
      };
    }
    
    // Backend already returns { success, data, message } structure
    // So we return it as-is instead of wrapping it again
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      return responseData as ApiResponse<T>;
    }
    
    // Fallback for non-standard responses
    return {
      success: true,
      data: responseData,
      message: responseData?.message,
    };
  }

  async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    try {
      if (!endpoint) {
        throw new Error('Endpoint is required');
      }
      const url = this.buildUrl(endpoint, config.baseUrl);
      const headers = this.buildHeaders(config);
      
      // Handle encryption
      const shouldEncrypt = config.encrypt !== undefined ? config.encrypt : this.encryptionEnabled;
      const encryptionManager = getEncryptionManager();
      
      if (shouldEncrypt && encryptionManager?.isEnabled()) {
        headers['X-Encryption-Enabled'] = 'true';
      }
      
      const requestConfig: RequestInit = {
        method: config.method || 'GET',
        headers,
      };
      
      if (config.body && config.method !== 'GET') {
        let bodyContent: string;
        
        // Encrypt request body if enabled
        if (shouldEncrypt && encryptionManager?.isEnabled()) {
          const plaintext = typeof config.body === 'string' 
            ? config.body 
            : JSON.stringify(config.body);
          bodyContent = await encryptionManager.encrypt(plaintext);
          requestConfig.headers = {
            ...requestConfig.headers,
            'X-Encrypted-Request': 'true',
          };
        } else {
          bodyContent = typeof config.body === 'string'
            ? config.body
            : JSON.stringify(config.body);
        }
        
        requestConfig.body = bodyContent;
      }
      
      const response = await fetch(url, requestConfig);
      const result = await this.handleResponse<T>(response);
      
      // If token expired and we have a refresh token, try to refresh
      if (!result.success && 
          (result.error?.includes('expired') || result.error?.includes('Invalid or expired token')) &&
          config.token &&
          !endpoint.includes('/auth/refresh')) {
        
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          const newHeaders = this.buildHeaders({ ...config, token: refreshed });
          const retryConfig: RequestInit = {
            method: config.method || 'GET',
            headers: newHeaders,
          };
          if (config.body && config.method !== 'GET') {
            retryConfig.body = typeof config.body === 'string'
              ? config.body
              : JSON.stringify(config.body);
          }
          
          const retryResponse = await fetch(url, retryConfig);
          return this.handleResponse<T>(retryResponse);
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        message: 'Request failed',
      };
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({ refreshToken }),
      });

      const result = await this.handleResponse<{ accessToken: string; refreshToken: string }>(response);
      
      if (result.success && result.data) {
        // Update tokens in localStorage
        localStorage.setItem('accessToken', result.data.accessToken);
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
        return result.data.accessToken;
      }
      
      // Refresh failed - clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async get<T = any>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  async put<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(endpoint: string, body?: any, config: Omit<RequestConfig, 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(endpoint: string, config: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const createApiClient = (baseUrl?: string, defaultHeaders?: Record<string, string>) =>
  new ApiClient(baseUrl, defaultHeaders);

export default ApiClient;