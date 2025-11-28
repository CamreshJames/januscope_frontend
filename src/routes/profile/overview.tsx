import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { authService } from '../../services/januscope.service';
import type { User } from '../../types/januscope.types';

function ProfileOverview() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken') || '';
      try {
        const response = await authService.getMe(token);
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          console.error('Failed to load profile:', response.error || response.message);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  if (loading || !user) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <a href="/" className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>

      <div className="profile-section-header">
        <h2 className="profile-section-title">Account Overview</h2>
      </div>

      {/* Profile Image */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          borderRadius: '50%', 
          overflow: 'hidden',
          border: '3px solid var(--primary-orange)',
          background: 'var(--bg-tertiary)'
        }}>
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={`${user.firstName} ${user.lastName}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)'
            }}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
        </div>
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
          <label className="profile-info-label">National ID</label>
          <div className="profile-info-value">
            {user.nationalId || <span className="empty">Not set</span>}
          </div>
        </div>

        <div className="profile-info-item">
          <label className="profile-info-label">Date of Birth</label>
          <div className="profile-info-value">
            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : <span className="empty">Not set</span>}
          </div>
        </div>

        <div className="profile-info-item">
          <label className="profile-info-label">Gender</label>
          <div className="profile-info-value">
            {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : <span className="empty">Not set</span>}
          </div>
        </div>

        <div className="profile-info-item">
          <label className="profile-info-label">Branch</label>
          <div className="profile-info-value">
            {user.branchName || <span className="empty">Not set</span>}
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
          <label className="profile-info-label">Last Login</label>
          <div className="profile-info-value">
            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : <span className="empty">Never</span>}
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
    </>
  );
}

export const Route = createFileRoute('/profile/overview')({
  component: ProfileOverview,
});
