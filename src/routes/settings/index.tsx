import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { hasPermission } from '../../utils/permissions';
import { useToast } from '../../hooks/useToast';
import { settingsService } from '../../services/januscope.service';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import './settings.css';

interface Setting {
  key: string;
  value: string;
  description: string;
  dataType: string;
  isSensitive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SettingsGroup {
  title: string;
  description: string;
  settings: Setting[];
}

function SettingsPage() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('accessToken') || '';

  useEffect(() => {
    if (!hasPermission('canViewSettings')) {
      showError('You do not have permission to access settings');
      navigate({ to: '/' });
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsService.getAll(token);
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        showError(response.error || 'Failed to load settings');
      }
    } catch (err) {
      showError('Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!hasPermission('canEditSettings')) {
      showError('You do not have permission to edit settings');
      return;
    }

    setSaving(true);
    try {
      // Update each changed setting
      const updates = Object.entries(values).map(async ([key, value]) => {
        const response = await settingsService.update(key, String(value), token);
        return response.success;
      });

      const results = await Promise.all(updates);
      const allSuccess = results.every(r => r);

      if (allSuccess) {
        success('Settings updated successfully');
        loadSettings();
      } else {
        showError('Some settings failed to update');
      }
    } catch (err) {
      showError('Failed to update settings');
      console.error('Error updating settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const groupSettings = (): SettingsGroup[] => {
    const groups: Record<string, SettingsGroup> = {
      monitoring: {
        title: 'Monitoring Configuration',
        description: 'Configure default monitoring intervals and behavior',
        settings: [],
      },
      ssl: {
        title: 'SSL Certificate Monitoring',
        description: 'SSL certificate check intervals and expiry thresholds',
        settings: [],
      },
      notifications: {
        title: 'Notification Settings',
        description: 'Alert cooldown periods and notification behavior',
        settings: [],
      },
      reports: {
        title: 'Reports & Data Retention',
        description: 'Configure data retention and archival policies',
        settings: [],
      },
      system: {
        title: 'System Information',
        description: 'System version and configuration',
        settings: [],
      },
    };

    settings.forEach(setting => {
      const prefix = setting.key.split('.')[0];
      if (groups[prefix]) {
        groups[prefix].settings.push(setting);
      } else {
        groups.system.settings.push(setting);
      }
    });

    return Object.values(groups).filter(g => g.settings.length > 0);
  };

  const createFormSchema = (): FormSchema => {
    const fields: Record<string, any> = {};
    const layoutSections: any[] = [];

    const grouped = groupSettings();

    grouped.forEach(group => {
      const sectionChildren: any[] = [];

      // Separate numeric and non-numeric fields
      const numericSettings = group.settings.filter(s => s.dataType === 'integer');
      const otherSettings = group.settings.filter(s => s.dataType !== 'integer');

      // Process all settings to create field definitions
      group.settings.forEach((setting) => {
        let renderer: any = 'text';
        let inputType: any = undefined;
        let props: any = {};
        let label = setting.description || setting.key;

        // Add units to labels for better UX
        if (setting.key.includes('_seconds')) {
          label += ' (seconds)';
        } else if (setting.key.includes('_ms')) {
          label += ' (ms)';
        } else if (setting.key.includes('_hours')) {
          label += ' (hours)';
        } else if (setting.key.includes('_days')) {
          label += ' (days)';
        }

        switch (setting.dataType) {
          case 'integer':
            renderer = 'number';
            props = { 
              step: 1,
              min: 0,
            };
            break;
          case 'boolean':
            renderer = 'switch';
            break;
          case 'string':
            if (setting.isSensitive) {
              renderer = 'password';
            } else {
              renderer = 'text';
            }
            break;
          case 'json':
            renderer = 'textarea';
            props = { minRows: 3, maxRows: 6 };
            break;
        }

        fields[setting.key] = {
          id: setting.key,
          renderer,
          inputType,
          label,
          placeholder: setting.value,
          defaultValue: setting.dataType === 'integer' ? parseInt(setting.value) :
                       setting.dataType === 'boolean' ? setting.value === 'true' :
                       setting.value,
          props,
          rules: {
            required: 'This setting is required',
          },
        };
      });

      // Add numeric fields in a grid layout (2 columns)
      if (numericSettings.length > 0) {
        const gridChildren = numericSettings.map(setting => ({
          kind: 'field',
          fieldId: setting.key,
        }));

        sectionChildren.push({
          kind: 'grid',
          cols: 2,
          children: gridChildren,
        });
      }

      // Add other fields individually
      otherSettings.forEach(setting => {
        sectionChildren.push({
          kind: 'field',
          fieldId: setting.key,
        });
      });

      if (sectionChildren.length > 0) {
        layoutSections.push({
          kind: 'section',
          title: group.title,
          description: group.description,
          withDivider: true,
          children: sectionChildren,
        });
      }
    });

    return {
      id: 'settings-form',
      meta: {
        title: 'System Settings',
        subtitle: 'Configure system-wide settings and preferences',
      },
      fields,
      layout: layoutSections,
    };
  };

  const getInitialValues = () => {
    const values: Record<string, any> = {};
    settings.forEach(setting => {
      values[setting.key] = setting.dataType === 'integer' ? parseInt(setting.value) :
                           setting.dataType === 'boolean' ? setting.value === 'true' :
                           setting.value;
    });
    return values;
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (settings.length === 0) {
    return (
      <div className="settings-page">
        <div className="settings-empty">
          <p>No settings configured</p>
        </div>
      </div>
    );
  }

  const canEdit = hasPermission('canEditSettings');

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>
          <svg className="settings-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          System Settings
        </h1>
        <p>
          Configure system-wide settings and preferences for monitoring, notifications, SSL checks, and more.
        </p>
      </div>

      {canEdit ? (
        <div className="settings-form-wrapper">
          <FormEngine
            schema={createFormSchema()}
            initialValues={getInitialValues()}
            onSubmit={handleSubmit}
          />
        </div>
      ) : (
        <div className="settings-no-permission">
          <p>
            You do not have permission to edit settings. Contact an administrator.
          </p>
        </div>
      )}

      {saving && (
        <div className="settings-saving-overlay">
          <div className="settings-saving-modal">
            <div className="spinner" />
            <p>Saving settings...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: SettingsPage,
});
