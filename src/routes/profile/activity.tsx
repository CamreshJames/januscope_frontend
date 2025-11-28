import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../components/table-engine';
import type { TableSchema } from '../../components/table-engine/types';
import { useToast } from '../../hooks/useToast';

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

const activityTableSchema: TableSchema<ActivityLog> = {
  id: 'activity-log-table',
  meta: {
    title: '',
  },
  searchable: true,
  refreshable: true,
  pagination: {
    enabled: true,
    pageSize: 10,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 25, 50],
  },
  columns: [
    {
      id: 'action',
      header: 'Action',
      accessor: 'action',
      sortable: true,
      width: '150px',
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      sortable: false,
    },
    {
      id: 'ipAddress',
      header: 'IP Address',
      accessor: 'ipAddress',
      sortable: false,
      width: '140px',
    },
    {
      id: 'timestamp',
      header: 'Date & Time',
      accessor: 'timestamp',
      type: 'date',
      sortable: true,
      width: '180px',
      format: (value) => new Date(value).toLocaleString(),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      type: 'badge',
      sortable: true,
      width: '100px',
      badge: {
        success: { label: 'Success', color: 'success' },
        warning: { label: 'Warning', color: 'warning' },
        error: { label: 'Error', color: 'danger' },
      },
    },
  ],
};

function ProfileActivity() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { info } = useToast();

  const loadActivities = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockActivities: ActivityLog[] = [
        {
          id: 1,
          action: 'Login',
          description: 'Successful login',
          ipAddress: '192.168.1.100',
          timestamp: new Date().toISOString(),
          status: 'success',
        },
        {
          id: 2,
          action: 'Profile Update',
          description: 'Updated profile',
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          status: 'success',
        },
        {
          id: 3,
          action: 'Password Change',
          description: 'Changed password',
          ipAddress: '192.168.1.100',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          status: 'success',
        },
      ];
      
      setActivities(mockActivities);
    } catch (err) {
      console.error('Error loading activities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleRefresh = () => {
    info('Refreshing...');
    loadActivities();
  };

  return (
    <>
      {/* Back Button */}
      <div style={{ marginBottom: '16px' }}>
        <a href="/profile" className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </a>
      </div>

      <div className="profile-section-header">
        <h2 className="profile-section-title">Activity Log</h2>
      </div>

      <TableEngine
        schema={{
          ...activityTableSchema,
          onRefresh: handleRefresh,
        }}
        data={activities}
        loading={loading}
        primaryColor="#ff6b35"
      />
    </>
  );
}

export const Route = createFileRoute('/profile/activity')({
  component: ProfileActivity,
});
