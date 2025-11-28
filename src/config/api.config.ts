// API Configuration for Januscope Backend

export const API_CONFIG = {
  // Base URL for the Januscope backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9876',

  // API version
  API_VERSION: 'v1',

  // Full API base path
  get API_BASE_PATH() {
    return `${this.BASE_URL}/api/${this.API_VERSION}`;
  },

  // Endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
    },

    // Services
    SERVICES: {
      LIST: '/services',
      CREATE: '/services',
      GET: (id: number) => `/services/${id}`,
      UPDATE: (id: number) => `/services/${id}`,
      DELETE: (id: number) => `/services/${id}`,
      STATS: (id: number) => `/services/${id}/stats`,
    },

    // Uptime Checks
    UPTIME: {
      LIST: '/uptime-checks',
      BY_SERVICE: (serviceId: number) => `/uptime-checks/service/${serviceId}`,
      LATEST: (serviceId: number) => `/uptime-checks/service/${serviceId}/latest`,
    },

    // SSL Checks
    SSL: {
      LIST: '/ssl-checks',
      BY_SERVICE: (serviceId: number) => `/ssl-checks/service/${serviceId}`,
      LATEST: (serviceId: number) => `/ssl-checks/service/${serviceId}/latest`,
    },

    // Incidents (accessed via services)
    INCIDENTS: {
      BY_SERVICE: (serviceId: number) => `/services/${serviceId}/incidents`,
    },

    // Contact Groups
    CONTACTS: {
      LIST: '/contact-groups',
      CREATE: '/contact-groups',
      GET: (id: number) => `/contact-groups/${id}`,
      UPDATE: (id: number) => `/contact-groups/${id}`,
      DELETE: (id: number) => `/contact-groups/${id}`,
    },

    // Users
    USERS: {
      LIST: '/users',
      CREATE: '/users',
      GET: (id: number) => `/users/${id}`,
      UPDATE: (id: number) => `/users/${id}`,
      DELETE: (id: number) => `/users/${id}`,
      PENDING: '/users/pending',
      APPROVE: (id: number) => `/users/${id}/approve`,
      REJECT: (id: number) => `/users/${id}/reject`,
    },

    // Bulk Operations
    BULK: {
      IMPORT: '/bulk/import',
      EXPORT: '/bulk/export',
    },

    // Settings
    SETTINGS: {
      LIST: '/settings',
      GET: (key: string) => `/settings/${key}`,
      UPDATE: (key: string) => `/settings/${key}`,
    },

    // System
    SYSTEM: {
      HEALTH: '/health',
      STATS: '/stats',
      API_DOCS: '/api-docs',
    },
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
};

// Helper function to build full URL
export function buildApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  return `${API_CONFIG.API_BASE_PATH}${endpoint}`;
}

// Helper function to get auth header
export function getAuthHeader(token?: string): Record<string, string> {
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

export default API_CONFIG;
