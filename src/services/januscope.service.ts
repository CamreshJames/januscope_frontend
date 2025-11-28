// Januscope API Service
import { createApiClient } from '../utils/api';
import { API_CONFIG } from '../config/api.config';
import type {
  User,
  Service,
  UptimeCheck,
  SSLCheck,
  Incident,
  ContactGroup,
  ContactMember,
  ServiceStats,
  SystemHealth,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CreateServiceRequest,
  UpdateServiceRequest,
  CreateContactGroupRequest,
  Role,
  Country,
  Branch,
  Location,
  NotificationTemplate,
} from '../types/januscope.types';

const apiClient = createApiClient(API_CONFIG.API_BASE_PATH);

// Authentication Service
export const authService = {
  login: async (credentials: LoginRequest, baseUrl?: string) => {
    return apiClient.post<LoginResponse>(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials,
      { baseUrl }
    );
  },

  register: async (data: RegisterRequest, baseUrl?: string) => {
    return apiClient.post<RegisterResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      data,
      { baseUrl }
    );
  },

  logout: async (token: string, baseUrl?: string) => {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
      {},
      { token, baseUrl }
    );
  },

  getMe: async (token: string, baseUrl?: string) => {
    return apiClient.get<User>(
      API_CONFIG.ENDPOINTS.AUTH.ME,
      { token, baseUrl }
    );
  },

  forgotPassword: async (email: string, baseUrl?: string) => {
    return apiClient.post(
      '/auth/forgot-password',
      { email },
      { baseUrl }
    );
  },

  resetPassword: async (token: string, newPassword: string, baseUrl?: string) => {
    return apiClient.post(
      '/auth/reset-password',
      { token, newPassword },
      { baseUrl }
    );
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }, token: string, baseUrl?: string) => {
    return apiClient.post(
      '/auth/change-password',
      data,
      { token, baseUrl }
    );
  },
};

// Services Service
export const servicesService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<Service[]>(
      API_CONFIG.ENDPOINTS.SERVICES.LIST,
      { token, baseUrl }
    );
  },

  getById: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.get<Service>(
      API_CONFIG.ENDPOINTS.SERVICES.GET(id),
      { token, baseUrl }
    );
  },

  create: async (data: CreateServiceRequest, token: string, baseUrl?: string) => {
    return apiClient.post<Service>(
      API_CONFIG.ENDPOINTS.SERVICES.CREATE,
      data,
      { token, baseUrl }
    );
  },

  update: async (id: number, data: UpdateServiceRequest, token: string, baseUrl?: string) => {
    return apiClient.put<Service>(
      API_CONFIG.ENDPOINTS.SERVICES.UPDATE(id),
      data,
      { token, baseUrl }
    );
  },

  delete: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.SERVICES.DELETE(id),
      { token, baseUrl }
    );
  },

  getStats: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.get<ServiceStats>(
      API_CONFIG.ENDPOINTS.SERVICES.STATS(id),
      { token, baseUrl }
    );
  },

  getSSLCertificate: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.get<SSLCheck>(
      API_CONFIG.ENDPOINTS.SERVICES.GET(id) + '/ssl',
      { token, baseUrl }
    );
  },
};

// Uptime Checks Service
export const uptimeService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<UptimeCheck[]>(
      API_CONFIG.ENDPOINTS.UPTIME.LIST,
      { token, baseUrl }
    );
  },

  getByService: async (serviceId: number, token: string, baseUrl?: string) => {
    return apiClient.get<UptimeCheck[]>(
      API_CONFIG.ENDPOINTS.UPTIME.BY_SERVICE(serviceId),
      { token, baseUrl }
    );
  },

  getLatest: async (serviceId: number, token: string, baseUrl?: string) => {
    return apiClient.get<UptimeCheck>(
      API_CONFIG.ENDPOINTS.UPTIME.LATEST(serviceId),
      { token, baseUrl }
    );
  },
};

// SSL Checks Service
export const sslService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<SSLCheck[]>(
      API_CONFIG.ENDPOINTS.SSL.LIST,
      { token, baseUrl }
    );
  },

  getByService: async (serviceId: number, token: string, baseUrl?: string) => {
    return apiClient.get<SSLCheck[]>(
      API_CONFIG.ENDPOINTS.SSL.BY_SERVICE(serviceId),
      { token, baseUrl }
    );
  },

  getLatest: async (serviceId: number, token: string, baseUrl?: string) => {
    return apiClient.get<SSLCheck>(
      API_CONFIG.ENDPOINTS.SSL.LATEST(serviceId),
      { token, baseUrl }
    );
  },
};

// Incidents Service (accessed via services endpoint)
export const incidentsService = {
  getByService: async (serviceId: number, token: string, baseUrl?: string) => {
    return apiClient.get<Incident[]>(
      API_CONFIG.ENDPOINTS.INCIDENTS.BY_SERVICE(serviceId),
      { token, baseUrl }
    );
  },
};

// Contact Groups Service
export const contactsService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<ContactGroup[]>(
      API_CONFIG.ENDPOINTS.CONTACTS.LIST,
      { token, baseUrl }
    );
  },

  getById: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.get<ContactGroup>(
      API_CONFIG.ENDPOINTS.CONTACTS.GET(id),
      { token, baseUrl }
    );
  },

  getMembers: async (groupId: number, token: string, baseUrl?: string) => {
    return apiClient.get<ContactMember[]>(
      `/contact-groups/${groupId}/members`,
      { token, baseUrl }
    );
  },

  create: async (data: CreateContactGroupRequest, token: string, baseUrl?: string) => {
    return apiClient.post<ContactGroup>(
      API_CONFIG.ENDPOINTS.CONTACTS.CREATE,
      data,
      { token, baseUrl }
    );
  },

  update: async (id: number, data: Partial<CreateContactGroupRequest>, token: string, baseUrl?: string) => {
    return apiClient.put<ContactGroup>(
      API_CONFIG.ENDPOINTS.CONTACTS.UPDATE(id),
      data,
      { token, baseUrl }
    );
  },

  delete: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.CONTACTS.DELETE(id),
      { token, baseUrl }
    );
  },

  addMember: async (groupId: number, data: any, token: string, baseUrl?: string) => {
    return apiClient.post(
      `/contact-groups/${groupId}/members`,
      data,
      { token, baseUrl }
    );
  },

  updateMember: async (groupId: number, memberId: number, data: any, token: string, baseUrl?: string) => {
    return apiClient.put(
      `/contact-groups/${groupId}/members/${memberId}`,
      data,
      { token, baseUrl }
    );
  },

  deleteMember: async (groupId: number, memberId: number, token: string, baseUrl?: string) => {
    return apiClient.delete(
      `/contact-groups/${groupId}/members/${memberId}`,
      { token, baseUrl }
    );
  },
};

// Users Service
export const usersService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<User[]>(
      API_CONFIG.ENDPOINTS.USERS.LIST,
      { token, baseUrl }
    );
  },

  getById: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.get<User>(
      API_CONFIG.ENDPOINTS.USERS.GET(id),
      { token, baseUrl }
    );
  },

  create: async (data: RegisterRequest, token: string, baseUrl?: string) => {
    return apiClient.post<User>(
      API_CONFIG.ENDPOINTS.USERS.CREATE,
      data,
      { token, baseUrl }
    );
  },

  update: async (id: number, data: Partial<User>, token: string, baseUrl?: string) => {
    return apiClient.put<User>(
      API_CONFIG.ENDPOINTS.USERS.UPDATE(id),
      data,
      { token, baseUrl }
    );
  },

  delete: async (id: number, token: string, baseUrl?: string) => {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.USERS.DELETE(id),
      { token, baseUrl }
    );
  },

  approve: async (id: number, notes: string | undefined, token: string, baseUrl?: string) => {
    return apiClient.post<{ message: string; username: string; password: string; note: string }>(
      API_CONFIG.ENDPOINTS.USERS.APPROVE(id),
      { notes },
      { token, baseUrl }
    );
  },

  getPending: async (token: string, baseUrl?: string) => {
    return apiClient.get<User[]>(
      API_CONFIG.ENDPOINTS.USERS.PENDING,
      { token, baseUrl }
    );
  },

  reject: async (id: number, reason: string | undefined, token: string, baseUrl?: string) => {
    return apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.USERS.REJECT(id),
      { reason },
      { token, baseUrl }
    );
  },
};

// Settings Service
export const settingsService = {
  getAll: async (token: string, baseUrl?: string) => {
    return apiClient.get<any[]>(
      API_CONFIG.ENDPOINTS.SETTINGS.LIST,
      { token, baseUrl }
    );
  },

  getByKey: async (key: string, token: string, baseUrl?: string) => {
    return apiClient.get<any>(
      API_CONFIG.ENDPOINTS.SETTINGS.GET(key),
      { token, baseUrl }
    );
  },

  update: async (key: string, value: string, token: string, baseUrl?: string) => {
    return apiClient.put(
      API_CONFIG.ENDPOINTS.SETTINGS.UPDATE(key),
      { value },
      { token, baseUrl }
    );
  },
};

// System Service
export const systemService = {
  getHealth: async (baseUrl?: string) => {
    return apiClient.get<SystemHealth>(
      API_CONFIG.ENDPOINTS.SYSTEM.HEALTH,
      { baseUrl }
    );
  },

  getStats: async (token: string, baseUrl?: string) => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.SYSTEM.STATS,
      { token, baseUrl }
    );
  },

  getApiDocs: async (baseUrl?: string) => {
    return apiClient.get(
      API_CONFIG.ENDPOINTS.SYSTEM.API_DOCS,
      { baseUrl }
    );
  },
};

// System Admin Services - Reference Data Management
export const systemAdminService = {
  // Roles
  roles: {
    getAll: async (token: string, baseUrl?: string) => {
      return apiClient.get<Role[]>('/system/roles', { token, baseUrl });
    },
    getById: async (roleId: number, token: string, baseUrl?: string) => {
      return apiClient.get<Role>(`/system/roles/${roleId}`, { token, baseUrl });
    },
    create: async (role: Partial<Role>, token: string, baseUrl?: string) => {
      return apiClient.post<Role>('/system/roles', role, { token, baseUrl });
    },
    update: async (role: Role, token: string, baseUrl?: string) => {
      return apiClient.put<Role>('/system/roles', role, { token, baseUrl });
    },
    delete: async (roleId: number, token: string, baseUrl?: string) => {
      return apiClient.delete(`/system/roles/${roleId}`, { token, baseUrl });
    },
  },

  // Countries
  countries: {
    getAll: async (token: string, baseUrl?: string) => {
      return apiClient.get<Country[]>('/system/countries', { token, baseUrl });
    },
    getByCode: async (countryCode: string, token: string, baseUrl?: string) => {
      return apiClient.get<Country>(`/system/countries/${countryCode}`, { token, baseUrl });
    },
    create: async (country: Partial<Country>, token: string, baseUrl?: string) => {
      return apiClient.post<Country>('/system/countries', country, { token, baseUrl });
    },
    update: async (country: Country, token: string, baseUrl?: string) => {
      return apiClient.put<Country>('/system/countries', country, { token, baseUrl });
    },
    delete: async (countryCode: string, token: string, baseUrl?: string) => {
      return apiClient.delete(`/system/countries/${countryCode}`, { token, baseUrl });
    },
    bulkImport: async (countries: Partial<Country>[], token: string, baseUrl?: string) => {
      return apiClient.post('/system/countries/bulk-import', countries, { token, baseUrl });
    },
  },

  // Branches
  branches: {
    getAll: async (token: string, baseUrl?: string) => {
      return apiClient.get<Branch[]>('/system/branches', { token, baseUrl });
    },
    getById: async (branchId: number, token: string, baseUrl?: string) => {
      return apiClient.get<Branch>(`/system/branches/${branchId}`, { token, baseUrl });
    },
    create: async (branch: Partial<Branch>, token: string, baseUrl?: string) => {
      return apiClient.post<Branch>('/system/branches', branch, { token, baseUrl });
    },
    update: async (branch: Branch, token: string, baseUrl?: string) => {
      return apiClient.put<Branch>('/system/branches', branch, { token, baseUrl });
    },
    delete: async (branchId: number, token: string, baseUrl?: string) => {
      return apiClient.delete(`/system/branches/${branchId}`, { token, baseUrl });
    },
    bulkImport: async (branches: Partial<Branch>[], token: string, baseUrl?: string) => {
      return apiClient.post('/system/branches/bulk-import', branches, { token, baseUrl });
    },
  },

  // Locations
  locations: {
    getAll: async (token: string, baseUrl?: string) => {
      return apiClient.get<Location[]>('/system/locations', { token, baseUrl });
    },
    getById: async (locationId: number, token: string, baseUrl?: string) => {
      return apiClient.get<Location>(`/system/locations/${locationId}`, { token, baseUrl });
    },
    create: async (location: Partial<Location>, token: string, baseUrl?: string) => {
      return apiClient.post<Location>('/system/locations', location, { token, baseUrl });
    },
    update: async (location: Location, token: string, baseUrl?: string) => {
      return apiClient.put<Location>('/system/locations', location, { token, baseUrl });
    },
    delete: async (locationId: number, token: string, baseUrl?: string) => {
      return apiClient.delete(`/system/locations/${locationId}`, { token, baseUrl });
    },
    bulkImport: async (locations: Partial<Location>[], token: string, baseUrl?: string) => {
      return apiClient.post('/system/locations/bulk-import', locations, { token, baseUrl });
    },
  },

  // Notification Templates
  templates: {
    getAll: async (token: string, baseUrl?: string) => {
      return apiClient.get<NotificationTemplate[]>('/system/templates', { token, baseUrl });
    },
    getById: async (templateId: number, token: string, baseUrl?: string) => {
      return apiClient.get<NotificationTemplate>(`/system/templates/${templateId}`, { token, baseUrl });
    },
    create: async (template: Partial<NotificationTemplate>, token: string, baseUrl?: string) => {
      return apiClient.post<NotificationTemplate>('/system/templates', template, { token, baseUrl });
    },
    update: async (template: NotificationTemplate, token: string, baseUrl?: string) => {
      return apiClient.put<NotificationTemplate>('/system/templates', template, { token, baseUrl });
    },
    delete: async (templateId: number, token: string, baseUrl?: string) => {
      return apiClient.delete(`/system/templates/${templateId}`, { token, baseUrl });
    },
  },
};

// Export all services
export default {
  auth: authService,
  services: servicesService,
  uptime: uptimeService,
  ssl: sslService,
  incidents: incidentsService,
  contacts: contactsService,
  users: usersService,
  settings: settingsService,
  system: systemService,
  systemAdmin: systemAdminService,
};
