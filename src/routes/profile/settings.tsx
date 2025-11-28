import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { useToast } from '../../hooks/useToast';

const settingsSchema: FormSchema = {
  id: 'profile-settings-form',
  meta: {
    title: '',
  },
  fields: {
    emailNotifications: {
      id: 'emailNotifications',
      renderer: 'switch',
      label: 'Email Notifications',
      defaultValue: true,
    },
    serviceAlerts: {
      id: 'serviceAlerts',
      renderer: 'switch',
      label: 'Service Alerts',
      defaultValue: true,
    },
    sslAlerts: {
      id: 'sslAlerts',
      renderer: 'switch',
      label: 'SSL Alerts',
      defaultValue: true,
    },
    theme: {
      id: 'theme',
      renderer: 'select',
      label: 'Theme',
      defaultValue: 'dark',
      props: {
        options: [
          { label: 'Dark', value: 'dark' },
          { label: 'Light', value: 'light' },
          { label: 'System', value: 'system' },
        ],
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'emailNotifications' },
    { kind: 'field', fieldId: 'serviceAlerts' },
    { kind: 'field', fieldId: 'sslAlerts' },
    { kind: 'field', fieldId: 'theme' },
  ],
};

function ProfileSettings() {
  const { success } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem('userSettings', JSON.stringify(values));
      
      if (values.theme !== 'system') {
        document.documentElement.setAttribute('data-theme', values.theme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      success('Settings saved');
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const savedSettings = localStorage.getItem('userSettings');
  const initialValues = savedSettings ? JSON.parse(savedSettings) : {};

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
        <h2 className="profile-section-title">Settings</h2>
      </div>

      <FormEngine
        schema={settingsSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        primaryColor="#ff6b35"
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="loading-spinner" />
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>Saving...</p>
        </div>
      )}
    </>
  );
}

export const Route = createFileRoute('/profile/settings')({
  component: ProfileSettings,
});
