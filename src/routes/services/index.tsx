import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../components/table-engine';
import { servicesTableSchema } from '../../components/table-engine/examples';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { hasPermission } from '../../utils/permissions';
import { servicesService } from '../../services/januscope.service';
import type { Service } from '../../types/januscope.types';
import { ServiceFormModal } from '../../components/modals/ServiceFormModal';
import { SSLCertificateModal } from '../../components/modals/SSLCertificateModal';

function ServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError, info } = useToast();
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSSLModal, setShowSSLModal] = useState(false);
  
  // Selected item and loading states
  const [selectedItem, setSelectedItem] = useState<Service | null>(null);
  const [sslData, setSSLData] = useState<any>(null);
  const [sslLoading, setSSLLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const token = localStorage.getItem('accessToken') || '';
  const canCreate = hasPermission('canCreateService');
  const canEdit = hasPermission('canEditService');
  const canDelete = hasPermission('canDeleteService');

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await servicesService.getAll(token);
      if (response.success && response.data) {
        setServices(response.data);
      } else {
        showError(response.error || 'Failed to load services');
      }
    } catch (err) {
      showError('Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleRefresh = () => {
    info('Refreshing services...');
    loadServices();
  };

  const handleBulkImport = () => {
    navigate({ to: '/services/bulk-import' });
  };

  const handleAdd = () => {
    if (!canCreate) {
      showError('You do not have permission to create services');
      return;
    }
    setSelectedItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (row: Service) => {
    if (!canEdit) {
      showError('You do not have permission to edit services');
      return;
    }
    setSelectedItem(row);
    setShowFormModal(true);
  };

  const handleDelete = (row: Service) => {
    if (!canDelete) {
      showError('You do not have permission to delete services');
      return;
    }
    setSelectedItem(row);
    setShowDeleteModal(true);
  };

  const handleViewSSL = async (row: Service) => {
    setSelectedItem(row);
    setShowSSLModal(true);
    setSSLLoading(true);
    setSSLData(null);

    try {
      const response = await servicesService.getSSLCertificate(row.serviceId, token);
      if (response.success && response.data) {
        setSSLData(response.data);
      } else {
        showError(response.error || 'Failed to load SSL certificate');
      }
    } catch (err) {
      showError('Failed to load SSL certificate');
      console.error('Error loading SSL certificate:', err);
    } finally {
      setSSLLoading(false);
    }
  };

  const handleFormSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const serviceData = {
        name: values.name,
        url: values.url,
        checkIntervalSeconds: values.checkIntervalSeconds,
        timeoutMs: values.timeoutMs,
        active: values.active ?? true,
      };

      let response;
      if (selectedItem) {
        response = await servicesService.update(selectedItem.serviceId, serviceData, token);
      } else {
        response = await servicesService.create(serviceData, token);
      }

      if (response.success) {
        success(selectedItem ? 'Service updated successfully' : 'Service created successfully');
        setShowFormModal(false);
        setSelectedItem(null);
        loadServices();
      } else {
        showError(response.error || 'Failed to save service');
      }
    } catch (err) {
      showError('Failed to save service');
      console.error('Error saving service:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setDeleteLoading(true);
    try {
      const response = await servicesService.delete(selectedItem.serviceId, token);
      if (response.success) {
        success(`Successfully deleted: ${selectedItem.name}`);
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadServices();
      } else {
        showError(response.error || 'Failed to delete service');
      }
    } catch (err) {
      showError('Failed to delete service');
      console.error('Error deleting service:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {canCreate && (
            <button 
              className="btn btn-secondary" 
              onClick={handleBulkImport}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Bulk Import
            </button>
          )}
        </div>
        
        {canCreate && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Service
          </button>
        )}
      </div>

      <TableEngine
        schema={{
          ...servicesTableSchema,
          onRefresh: handleRefresh,
          columns: servicesTableSchema.columns.map((col) => {
            if (col.id === 'actions') {
              return {
                ...col,
                actions: [
                  {
                    label: 'SSL Certificate',
                    icon: (
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ),
                    onClick: handleViewSSL,
                    variant: 'ghost' as const,
                  },
                  ...(canEdit ? [{
                    label: 'Edit',
                    icon: col.actions?.[0].icon,
                    onClick: handleEdit,
                    variant: 'ghost' as const,
                  }] : []),
                  ...(canDelete ? [{
                    label: 'Delete',
                    icon: col.actions?.[1].icon,
                    onClick: handleDelete,
                    variant: 'danger' as const,
                  }] : []),
                ],
              };
            }
            return col;
          }),
        }}
        data={services}
        loading={loading}
        primaryColor="#ff6b35"
      />

      <ServiceFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleFormSubmit}
        service={selectedItem}
        loading={formLoading}
      />

      <SSLCertificateModal
        isOpen={showSSLModal}
        onClose={() => setShowSSLModal(false)}
        serviceName={selectedItem?.name}
        sslData={sslData}
        loading={sslLoading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}

export const Route = createFileRoute('/services/')({
  component: ServicesPage,
});
