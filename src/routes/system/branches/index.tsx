import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../../components/table-engine';
import { branchesTableSchema } from '../../../components/table-engine/systemSchemas';
import { systemAdminService } from '../../../services/januscope.service';
import { Modal } from '../../../components/Modal';
import { FormEngine } from '../../../components/form-engine/FormEngine';
import { EditIcon, TrashIcon, UploadIcon, BackIcon } from '../../../utils/icons';
import type { Branch } from '../../../types/januscope.types';
import type { FormSchema } from '../../../components/form-engine/types';
import { useToast } from '../../../contexts/ToastContext';

const branchFormSchema: FormSchema = {
  id: 'branch-form',
  meta: {
    title: 'Branch Details',
  },
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Branch Name',
      placeholder: 'e.g., Nairobi HQ, New York Office',
      rules: {
        required: 'Branch name is required',
      },
    },
    code: {
      id: 'code',
      renderer: 'text',
      label: 'Branch Code',
      placeholder: 'e.g., NBO-HQ, NYC-01',
    },
    countryCode: {
      id: 'countryCode',
      renderer: 'text',
      label: 'Country Code',
      placeholder: 'e.g., KE, US',
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    {
      kind: 'grid',
      cols: 2,
      children: [
        { kind: 'field', fieldId: 'code' },
        { kind: 'field', fieldId: 'countryCode' },
      ],
    },
  ],
};

function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const toast = useToast();

  const loadBranches = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.branches.getAll(token);
      if (response.success && response.data) {
        setBranches(response.data);
      }
    } catch (error) {
      toast.error('Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreate = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Branch) => {
    setEditingBranch(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const token = localStorage.getItem('accessToken') || '';
    
    try {
      if (editingBranch) {
        const response = await systemAdminService.branches.update(
          { ...data, branchId: editingBranch.branchId } as any,
          token
        );
        if (response.success) {
          toast.success('Branch updated successfully');
          loadBranches();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to update branch');
        }
      } else {
        const response = await systemAdminService.branches.create(data, token);
        if (response.success) {
          toast.success('Branch created successfully');
          loadBranches();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to create branch');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (row: Branch) => {
    if (!confirm(`Are you sure you want to delete ${row.name}?`)) return;
    
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.branches.delete(row.branchId, token);
      if (response.success) {
        toast.success('Branch deleted successfully');
        loadBranches();
      } else {
        toast.error(response.message || 'Failed to delete branch');
      }
    } catch (error) {
      toast.error('Failed to delete branch');
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
          <h1 style={{ margin: '0 0 8px 0' }}>Branches</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Manage company branches and offices
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/system/branches/bulk-import" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <UploadIcon width="16" height="16" />
            Bulk Import
          </Link>
          <button className="btn btn-primary" onClick={handleCreate}>
            + Add Branch
          </button>
        </div>
      </div>

      <TableEngine
        schema={{
          ...branchesTableSchema,
          onRefresh: loadBranches,
          columns: branchesTableSchema.columns.map((col) => {
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
        data={branches}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBranch ? 'Edit Branch' : 'Create Branch'}
        size="md"
      >
        <FormEngine
          schema={branchFormSchema}
          initialValues={editingBranch ? { name: editingBranch.name, code: editingBranch.code, countryCode: editingBranch.countryCode } : {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export const Route = createFileRoute('/system/branches/' as any)({
  component: BranchesPage,
});
