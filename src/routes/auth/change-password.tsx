import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { authService } from '../../services/januscope.service';
import { useToast } from '../../hooks/useToast';
import logoIcon from '../../assets/uma-circ.png';
import './auth.css';

const changePasswordSchema: FormSchema = {
  id: 'change-password-form',
  meta: {
    title: 'Change Password',
  },
  fields: {
    currentPassword: {
      id: 'currentPassword',
      renderer: 'password',
      label: 'Current Password',
      placeholder: 'Enter your current password',
      props: {
        autoComplete: 'current-password',
      },
      rules: {
        required: 'Current password is required',
      },
    },
    newPassword: {
      id: 'newPassword',
      renderer: 'password',
      label: 'New Password',
      placeholder: 'Enter your new password',
      props: {
        autoComplete: 'new-password',
      },
      rules: {
        required: 'New password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'Password must contain uppercase, lowercase, and number',
        },
      },
    },
    confirmPassword: {
      id: 'confirmPassword',
      renderer: 'password',
      label: 'Confirm New Password',
      placeholder: 'Confirm your new password',
      props: {
        autoComplete: 'new-password',
      },
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

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('accessToken') || '';

  const handleSubmit = async (values: any) => {
    setError(null);

    try {
      const response = await authService.changePassword(
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        token
      );

      if (response.success) {
        success('Password changed successfully!');
        setTimeout(() => {
          navigate({ to: '/profile' });
        }, 1500);
      } else {
        setError(response.error || 'Failed to change password');
        showError(response.error || 'Failed to change password');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <div className="auth-split-page">
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <img src={logoIcon} alt="Januscope" />
          </div>
          <h1 className="auth-brand-title">Januscope</h1>
          <p className="auth-brand-tagline">Uptime & SSL Monitoring System</p>
        </div>
        <div className="auth-pattern"></div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Change Password</h2>
            <p className="auth-form-subtitle">
              Update your password to keep your account secure
            </p>
          </div>

          <div className="auth-info-banner">
            <span className="info-icon">ℹ</span>
            <div>
              <strong>Password Requirements:</strong> At least 8 characters with uppercase, lowercase, and numbers
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <FormEngine schema={changePasswordSchema} onSubmit={handleSubmit} />

          <div className="auth-footer">
            <button
              className="btn btn-secondary"
              onClick={() => navigate({ to: '/profile' })}
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/change-password')({
  component: ChangePasswordPage,
});
