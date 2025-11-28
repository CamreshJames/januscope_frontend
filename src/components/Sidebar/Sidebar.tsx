import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import {
  DashboardIcon,
  ServiceIcon,
  IncidentIcon,
  SSLIcon,
  ContactIcon,
  UsersIcon,
  SettingIcon,
  MenuIcon,
  CloseIcon,
  PiedashboardIcon,
} from '../../utils/icons';
import logoIcon from '../../assets/uma-circ.png';
import './Sidebar.css';

// Theme toggle icons
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 2V4M10 16V18M18 10H16M4 10H2M15.657 4.343L14.243 5.757M5.757 14.243L4.343 15.657M15.657 15.657L14.243 14.243M5.757 5.757L4.343 4.343" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

// Login/Register icons
const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2C11.1046 2 12 2.89543 12 4C12 5.10457 11.1046 6 10 6C8.89543 6 8 5.10457 8 4C8 2.89543 8.89543 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2C9.10457 2 10 2.89543 10 4C10 5.10457 9.10457 6 8 6C6.89543 6 6 5.10457 6 4C6 2.89543 6.89543 2 8 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M2 18C2 14.6863 4.68629 12 8 12C11.3137 12 14 14.6863 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 7V13M18 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 14L17 10M17 10L13 6M17 10H7M7 17H4C3.44772 17 3 16.5523 3 16V4C3 3.44772 3.44772 3 4 3H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface MenuGroup {
  id: string;
  label: string;
  items: Array<{
    id: string;
    label: string;
    Icon: React.FC;
    path: string;
  }>;
}

const Sidebar = ({ activeItem: _activeItem, onItemClick: _onItemClick }: SidebarProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'auth']);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, toggleSidebar } = useSidebar();

  // Check login status
  useState(() => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }
    }
  });

  // Build menu groups based on login status and role
  const userRole = currentUser?.role || currentUser?.roleName || 'viewer';
  const isAdmin = userRole.toLowerCase() === 'admin';
  const isOperator = userRole.toLowerCase() === 'operator';
  
  // Profile icon
  const ProfileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2C11.1046 2 12 2.89543 12 4C12 5.10457 11.1046 6 10 6C8.89543 6 8 5.10457 8 4C8 2.89543 8.89543 2 10 2Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 18C4 14.6863 6.68629 12 10 12C13.3137 12 16 14.6863 16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  const menuGroups: MenuGroup[] = isLoggedIn ? [
    {
      id: 'main',
      label: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon, path: '/' },
        { id: 'profile', label: 'My Profile', Icon: ProfileIcon, path: '/profile' },
      ],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      items: [
        { id: 'services', label: 'Services', Icon: ServiceIcon, path: '/services' },
        { id: 'incidents', label: 'Incidents', Icon: IncidentIcon, path: '/incidents' },
        { id: 'ssl', label: 'SSL Certificates', Icon: SSLIcon, path: '/ssl' },
        { id: 'charts', label: 'Analytics', Icon: PiedashboardIcon, path: '/charts' },
      ],
    },
    // Management section - only for admin and operator
    ...(isAdmin || isOperator ? [{
      id: 'management',
      label: 'Management',
      items: [
        ...(isAdmin ? [{ id: 'users', label: 'Users', Icon: UsersIcon, path: '/users' }] : []),
        { id: 'contacts', label: 'Contact Groups', Icon: ContactIcon, path: '/contacts' },
      ],
    }] : []),
    // System section - only for admin
    ...(isAdmin ? [{
      id: 'system',
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', Icon: SettingIcon, path: '/settings' },
        { id: 'roles', label: 'Roles', Icon: UsersIcon, path: '/system/roles' },
        { id: 'countries', label: 'Countries', Icon: ServiceIcon, path: '/system/countries' },
        { id: 'branches', label: 'Branches', Icon: ContactIcon, path: '/system/branches' },
        { id: 'locations', label: 'Locations', Icon: ServiceIcon, path: '/system/locations' },
        { id: 'templates', label: 'Templates', Icon: SettingIcon, path: '/system/templates' },
      ],
    }] : []),
  ] : [
    {
      id: 'auth',
      label: 'Get Started',
      items: [
        { id: 'login', label: 'Sign In', Icon: LoginIcon, path: '/auth/login' },
        { id: 'register', label: 'Request Access', Icon: UserPlusIcon, path: '/auth/register' },
      ],
    },
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleItemClick = () => {
    setIsMobileOpen(false);
  };

  const handleLogout = async () => {
    // Stop token refresh timer
    const { stopTokenRefreshTimer, clearTokens } = await import('../../utils/tokenManager');
    stopTokenRefreshTimer();
    clearTokens();
    
    // Update state
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    // Redirect to home (landing page)
    window.location.href = '/';
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button className="mobile-menu-btn" onClick={toggleMobileSidebar} aria-label="Toggle menu">
        {isMobileOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isMobileOpen && <div className="sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      <aside className={`sidebar ${isMobileOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Desktop collapse toggle */}
        <button 
          className="sidebar-collapse-btn" 
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
        <div className="sidebar-header">
          <div className="logo" title={isCollapsed ? 'Januscope - Monitoring System' : undefined}>
            <img src={logoIcon} alt="Januscope" className="logo-icon" />
            {!isCollapsed && (
              <div className="logo-text">
                <div className="logo-title">Januscope</div>
                <div className="logo-subtitle">Monitoring System</div>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuGroups.map((group) => (
              <li key={group.id} className="nav-group">
                {!isCollapsed && (
                  <button
                    className="nav-group-header"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={expandedGroups.includes(group.id)}
                  >
                    <span className="nav-group-label">{group.label}</span>
                    <span className={`nav-group-icon ${expandedGroups.includes(group.id) ? 'expanded' : ''}`}>
                      <ChevronDownIcon />
                    </span>
                  </button>
                )}
                
                <ul className={`nav-group-items ${!isCollapsed && !expandedGroups.includes(group.id) ? 'collapsed' : ''}`}>
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                        onClick={handleItemClick}
                        title={isCollapsed ? item.label : undefined}
                        aria-label={item.label}
                      >
                        <span className="nav-icon">
                          <item.Icon />
                        </span>
                        {!isCollapsed && <span className="nav-label">{item.label}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            {!isCollapsed && (
              <span className="theme-toggle-label">
                {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            )}
          </button>
          
          {isLoggedIn && (
            <>
              {!isCollapsed && currentUser && (
                <div className="user-info">
                  <div className="user-avatar">
                    {currentUser.firstName?.[0] || currentUser.username?.[0] || 'U'}
                  </div>
                  <div className="user-details">
                    <div className="user-name">
                      {currentUser.firstName && currentUser.lastName 
                        ? `${currentUser.firstName} ${currentUser.lastName}`
                        : currentUser.username || 'User'}
                    </div>
                    <div className="user-role">
                      {currentUser.role || currentUser.roleName || 'User'}
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                className="logout-btn" 
                onClick={handleLogout}
                title="Sign out"
              >
                <span className="nav-icon">
                  <LogoutIcon />
                </span>
                {!isCollapsed && <span className="nav-label">Sign Out</span>}
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
