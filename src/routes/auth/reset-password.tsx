import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { authService } from '../../services/januscope.service';
import { useToast } from '../../hooks/useToast';
import logoIcon from '../../assets/uma-circ.png';
import './auth.css';

const resetPasswordSchema: FormSchema = {
  id: 'reset-password-form',
  meta: {
    title: 'Reset Password',
  },
  fields: {
    newPassword: {
      id: 'newPassword',
      renderer: 'text',
      inputType: 'password',
      label: 'New Password',
      placeholder: 'Enter new password',
      props: {
        autoComplete: 'new-password',
      },
      rules: {
        required: 'Password is required',
        minLength: {
          value: 8,
          message: 'Password must be at least 8 characters',
        },
      },
    },
    confirmPassword: {
      id: 'confirmPassword',
      renderer: 'text',
      inputType: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm new password',
      props: {
        autoComplete: 'new-password',
      },
      rules: {
        required: 'Please confirm your password',
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'newPassword' },
    { kind: 'field', fieldId: 'confirmPassword' },
  ],
};

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // Get token from URL query params
  const searchParams = useSearch({ from: '/auth/reset-password' });
  const token = (searchParams as any).token;

  if (!token) {
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
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">Invalid or missing reset token</span>
            </div>
            <div className="auth-footer" style={{ marginTop: '24px' }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate({ to: '/auth/forgot-password' })}
                style={{ width: '100%' }}
              >
                Request New Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (values: any) => {
    setError(null);

    if (values.newPassword !== values.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      showError(errorMsg);
      return;
    }

    try {
      const response = await authService.resetPassword(token, values.newPassword);

      if (response.success) {
        setResetSuccess(true);
        success('Password reset successfully');
      } else {
        setError(response.error || 'Failed to reset password');
        showError(response.error || 'Failed to reset password');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  if (resetSuccess) {
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
            <div className="auth-success-container">
              <div className="auth-success-icon">✓</div>
              <h2 className="auth-success-title">Password Reset Successful</h2>
              <p className="auth-success-message">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate({ to: '/auth/login' })}
                  style={{ width: '100%' }}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="auth-form-title">Reset Your Password</h2>
            <p className="auth-form-subtitle">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <FormEngine schema={resetPasswordSchema} onSubmit={handleSubmit} />

          <div className="auth-footer">
            <p className="auth-link">
              Remember your password?{' '}
              <a
                href="/auth/login"
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: '/auth/login' });
                }}
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
});
