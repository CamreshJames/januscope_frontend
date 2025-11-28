import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { authService } from '../../services/januscope.service';
import { useToast } from '../../hooks/useToast';
import logoIcon from '../../assets/uma-circ.png';
import './auth.css';

const forgotPasswordSchema: FormSchema = {
  id: 'forgot-password-form',
  meta: {
    title: 'Reset Password',
  },
  fields: {
    email: {
      id: 'email',
      renderer: 'text',
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'Enter your registered email',
      props: {
        autoComplete: 'email',
      },
      rules: {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      },
    },
  },
  layout: [{ kind: 'field', fieldId: 'email' }],
};

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (values: any) => {
    setError(null);

    try {
      const response = await authService.forgotPassword(values.email);

      if (response.success) {
        setSubmittedEmail(values.email);
        setEmailSent(true);
        success('Password reset instructions sent to your email');
      } else {
        setError(response.error || 'Failed to send reset email');
        showError(response.error || 'Failed to send reset email');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  if (emailSent) {
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
              <h2 className="auth-success-title">Check Your Email</h2>
              <p className="auth-success-message">
                Password reset instructions have been sent to <strong>{submittedEmail}</strong>
              </p>
              <div className="auth-info-box">
                <p className="auth-info-title">What to do next:</p>
                <ol className="auth-info-list">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate({ to: '/auth/login' })}
                  style={{ width: '100%' }}
                >
                  Back to Login
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
            <h2 className="auth-form-title">Forgot Password?</h2>
            <p className="auth-form-subtitle">
              Enter your email and we'll send you instructions to reset your password
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <FormEngine schema={forgotPasswordSchema} onSubmit={handleSubmit} />

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

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
});