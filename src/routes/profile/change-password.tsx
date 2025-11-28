import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/januscope.service';

const changePasswordSchema: FormSchema = {
  id: 'change-password-form',
  meta: {
    title: '',
  },
  fields: {
    currentPassword: {
      id: 'currentPassword',
      renderer: 'password',
      label: 'Current Password',
      placeholder: 'Enter current password',
      rules: {
        required: 'Current password is required',
      },
    },
    newPassword: {
      id: 'newPassword',
      renderer: 'password',
      label: 'New Password',
      placeholder: 'Enter new password',
      rules: {
        required: 'New password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          message: 'Must contain uppercase, lowercase, number, and special character',
        },
      },
    },
    confirmPassword: {
      id: 'confirmPassword',
      renderer: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm new password',
      rules: {
        required: 'Please confirm your password',
        validate: (value, formValues) => {
          if (value !== formValues.newPassword) {
            return 'Passwords do not match';
          }
          return true;
        },
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'currentPassword' },
    { kind: 'field', fieldId: 'newPassword' },
    { kind: 'field', fieldId: 'confirmPassword' },
  ],
};

function ChangePassword() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('accessToken') || '';

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const response = await authService.changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        token
      );

      if (response.success) {
        success('Password changed successfully');
        navigate({ to: '/profile' });
      } else {
        // Show detailed error message from backend
        const errorMsg = response.error || response.message || 'Failed to change password';
        showError(errorMsg);
        console.error('Password change failed:', response);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password';
      showError(errorMsg);
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <a href="/profile" className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </a>
      </div>

      <div className="profile-section-header">
        <h2 className="profile-section-title">Change Password</h2>
      </div>

      <div style={{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 'var(--border-radius)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
        </p>
      </div>

      <FormEngine
        schema={changePasswordSchema}
        onSubmit={handleSubmit}
        primaryColor="#ff6b35"
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Changing password...</p>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute('/profile/change-password')({
  component: ChangePassword,
});
