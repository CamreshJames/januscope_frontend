import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine, type TableSchema } from '../../components/table-engine';
import { Modal, ConfirmModal } from '../../components/Modal';
import { FormEngine } from '../../components/form-engine/FormEngine';
import type { FormSchema } from '../../components/form-engine/types';
import { useToast } from '../../contexts/ToastContext';
import { hasPermission } from '../../utils/permissions';
import { contactsService } from '../../services/januscope.service';
import type { ContactMember, ContactGroup } from '../../types/januscope.types';

const membersTableSchema: TableSchema = {
  id: 'contact-members-table',
  meta: {
    title: 'Contact Members',
    subtitle: 'Manage members in this contact group',
  },
  columns: [
    {
      id: 'memberId',
      header: 'ID',
      accessor: 'memberId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      type: 'text',
      sortable: true,
      width: '250px',
    },
    {
      id: 'phoneNumber',
      header: 'Phone',
      accessor: 'phoneNumber',
      type: 'text',
      width: '150px',
    },
    {
      id: 'telegramHandle',
      header: 'Telegram',
      accessor: 'telegramHandle',
      type: 'text',
      width: '150px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'memberId',
      type: 'actions',
      width: '150px',
    },
  ],
  searchable: true,
  exportable: true,
  refreshable: true,
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  },
};

const memberFormSchema: FormSchema = {
  id: 'member-form',
  meta: {
    title: 'Contact Member',
  },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Name',
      placeholder: 'e.g., John Doe',
      rules: {
        required: 'Name is required',
      },
    },
    email: {
      id: 'email',
      renderer: 'text',
      inputType: 'email',
      label: 'Email',
      placeholder: 'john.doe@example.com',
      rules: {
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Invalid email address',
        },
      },
    },
    telegramHandle: {
      id: 'telegramHandle',
      renderer: 'text',
      label: 'Telegram Handle',
      placeholder: '@johndoe',
    },
    phoneNumber: {
      id: 'phoneNumber',
      renderer: 'text',
      inputType: 'tel',
      label: 'Phone Number',
      placeholder: '+1234567890',
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'email' },
        { kind: 'field', fieldId: 'phoneNumber' },
      ],
    },
    { kind: 'field', fieldId: 'telegramHandle' },
  ],
};

function ContactMembersPage() {
  const navigate = useNavigate();
  const { groupId } = useParams({ from: '/contacts/$groupId/members' });
  const [group, setGroup] = useState<ContactGroup | null>(null);
  const [members, setMembers] = useState<ContactMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<ContactMember | null>(null);
  const [loading, setLoading] = useState(true);
  const { success, error: showError, info } = useToast();
  
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem('accessToken') || '';
  const canCreate = hasPermission('canCreateContact');
  const canEdit = hasPermission('canEditContact');
  const canDelete = hasPermission('canDeleteContact');

  const loadGroup = async () => {
    try {
      const response = await contactsService.getById(parseInt(groupId), token);
      if (response.success && response.data) {
        setGroup(response.data);
      } else {
        showError(response.error || 'Failed to load group');
      }
    } catch (err) {
      showError('Failed to load group');
      console.error('Error loading group:', err);
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await contactsService.getMembers(parseInt(groupId), token);
      if (response.success && response.data) {
        setMembers(response.data);
      } else {
        showError(response.error || 'Failed to load members');
      }
    } catch (err) {
      showError('Failed to load members');
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    loadMembers();
  }, [groupId]);

  const handleRefresh = () => {
    info('Refreshing members...');
    loadMembers();
  };

  const handleAdd = () => {
    if (!canCreate) {
      showError('You do not have permission to add members');
      return;
    }
    setSelectedMember(null);
    setShowMemberFormModal(true);
  };

  const handleEdit = (row: ContactMember) => {
    if (!canEdit) {
      showError('You do not have permission to edit members');
      return;
    }
    setSelectedMember(row);
    setShowMemberFormModal(true);
  };

  const handleDelete = (row: ContactMember) => {
    if (!canDelete) {
      showError('You do not have permission to delete members');
      return;
    }
    setSelectedMember(row);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (values: any) => {
    setFormLoading(true);
    try {
      const memberData = {
        name: values.name,
        email: values.email || null,
        telegramHandle: values.telegramHandle || null,
        phoneNumber: values.phoneNumber || null,
      };

      let response;
      if (selectedMember) {
        response = await contactsService.updateMember(
          parseInt(groupId),
          selectedMember.memberId,
          memberData,
          token
        );
      } else {
        response = await contactsService.addMember(parseInt(groupId), memberData, token);
      }

      if (response.success) {
        success(selectedMember ? 'Member updated successfully' : 'Member added successfully');
        setShowMemberFormModal(false);
        setSelectedMember(null);
        loadMembers();
      } else {
        showError(response.error || 'Failed to save member');
      }
    } catch (err) {
      showError('Failed to save member');
      console.error('Error saving member:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedMember) return;
    
    setDeleteLoading(true);
    try {
      const response = await contactsService.deleteMember(
        parseInt(groupId),
        selectedMember.memberId,
        token
      );
      if (response.success) {
        success(`Successfully deleted: ${selectedMember.name}`);
        setShowDeleteModal(false);
        setSelectedMember(null);
        loadMembers();
      } else {
        showError(response.error || 'Failed to delete member');
      }
    } catch (err) {
      showError('Failed to delete member');
      console.error('Error deleting member:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={() => navigate({ to: '/contacts' })}
          className="btn btn-ghost" 
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Contact Groups
        </button>
      </div>

      {group && (
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.875rem', fontWeight: 700 }}>
            {group.name}
          </h1>
          {group.description && (
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              {group.description}
            </p>
          )}
        </div>
      )}

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        {canCreate && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Add Member
          </button>
        )}
      </div>

      <TableEngine
        schema={{
          ...membersTableSchema,
          onRefresh: handleRefresh,
          columns: membersTableSchema.columns.map((col) => {
            if (col.id === 'actions') {
              return {
                ...col,
                actions: [
                  ...(canEdit ? [{
                    label: 'Edit',
                    onClick: handleEdit,
                    variant: 'ghost' as const,
                  }] : []),
                  ...(canDelete ? [{
                    label: 'Delete',
                    onClick: handleDelete,
                    variant: 'danger' as const,
                  }] : []),
                ],
              };
            }
            return col;
          }),
        }}
        data={members}
        loading={loading}
        primaryColor="#3b82f6"
      />

      <Modal 
        isOpen={showMemberFormModal} 
        onClose={() => !formLoading && setShowMemberFormModal(false)} 
        title={selectedMember ? 'Edit Member' : 'Add Member'}
      >
        <FormEngine
          schema={memberFormSchema}
          initialValues={selectedMember ? {
            name: selectedMember.name,
            email: selectedMember.email || '',
            phoneNumber: selectedMember.phoneNumber || '',
            telegramHandle: selectedMember.telegramHandle || '',
          } : {}}
          onSubmit={handleFormSubmit}
        />
        {formLoading && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div className="spinner" />
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedMember?.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </>
  );
}

export const Route = createFileRoute('/contacts/$groupId/members')({
  component: ContactMembersPage,
});
