import { Modal } from '../Modal';
import { TableEngine, type TableSchema } from '../table-engine';
import type { ContactMember } from '../../types/januscope.types';

const membersTableSchema: TableSchema = {
  id: 'group-members-table',
  meta: {
    title: 'Group Members',
  },
  columns: [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      width: '150px',
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      type: 'text',
      sortable: true,
      width: '200px',
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
  ],
  searchable: true,
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 20],
  },
};

interface ViewGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
  members: ContactMember[];
  loading: boolean;
  onAddMember?: () => void;
  canCreate?: boolean;
}

export function ViewGroupMembersModal(props: ViewGroupMembersModalProps) {
  const { isOpen, onClose, groupName, members, loading, onAddMember, canCreate } = props;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Members${groupName ? ` - ${groupName}` : ''}`}
      size="lg"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading members...</p>
        </div>
      ) : (
        <>
          {canCreate && onAddMember && (
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={onAddMember}>
                + Add Member
              </button>
            </div>
          )}
          {members.length > 0 ? (
            <TableEngine
              schema={membersTableSchema}
              data={members}
              loading={false}
              primaryColor="#3b82f6"
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No members in this group yet.</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
                Add members to start receiving notifications.
              </p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
