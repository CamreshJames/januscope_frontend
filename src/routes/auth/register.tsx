import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { authService } from '../../services/januscope.service';
import { useToast } from '../../hooks/useToast';
import logoIcon from '../../assets/uma-circ.png';
import './auth.css';

const registerFormSchema: FormSchema = {
  id: 'register-form',
  meta: {
    title: 'Request Access',
  },
  fields: {
    email: {
      id: 'email',
      renderer: 'text',
      inputType: 'email',
      label: 'Email Address',
      placeholder: 'your.email@example.com',
      rules: {
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      },
    },
    firstName: {
      id: 'firstName',
      renderer: 'text',
      inputType: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      rules: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' },
      },
    },
    lastName: {
      id: 'lastName',
      renderer: 'text',
      inputType: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      rules: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'email' },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'firstName' },
        { kind: 'field', fieldId: 'lastName' },
      ],
    },
  ],
};

function RegisterPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string>('');

  const handleSubmit = async (values: any) => {
    setError(null);

    try {
      const response = await authService.register({
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      if (response.success && response.data) {
        // Registration submitted successfully - show pending message
        setSubmittedEmail(response.data.email);
        setPendingApproval(true);
        success('Registration request submitted successfully!');
      } else {
        setError(response.error || 'Registration failed');
        showError(response.error || 'Registration failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

  // Show pending approval message if registration was successful
  if (pendingApproval) {
    return (
      <div className="auth-split-page">
        {/* Left Side - Branding */}
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

        {/* Right Side - Pending Message */}
        <div className="auth-form-side">
          <div className="auth-form-container">
            <div className="auth-success-container">
              <div className="auth-success-icon">✓</div>
              <h2 className="auth-success-title">Registration Submitted!</h2>
              <p className="auth-success-message">
                Your registration request has been submitted successfully.
              </p>
              <div className="auth-info-box">
                <p className="auth-info-title">What happens next?</p>
                <ol className="auth-info-list">
                  <li>An administrator will review your request</li>
                  <li>Once approved, you'll receive an email at <strong>{submittedEmail}</strong></li>
                  <li>The email will contain your username and temporary password</li>
                  <li>Use those credentials to log in and start monitoring</li>
                </ol>
              </div>
              <p className="auth-info-note">
                <span className="info-icon">ℹ</span>
                Please check your email regularly. Approval typically takes 1-2 business days.
              </p>
              <div className="auth-footer" style={{ marginTop: '24px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate({ to: '/auth/login' })}
                  style={{ width: '100%' }}
                >
                  Go to Login Page
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
      {/* Left Side - Branding */}
      <div className="auth-brand-side">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">
            <img src={logoIcon} alt="Januscope" />
          </div>
          <h1 className="auth-brand-title">Januscope</h1>
          <p className="auth-brand-tagline">Uptime & SSL Monitoring System</p>
          <div className="auth-brand-features">
            <p className="auth-feature-text">Real-time monitoring</p>
            <p className="auth-feature-text">SSL certificate tracking</p>
            <p className="auth-feature-text">Comprehensive analytics</p>
            <p className="auth-feature-text">Instant notifications</p>
          </div>
        </div>
        <div className="auth-pattern"></div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Request Access</h2>
            <p className="auth-form-subtitle">
              Submit your information to request access to Januscope
            </p>
          </div>

          <div className="auth-info-banner">
            <span className="info-icon">ℹ</span>
            <div>
              <strong>Simple Registration:</strong> Just provide your email and name. 
              After admin approval, you'll receive login credentials via email.
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <FormEngine schema={registerFormSchema} onSubmit={handleSubmit} />

          <div className="auth-footer">
            <p className="auth-link">
              Already have an account?{' '}
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

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});
