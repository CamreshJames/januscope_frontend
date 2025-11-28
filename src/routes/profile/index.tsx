import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/januscope.service';
import type { User } from '../../types/januscope.types';
import './profile.css';

function ProfileLayout() {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();

  const token = localStorage.getItem('accessToken') || '';

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.getMe(token);
      if (response.success && response.data) {
        setUser(response.data);
        // Update localStorage user data
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        showError(response.error || 'Failed to load profile');
      }
    } catch (err) {
      showError('Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Failed to load profile</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: "16px" }}>
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="profile-layout">
        {/* Sidebar Navigation */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user.username?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-name">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.username || 'User'}
            </h3>
            <p className="profile-email">{user.email}</p>
            <span className={`profile-role-badge badge-${user.role === `ADMIN` || user.roleName === `admin` ? `primary` : `default`}`}>
              {user.role || user.roleName || 'User'}
            </span>
          </div>

          <nav className="profile-nav">
            <a 
              href="/profile/overview" 
              className="profile-nav-item"
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Overview
            </a>
            <a 
              href="/profile/edit" 
              className="profile-nav-item"
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </a>
            <a 
              href="/profile/change-password" 
              className="profile-nav-item"
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Change Password
            </a>
            <a 
              href="/profile/settings" 
              className="profile-nav-item"
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </a>
            <a 
              href="/profile/activity" 
              className="profile-nav-item"
            >
              <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Activity Log
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="profile-content">
          <Outlet />
          {/* Show overview by default when at /profile */}
          {location.pathname === '/profile' && (
            <div>
              <div className="profile-section-header">
                <h2 className="profile-section-title">Account Overview</h2>
              </div>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <label className="profile-info-label">Username</label>
                  <div className="profile-info-value">
                    {user.username || <span className="empty">Not set</span>}
                  </div>
                </div>

                <div className="profile-info-item">
                  <label className="profile-info-label">Email</label>
                  <div className="profile-info-value">{user.email}</div>
                </div>

                <div className="profile-info-item">
                  <label className="profile-info-label">Name</label>
                  <div className="profile-info-value">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : <span className="empty">Not set</span>}
                  </div>
                </div>

                <div className="profile-info-item">
                  <label className="profile-info-label">Phone</label>
                  <div className="profile-info-value">
                    {user.phoneNumber || <span className="empty">Not set</span>}
                  </div>
                </div>

                <div className="profile-info-item">
                  <label className="profile-info-label">Role</label>
                  <div className="profile-info-value">
                    <span className={`badge badge-${user.role === 'ADMIN' || user.roleName === 'admin' ? 'success' : 'default'}`}>
                      {user.role || user.roleName || 'User'}
                    </span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <label className="profile-info-label">Member Since</label>
                  <div className="profile-info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <a href="/profile/edit" className="btn btn-primary">
                  Edit Profile
                </a>
                <a href="/profile/change-password" className="btn btn-secondary">
                  Change Password
                </a>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/profile/')({
  component: ProfileLayout,
});
