// Januscope Backend Types

export interface User {
  id: number;
  userId?: number; // For pending users
  username?: string; // Null for pending users
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phoneNumber?: string;
  nationalId?: string;
  dateOfBirth?: string;
  profileImageUrl?: string;
  gender?: 'male' | 'female' | 'other';
  branchId?: number;
  role?: 'ADMIN' | 'USER';
  roleName?: string;
  branchName?: string;
  approved?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  hoursPending?: number; // For pending users
}

export interface Service {
  serviceId: number;
  name: string;
  url: string;
  checkIntervalSeconds: number;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  currentStatus: string;
  lastCheckedAt?: string;
  customHeaders?: Record<string, string>;
  active: boolean;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UptimeCheck {
  id: number;
  serviceId: number;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  responseTime: number;
  errorMessage?: string;
  checkedAt: string;
}

export interface SSLCheck {
  serviceId: number;
  domain: string;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  serialNumber?: string;
  fingerprint?: string;
  algorithm?: string;
  keySize?: number;
  isSelfSigned: boolean;
  isValid: boolean;
  lastCheckedAt: string;
  errorMessage?: string;
}

export interface Incident {
  id: number;
  serviceId: number;
  status: 'OPEN' | 'RESOLVED';
  errorMessage: string;
  startedAt: string;
  resolvedAt?: string;
}

export interface ContactGroup {
  groupId: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMember {
  memberId: number;
  groupId: number;
  name: string;
  email?: string;
  telegramHandle?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  serviceId: number;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTime: number;
  uptime: number;
  lastCheckAt?: string;
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  engines: {
    [key: string]: {
      name: string;
      healthy: boolean;
    };
  };
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'pending_approval';
}

export interface CreateServiceRequest {
  name: string;
  url: string;
  checkIntervalSeconds?: number;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  active?: boolean;
  contactGroupIds?: number[];
}

export interface UpdateServiceRequest {
  name?: string;
  url?: string;
  type?: 'HTTP' | 'HTTPS' | 'TCP' | 'PING';
  checkInterval?: number;
  timeout?: number;
  active?: boolean;
  contactGroupIds?: number[];
}

export interface CreateContactGroupRequest {
  name: string;
  email?: string;
  telegramChatId?: string;
  discordWebhook?: string;
}

export interface BulkImportRequest {
  format: 'JSON' | 'XML' | 'CSV' | 'EXCEL';
  data: string | File;
}

export interface BulkExportRequest {
  format: 'JSON' | 'XML' | 'CSV' | 'EXCEL';
  entityType: 'SERVICES' | 'USERS' | 'CONTACTS';
}

// System/Admin Reference Data Types
export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Country {
  countryCode: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Branch {
  branchId: number;
  name: string;
  code?: string;
  countryCode?: string;
  countryName?: string;
  locationId?: number;
  locationName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  locationId: number;
  name: string;
  parentId?: number;
  parentName?: string;
  locationType: 'country' | 'county' | 'city' | 'site';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationTemplate {
  templateId: number;
  name: string;
  eventType: string;
  channel: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  isActive: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}
