import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../components/table-engine';
import { usersTableSchema } from '../../components/table-engine/examples';
import { Modal, ConfirmModal } from '../../components/Modal';
import { useToast } from '../../contexts/ToastContext';
import { usersService } from '../../services/januscope.service';
import type { User } from '../../types/januscope.types';
import { hasPermission } from '../../utils/permissions';

function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError, info } = useToast();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const token = localStorage.getItem('accessToken') || '';
  const canViewUsers = hasPermission('canViewUsers');
  const canManageUsers = hasPermission('canApproveUser');

  // Check permission on mount
  useEffect(() => {
    if (!canViewUsers) {
      showError('You do not have permission to view users');
      navigate({ to: '/' });
    }
  }, [canViewUsers]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersResponse = await usersService.getAll(token);
      if (usersResponse.success && usersResponse.data) {
        setUsers(usersResponse.data);
      }

      if (canManageUsers) {
        const pendingResponse = await usersService.getPending(token);
        if (pendingResponse.success && pendingResponse.data) {
          setPendingUsers(pendingResponse.data);
        }
      }
    } catch (err) {
      showError('Failed to load users');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    info('Refreshing users...');
    loadUsers();
  };

  const handleApprove = (row: User) => {
    setSelectedItem(row);
    setApprovalNotes('');
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      const response = await usersService.approve(
        selectedItem.userId || selectedItem.id,
        approvalNotes || undefined,
        token
      );
      if (response.success) {
        success(`User approved! Credentials sent to ${selectedItem.email}`);
        setShowApproveModal(false);
        setSelectedItem(null);
        setApprovalNotes('');
        loadUsers();
      } else {
        showError(response.error || 'Failed to approve user');
      }
    } catch (err) {
      showError('Failed to approve user');
      console.error('Error approving user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = (row: User) => {
    setSelectedItem(row);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      const response = await usersService.reject(
        selectedItem.userId || selectedItem.id,
        rejectionReason || undefined,
        token
      );
      if (response.success) {
        success(`User registration rejected`);
        setShowRejectModal(false);
        setSelectedItem(null);
        setRejectionReason('');
        loadUsers();
      } else {
        showError(response.error || 'Failed to reject user');
      }
    } catch (err) {
      showError('Failed to reject user');
      console.error('Error rejecting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (row: User) => {
    setSelectedItem(row);
    setShowEditModal(true);
  };

  const handleDelete = (row: User) => {
    setSelectedItem(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    
    setActionLoading(true);
    try {
      const response = await usersService.delete(selectedItem.userId || selectedItem.id, token);
      if (response.success) {
        success(`Successfully deleted user`);
        setShowDeleteModal(false);
        setSelectedItem(null);
        loadUsers();
      } else {
        showError(response.error || 'Failed to delete user');
      }
    } catch (err) {
      showError('Failed to delete user');
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const allUsers = [...users, ...pendingUsers];

  return (
    <>
      <TableEngine
        schema={{
          ...usersTableSchema,
          onRefresh: handleRefresh,
          columns: usersTableSchema.columns.map((col) => {
            if (col.id === 'actions') {
              return {
                ...col,
                actions: canManageUsers ? [
                  {
                    label: 'Approve',
                    onClick: handleApprove,
                    variant: 'primary' as const,
                    hidden: (row: User) => row.approved || !!row.username,
                  },
                  {
                    label: 'Reject',
                    onClick: handleReject,
                    variant: 'danger' as const,
                    hidden: (row: User) => row.approved || !!row.username,
                  },
                  {
                    label: 'Edit',
                    icon: col.actions?.[1]?.icon,
                    onClick: handleEdit,
                    variant: 'ghost' as const,
                    hidden: (row: User) => !row.approved && !row.username,
                  },
                  {
                    label: 'Delete',
                    icon: col.actions?.[2]?.icon,
                    onClick: handleDelete,
                    variant: 'danger' as const,
                  },
                ] : [],
              };
            }
            return col;
          }),
        }}
        data={allUsers}
        loading={loading}
        primaryColor="#ff6b35"
      />

      <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve User">
        <div style={{ padding: '20px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Approving: <strong>{selectedItem?.firstName} {selectedItem?.lastName}</strong> ({selectedItem?.email})
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
            A username and password will be automatically generated and sent to the user's email.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Notes (optional)
            </label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} disabled={actionLoading}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Approving...' : 'Approve User'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject User">
        <div style={{ padding: '20px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Rejecting: <strong>{selectedItem?.firstName} {selectedItem?.lastName}</strong> ({selectedItem?.email})
          </p>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Reason (optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                resize: 'vertical',
              }}
            />
          </div>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} disabled={actionLoading}>
              Cancel
            </button>
            <button
              className="btn"
              style={{ backgroundColor: '#dc3545', color: 'white' }}
              onClick={confirmReject}
              disabled={actionLoading}
            >
              {actionLoading ? 'Rejecting...' : 'Reject User'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        <div style={{ padding: '20px 0' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Editing: <strong>{selectedItem?.username}</strong>
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Edit functionality coming soon. Use the Form Engine to create an edit form.
          </p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete "${selectedItem?.username || selectedItem?.email}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={actionLoading}
      />
    </>
  );
}

export const Route = createFileRoute('/users/')({
  component: UsersPage,
});
