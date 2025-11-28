import { Modal } from '../Modal';
import { FormEngine } from '../form-engine/FormEngine';
import type { FormSchema } from '../form-engine/types';
import type { Service } from '../../types/januscope.types';

const serviceFormSchema: FormSchema = {
  id: 'service-form',
  meta: {
    title: 'Service Details',
  },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Service Name',
      placeholder: 'e.g., Production API',
      rules: {
        required: 'Service name is required',
        minLength: { value: 3, message: 'Name must be at least 3 characters' },
      },
    },
    url: {
      id: 'url',
      renderer: 'text',
      label: 'URL',
      placeholder: 'e.g., https://api.example.com',
      rules: {
        required: 'URL is required',
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid URL starting with http:// or https://',
        },
      },
    },
    checkIntervalSeconds: {
      id: 'checkIntervalSeconds',
      renderer: 'number',
      label: 'Check Interval (seconds)',
      placeholder: '300',
      defaultValue: 300,
      props: {
        min: 60,
        max: 3600,
        step: 60,
      },
      rules: {
        required: 'Check interval is required',
        min: { value: 60, message: 'Minimum interval is 60 seconds' },
        max: { value: 3600, message: 'Maximum interval is 3600 seconds' },
      },
    },
    timeoutMs: {
      id: 'timeoutMs',
      renderer: 'number',
      label: 'Timeout (milliseconds)',
      placeholder: '10000',
      defaultValue: 10000,
      props: {
        min: 1000,
        max: 60000,
        step: 1000,
      },
      rules: {
        required: 'Timeout is required',
        min: { value: 1000, message: 'Minimum timeout is 1000ms' },
        max: { value: 60000, message: 'Maximum timeout is 60000ms' },
      },
    },
    active: {
      id: 'active',
      renderer: 'switch',
      label: 'Active',
      defaultValue: true,
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    { kind: 'field', fieldId: 'url' },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'checkIntervalSeconds' },
        { kind: 'field', fieldId: 'timeoutMs' },
      ],
    },
    { kind: 'field', fieldId: 'active' },
  ],
};

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  service?: Service | null;
  loading?: boolean;
}

export function ServiceFormModal({ isOpen, onClose, onSubmit, service, loading }: ServiceFormModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => !loading && onClose()} 
      title={service ? 'Edit Service' : 'Add Service'}
    >
      <FormEngine
        schema={serviceFormSchema}
        initialValues={service ? {
          name: service.name,
          url: service.url,
          checkIntervalSeconds: service.checkIntervalSeconds,
          timeoutMs: service.timeoutMs,
          active: service.active,
        } : {}}
        onSubmit={onSubmit}
      />
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <div className="spinner" />
        </div>
      )}
    </Modal>
  );
}
