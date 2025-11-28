import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../../components/table-engine';
import { locationsTableSchema } from '../../../components/table-engine/systemSchemas';
import { systemAdminService } from '../../../services/januscope.service';
import { Modal } from '../../../components/Modal';
import { FormEngine } from '../../../components/form-engine/FormEngine';
import { EditIcon, TrashIcon, UploadIcon, BackIcon } from '../../../utils/icons';
import type { Location } from '../../../types/januscope.types';
import type { FormSchema } from '../../../components/form-engine/types';
import { useToast } from '../../../contexts/ToastContext';

const locationFormSchema: FormSchema = {
  id: 'location-form',
  meta: {
    title: 'Location Details',
  },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Location Name',
      placeholder: 'e.g., Westlands, Manhattan',
      rules: {
        required: 'Location name is required',
      },
    },
    locationType: {
      id: 'locationType',
      renderer: 'select',
      label: 'Location Type',
      defaultValue: 'city',
      props: {
        options: [
          { value: 'country', label: 'Country' },
          { value: 'county', label: 'County/State' },
          { value: 'city', label: 'City' },
          { value: 'site', label: 'Site' },
        ],
      },
      rules: {
        required: 'Location type is required',
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    { kind: 'field', fieldId: 'locationType' },
  ],
};

function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const toast = useToast();

  const loadLocations = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.locations.getAll(token);
      if (response.success && response.data) {
        setLocations(response.data);
      }
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Location) => {
    setEditingLocation(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const token = localStorage.getItem('accessToken') || '';
    
    try {
      if (editingLocation) {
        const response = await systemAdminService.locations.update(
          { ...data, locationId: editingLocation.locationId } as any,
          token
        );
        if (response.success) {
          toast.success('Location updated successfully');
          loadLocations();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to update location');
        }
      } else {
        const response = await systemAdminService.locations.create(data, token);
        if (response.success) {
          toast.success('Location created successfully');
          loadLocations();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to create location');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (row: Location) => {
    if (!confirm(`Are you sure you want to delete ${row.name}?`)) return;
    
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.locations.delete(row.locationId, token);
      if (response.success) {
        toast.success('Location deleted successfully');
        loadLocations();
      } else {
        toast.error(response.message || 'Failed to delete location');
      }
    } catch (error) {
      toast.error('Failed to delete location');
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
          <h1 style={{ margin: '0 0 8px 0' }}>Locations</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Manage geographic locations for services and branches
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/system/locations/bulk-imports" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <UploadIcon width="16" height="16" />
            Bulk Import
          </Link>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Location
          </button>
        </div>
      </div>

      <TableEngine
        schema={{
          ...locationsTableSchema,
          onRefresh: loadLocations,
          columns: locationsTableSchema.columns.map((col) => {
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
        data={locations}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? 'Edit Location' : 'Create Location'}
        size="md"
      >
        <FormEngine
          schema={locationFormSchema}
          initialValues={editingLocation ? { name: editingLocation.name, locationType: editingLocation.locationType } : {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export const Route = createFileRoute('/system/locations/' as any)({
  component: LocationsPage,
});
