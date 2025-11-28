import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../../components/table-engine';
import { countriesTableSchema } from '../../../components/table-engine/systemSchemas';
import { systemAdminService } from '../../../services/januscope.service';
import { Modal } from '../../../components/Modal';
import { FormEngine } from '../../../components/form-engine/FormEngine';
import { EditIcon, TrashIcon, UploadIcon, BackIcon } from '../../../utils/icons';
import type { Country } from '../../../types/januscope.types';
import type { FormSchema } from '../../../components/form-engine/types';
import { useToast } from '../../../contexts/ToastContext';

const countryFormSchema: FormSchema = {
  id: 'country-form',
  meta: {
    title: 'Country Details',
  },
  fields: {
    countryCode: {
      id: 'countryCode',
      renderer: 'text',
      label: 'Country Code',
      placeholder: 'e.g., KE, US, GB',
      rules: {
        required: 'Country code is required',
        maxLength: { value: 3, message: 'Country code must be 3 characters or less' },
      },
    },
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Country Name',
      placeholder: 'e.g., Kenya, United States',
      rules: {
        required: 'Country name is required',
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'countryCode' },
    { kind: 'field', fieldId: 'name' },
  ],
};

function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const toast = useToast();

  const loadCountries = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.countries.getAll(token);
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const handleCreate = () => {
    setEditingCountry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Country) => {
    setEditingCountry(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const token = localStorage.getItem('accessToken') || '';
    
    try {
      if (editingCountry) {
        const response = await systemAdminService.countries.update(data as any, token);
        if (response.success) {
          toast.success('Country updated successfully');
          loadCountries();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to update country');
        }
      } else {
        const response = await systemAdminService.countries.create(data, token);
        if (response.success) {
          toast.success('Country created successfully');
          loadCountries();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to create country');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (row: Country) => {
    if (!confirm(`Are you sure you want to delete ${row.name}?`)) return;
    
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.countries.delete(row.countryCode, token);
      if (response.success) {
        toast.success('Country deleted successfully');
        loadCountries();
      } else {
        toast.error(response.message || 'Failed to delete country');
      }
    } catch (error) {
      toast.error('Failed to delete country');
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
          <h1 style={{ margin: '0 0 8px 0' }}>Countries</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Manage country reference data
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/system/countries/bulk-imports" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <UploadIcon width="16" height="16" />
            Bulk Import
          </Link>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Country
          </button>
        </div>
      </div>

      <TableEngine
        schema={{
          ...countriesTableSchema,
          onRefresh: loadCountries,
          columns: countriesTableSchema.columns.map((col) => {
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
        data={countries}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCountry ? 'Edit Country' : 'Create Country'}
        size="md"
      >
        <FormEngine
          schema={countryFormSchema}
          initialValues={editingCountry ? { countryCode: editingCountry.countryCode, name: editingCountry.name } : {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export const Route = createFileRoute('/system/countries/' as any)({
  component: CountriesPage,
});
