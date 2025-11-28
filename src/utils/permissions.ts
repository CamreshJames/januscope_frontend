// Permission utilities for role-based access control

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface UserPermissions {
  canViewDashboard: boolean;
  canViewServices: boolean;
  canCreateService: boolean;
  canEditService: boolean;
  canDeleteService: boolean;
  canViewUsers: boolean;
  canCreateUser: boolean;
  canApproveUser: boolean;
  canEditUser: boolean;
  canDeleteUser: boolean;
  canViewContacts: boolean;
  canCreateContact: boolean;
  canEditContact: boolean;
  canDeleteContact: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewIncidents: boolean;
  canResolveIncidents: boolean;
}

export function getUserRole(): UserRole {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'viewer';
    
    const user = JSON.parse(userStr);
    const role = (user.role || user.roleName || 'viewer').toLowerCase();
    
    if (role === 'admin') return 'admin';
    if (role === 'operator') return 'operator';
    return 'viewer';
  } catch {
    return 'viewer';
  }
}

export function getPermissions(role?: UserRole): UserPermissions {
  const userRole = role || getUserRole();
  
  switch (userRole) {
    case 'admin':
      return {
        canViewDashboard: true,
        canViewServices: true,
        canCreateService: true,
        canEditService: true,
        canDeleteService: true,
        canViewUsers: true,
        canCreateUser: true,
        canApproveUser: true,
        canEditUser: true,
        canDeleteUser: true,
        canViewContacts: true,
        canCreateContact: true,
        canEditContact: true,
        canDeleteContact: true,
        canViewSettings: true,
        canEditSettings: true,
        canViewIncidents: true,
        canResolveIncidents: true,
      };
    
    case 'operator':
      return {
        canViewDashboard: true,
        canViewServices: true,
        canCreateService: true,
        canEditService: true,
        canDeleteService: false,
        canViewUsers: false,
        canCreateUser: false,
        canApproveUser: false,
        canEditUser: false,
        canDeleteUser: false,
        canViewContacts: true,
        canCreateContact: true,
        canEditContact: true,
        canDeleteContact: false,
        canViewSettings: false,
        canEditSettings: false,
        canViewIncidents: true,
        canResolveIncidents: true,
      };
    
    case 'viewer':
    default:
      return {
        canViewDashboard: true,
        canViewServices: true,
        canCreateService: false,
        canEditService: false,
        canDeleteService: false,
        canViewUsers: false,
        canCreateUser: false,
        canApproveUser: false,
        canEditUser: false,
        canDeleteUser: false,
        canViewContacts: true,
        canCreateContact: false,
        canEditContact: false,
        canDeleteContact: false,
        canViewSettings: false,
        canEditSettings: false,
        canViewIncidents: true,
        canResolveIncidents: false,
      };
  }
}

export function hasPermission(permission: keyof UserPermissions): boolean {
  const permissions = getPermissions();
  return permissions[permission];
}

export function isAdmin(): boolean {
  return getUserRole() === 'admin';
}

export function isOperator(): boolean {
  return getUserRole() === 'operator';
}

export function isViewer(): boolean {
  return getUserRole() === 'viewer';
}
