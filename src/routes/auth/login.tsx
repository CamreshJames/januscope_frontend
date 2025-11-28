import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { authService } from '../../services/januscope.service';
import { useToast } from '../../hooks/useToast';
import logoIcon from '../../assets/uma-circ.png';
import './auth.css';

const loginFormSchema: FormSchema = {
  id: 'login-form',
  meta: {
    title: 'Sign In',
  },
  fields: {
    identifier: {
      id: 'identifier',
      renderer: 'text',
      inputType: 'text',
      label: 'Username or Email',
      placeholder: 'Enter your username or email',
      rules: {
        required: 'Username or email is required',
        minLength: { value: 3, message: 'Must be at least 3 characters' },
      },
    },
    password: {
      id: 'password',
      renderer: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      props: {
        autoComplete: 'current-password',
      },
      rules: {
        required: 'Password is required',
        minLength: { value: 6, message: 'Password must be at least 6 characters' },
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'identifier' },
    { kind: 'field', fieldId: 'password' },
  ],
};

function LoginPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setError(null);

    try {
      const response = await authService.login({
        identifier: values.identifier,
        password: values.password,
      });

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;
        
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Start automatic token refresh
        const { startTokenRefreshTimer } = await import('../../utils/tokenManager');
        startTokenRefreshTimer();

        success('Login successful! Welcome back.');
        navigate({ to: '/' });
      } else {
        setError(response.error || 'Login failed');
        showError(response.error || 'Login failed');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      showError(errorMsg);
    }
  };

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
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to access your monitoring dashboard</p>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              <span className="error-message">{error}</span>
            </div>
          )}

          <FormEngine schema={loginFormSchema} onSubmit={handleSubmit} />

          <div className="auth-footer">
            <p className="auth-link">
              <a
                href="/auth/forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: '/auth/forgot-password' });
                }}
              >
                Forgot password?
              </a>
            </p>
            <p className="auth-link">
              Don't have an account?{' '}
              <a
                href="/auth/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ to: '/auth/register' });
                }}
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});
