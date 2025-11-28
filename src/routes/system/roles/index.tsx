import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../../components/table-engine';
import { rolesTableSchema } from '../../../components/table-engine/systemSchemas';
import { systemAdminService } from '../../../services/januscope.service';
import { Modal } from '../../../components/Modal';
import { FormEngine } from '../../../components/form-engine/FormEngine';
import { EditIcon, TrashIcon, BackIcon } from '../../../utils/icons';
import type { Role } from '../../../types/januscope.types';
import type { FormSchema } from '../../../components/form-engine/types';
import { useToast } from '../../../contexts/ToastContext';

const roleFormSchema: FormSchema = {
  id: 'role-form',
  meta: {
    title: 'Role Details',
  },
  fields: {
    roleName: {
      id: 'roleName',
      renderer: 'text',
      label: 'Role Name',
      placeholder: 'e.g., Administrator, Manager',
      rules: {
        required: 'Role name is required',
      },
    },
    description: {
      id: 'description',
      renderer: 'textarea',
      label: 'Description',
      placeholder: 'Describe the role and its responsibilities',
      props: {
        minRows: 3,
      },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'roleName' },
    { kind: 'field', fieldId: 'description' },
  ],
};

function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const toast = useToast();

  const loadRoles = async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.roles.getAll(token);
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleCreate = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Role) => {
    setEditingRole(row);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const token = localStorage.getItem('accessToken') || '';
    
    try {
      if (editingRole) {
        const response = await systemAdminService.roles.update(
          { ...data, roleId: editingRole.roleId } as any,
          token
        );
        if (response.success) {
          toast.success('Role updated successfully');
          loadRoles();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to update role');
        }
      } else {
        const response = await systemAdminService.roles.create(data, token);
        if (response.success) {
          toast.success('Role created successfully');
          loadRoles();
          setIsModalOpen(false);
        } else {
          toast.error(response.message || 'Failed to create role');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (row: Role) => {
    if (!confirm(`Are you sure you want to delete ${row.roleName}?`)) return;
    
    const token = localStorage.getItem('accessToken') || '';
    try {
      const response = await systemAdminService.roles.delete(row.roleId, token);
      if (response.success) {
        toast.success('Role deleted successfully');
        loadRoles();
      } else {
        toast.error(response.message || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
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
          <h1 style={{ margin: '0 0 8px 0' }}>Roles</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Manage user roles and permissions
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreate}>
          + Add Role
        </button>
      </div>

      <TableEngine
        schema={{
          ...rolesTableSchema,
          onRefresh: loadRoles,
          columns: rolesTableSchema.columns.map((col) => {
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
        data={roles}
        loading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Create Role'}
        size="md"
      >
        <FormEngine
          schema={roleFormSchema}
          initialValues={editingRole ? { roleName: editingRole.roleName, description: editingRole.description } : {}}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export const Route = createFileRoute('/system/roles/' as any)({
  component: RolesPage,
});
