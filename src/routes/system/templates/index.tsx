import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../../components/table-engine';
import { templatesTableSchema } from '../../../components/table-engine/systemSchemas';
import { systemAdminService } from '../../../services/januscope.service';
import { Modal } from '../../../components/Modal';
import { FormEngine } from '../../../components/form-engine/FormEngine';
import { EditIcon, TrashIcon, BackIcon } from '../../../utils/icons';
import type { NotificationTemplate } from '../../../types/januscope.types';
import type { FormSchema } from '../../../components/form-engine/types';
import { useToast } from '../../../contexts/ToastContext';

const templateFormSchema: FormSchema = {
  id: 'template-form',
  meta: {
    title: 'Template Details',
  },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Template Name',
      placeholder: 'e.g., Service Down Alert',
      rules: {
        required: 'Template name is required',
      },
    },
    eventType: {
      id: 'eventType',
      renderer: 'text',
      label: 'Event Type',
      placeholder: 'e.g., service_down, ssl_expiry',
      rules: {
        required: 'Event type is required',
      },
    },
    channel: {
      id: 'channel',
      renderer: 'select',
      label: 'Channel',
      defaultValue: 'email',
      props: {
        options: [
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS' },
          { value: 'telegram', label: 'Telegram' },
        ],
      },
      rules: {
        required: 'Channel is required',
      },
    },
    subjectTemplate: {
      id: 'subjectTemplate',
      renderer: 'text',
      label: 'Subject Template',
      placeholder: 'Email subject (for email templates)',
    },
    bodyTemplate: {
      id: 'bodyTemplate',
      renderer: 'textarea',
      label: 'Body Template',
      placeholder: 'Template content with variables like {{serviceName}}, {{status}}',
      props: {
        minRows: 8,
      },
      rules: {
        required: 'Body template is required',
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'eventType' },
        { kind: 'field', fieldId: 'channel' },
      ],
    },
    { kind: 'field', fieldId: 'subjectTemplate' },
    { kind: 'field', fieldId: 'bodyTemplate' },
  ],
};

function TemplatesPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const toast = useToast();

  const loadTemplates = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.templates.getAll(token);
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: NotificationTemplate) => {
    setEditingTemplate(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const token = localStorage.getItem('accessToken') || '';
    
    try {
      if (editingTemplate) {
        const response = await systemAdminService.templates.update(
          { ...data, templateId: editingTemplate.templateId } as any,
          token
        );
        if (response.success) {
          toast.success('Template updated successfully');
          loadTemplates();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to update template');
        }
      } else {
        const response = await systemAdminService.templates.create(data, token);
        if (response.success) {
          toast.success('Template created successfully');
          loadTemplates();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to create template');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (row: NotificationTemplate) => {
    if (!confirm(`Are you sure you want to delete ${row.name}?`)) return;
    
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.templates.delete(row.templateId, token);
      if (response.success) {
        toast.success('Template deleted successfully');
        loadTemplates();
      } else {
        toast.error(response.message || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Link to="/system" className="btn btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <BackIcon />
        Back to System
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0' }}>Notification Templates</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Manage email, SMS, and Telegram notification templates
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Add Template
        </button>
      </div>

      <TableEngine
        schema={{
          ...templatesTableSchema,
          onRefresh: loadTemplates,
          columns: templatesTableSchema.columns.map((col) => {
            if (col.id === 'actions') {
              return {
                ...col,
                actions: [
                  {
                    label: 'Edit',
                    icon: <EditIcon />,
                    onClick: handleEdit,
                    variant: 'ghost' as const,
                  },
                  {
                    label: 'Delete',
                    icon: <TrashIcon />,
                    onClick: handleDelete,
                    variant: 'danger' as const,
                  },
                ],
              };
            }
            return col;
          }),
        }}
        data={templates}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        size="lg"
      >
        <FormEngine
          schema={templateFormSchema}
          initialValues={editingTemplate ? {
            name: editingTemplate.name,
            eventType: editingTemplate.eventType,
            channel: editingTemplate.channel,
            subjectTemplate: editingTemplate.subjectTemplate,
            bodyTemplate: editingTemplate.bodyTemplate
          } : {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export const Route = createFileRoute('/system/templates/' as any)({
  component: TemplatesPage,
});
