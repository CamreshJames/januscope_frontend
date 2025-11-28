import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine, type TableSchema } from '../../components/table-engine';
import { ConfirmModal } from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { hasPermission } from '../../utils/permissions';
import { contactsService } from '../../services/januscope.service';
import type { ContactGroup } from '../../types/januscope.types';
import { Modal } from '../../components/Modal';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { exportViaBackend } from '../../utils/exportHelpers';

const groupFormSchema: FormSchema = {
  id: 'group-form',
  meta: { title: 'Contact Group' },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Group Name',
      placeholder: 'e.g., DevOps Team',
      rules: {
        required: 'Group name is required',
        minLength: { value: 3, message: 'Name must be at least 3 characters' },
      },
    },
    description: {
      id: 'description',
      renderer: 'textarea',
      label: 'Description',
      placeholder: 'Brief description of this contact group',
      props: { minRows: 2, maxRows: 4 },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    { kind: 'field', fieldId: 'description' },
  ],
};

const handleContactsExport = async (format: 'csv' | 'json' | 'excel') => {
  const token = localStorage.getItem('accessToken') || '';
  try {
    await exportViaBackend('/api/v1/bulk/export', format, 'contact-groups-export', token);
  } catch (error) {
    alert('Export failed. Please try again.');
  }
};

const groupTableSchema: TableSchema = {
  id: 'contact-groups-table',
  meta: {
    title: 'Contact Groups',
    subtitle: 'Manage notification contact groups and members',
  },
  columns: [
    {
      id: 'groupId',
      header: 'ID',
      accessor: 'groupId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'name',
      header: 'Group Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      type: 'text',
      width: '300px',
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'date',
      sortable: true,
      width: '150px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'groupId',
      type: 'actions',
      width: '200px',
    },
  ],
  searchable: true,
  exportable: true,
  refreshable: true,
  onExport: handleContactsExport,
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },
};

function ContactsPage() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();
  
  // Modal states
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem('accessToken') || '';
  const canCreate = hasPermission('canCreateContact');
  const canEdit = hasPermission('canEditContact');
  const canDelete = hasPermission('canDeleteContact');

  const loadGroups = async () => {
    setLoading(true);
    try {
      const response = await contactsService.getAll(token);
      if (response.success && response.data) {
        setGroups(response.data);
      } else {
        showError(response.error || 'Failed to load contact groups');
      }
    } catch (err) {
      showError('Failed to load contact groups');
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    loadGroups();
  }, []);

  const handleAddGroup = () => {
    if (!canCreate) {
      showError('You do not have permission to create contact groups');
      return;
    }
    setSelectedGroup(null);
    setShowGroupFormModal(true);
  };

  const handleEditGroup = (row: ContactGroup) => {
    if (!canEdit) {
      showError('You do not have permission to edit contact groups');
      return;
    }
    setSelectedGroup(row);
    setShowGroupFormModal(true);
  };

  const handleDeleteGroup = (row: ContactGroup) => {
    if (!canDelete) {
      showError('You do not have permission to delete contact groups');
      return;
    }
    setSelectedGroup(row);
    setShowDeleteGroupModal(true);
  };

  const handleViewMembers = (row: ContactGroup) => {
    window.location.href = `/contacts/${row.groupId}/members`;
  };

  const handleGroupSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const groupData = {
        name: values.name,
        description: values.description || '',
      };

      let response;
      if (selectedGroup) {
        response = await contactsService.update(selectedGroup.groupId, groupData, token);
      } else {
        response = await contactsService.create(groupData, token);
      }

      if (response.success) {
        success(selectedGroup ? 'Group updated successfully' : 'Group created successfully');
        setShowGroupFormModal(false);
        setSelectedGroup(null);
        loadGroups();
      } else {
        showError(response.error || 'Failed to save group');
      }
    } catch (err) {
      showError('Failed to save group');
      console.error('Error saving group:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteGroup = async () => {
    if (!selectedGroup) return;
    
    setDeleteLoading(true);
    try {
      const response = await contactsService.delete(selectedGroup.groupId, token);
      if (response.success) {
        success(`Successfully deleted: ${selectedGroup.name}`);
        setShowDeleteGroupModal(false);
        setSelectedGroup(null);
        loadGroups();
      } else {
        showError(response.error || 'Failed to delete group');
      }
    } catch (err) {
      showError('Failed to delete group');
      console.error('Error deleting group:', err);
    } finally {
      setDeleteLoading(false);
    }
  };



  const handleBulkImport = () => {
    navigate({ to: '/contacts/bulk-import' });
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
          <button className="btn btn-primary" onClick={handleAddGroup}>
            + Add Contact Group
          </button>
        )}
      </div>

      <TableEngine
        schema={{
          ...groupTableSchema,
          onRefresh: loadGroups,
          columns: groupTableSchema.columns.map((col) => {
            if (col.id === 'actions') {
              return {
                ...col,
                actions: [
                  {
                    label: 'View Members',
                    onClick: handleViewMembers,
                    variant: 'primary' as const,
                  },
                  ...(canEdit ? [{
                    label: 'Edit',
                    onClick: handleEditGroup,
                    variant: 'ghost' as const,
                  }] : []),
                  ...(canDelete ? [{
                    label: 'Delete',
                    onClick: handleDeleteGroup,
                    variant: 'danger' as const,
                  }] : []),
                ],
              };
            }
            return col;
          }),
        }}
        data={groups}
        loading={loading}
        primaryColor="#ff6b35"
      />

      <Modal isOpen={showGroupFormModal} onClose={() => !formLoading && setShowGroupFormModal(false)} title={selectedGroup ? 'Edit Contact Group' : 'Add Contact Group'}>
        <FormEngine
          schema={groupFormSchema}
          initialValues={selectedGroup ? { name: selectedGroup.name, description: selectedGroup.description || '' } : {}}
          onSubmit={handleGroupSubmit}
        />
        {formLoading && <div style={{ textAlign: 'center', padding: '16px' }}><div className="spinner" /></div>}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteGroupModal}
        onClose={() => setShowDeleteGroupModal(false)}
        onConfirm={confirmDeleteGroup}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedGroup?.name}"? This will also delete all members in this group.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}

export const Route = createFileRoute('/contacts/')({
  component: ContactsPage,
});
