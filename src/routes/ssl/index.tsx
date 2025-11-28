import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine, type TableSchema } from '../../components/table-engine';
import { useToast } from '../../contexts/ToastContext';
import { servicesService } from '../../services/januscope.service';
import type { SSLCheck } from '../../types/januscope.types';

const sslTableSchema: TableSchema = {
  id: 'ssl-table',
  meta: {
    title: 'SSL Certificates',
    subtitle: 'Monitor SSL certificate status and expiry dates',
  },
  columns: [
    {
      id: 'serviceId',
      header: 'Service ID',
      accessor: 'serviceId',
      type: 'number',
      sortable: true,
      width: '100px',
    },
    {
      id: 'domain',
      header: 'Domain',
      accessor: 'domain',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      id: 'valid',
      header: 'Status',
      accessor: 'valid',
      type: 'custom',
      sortable: true,
      width: '120px',
      format: (value: boolean, row: any) => {
        const days = row.daysRemaining;
        if (!value) {
          return <span className="badge badge-danger">Invalid</span>;
        }
        if (days < 0) {
          return <span className="badge badge-danger">Expired</span>;
        }
        if (days <= 7) {
          return <span className="badge badge-danger">Expiring</span>;
        }
        if (days <= 30) {
          return <span className="badge badge-warning">Expiring Soon</span>;
        }
        return <span className="badge badge-success">Valid</span>;
      },
    },
    {
      id: 'issuer',
      header: 'Issuer',
      accessor: 'issuer',
      type: 'text',
      sortable: true,
      width: '200px',
    },
    {
      id: 'validTo',
      header: 'Expiry Date',
      accessor: 'validTo',
      type: 'date',
      sortable: true,
      width: '150px',
    },
    {
      id: 'daysRemaining',
      header: 'Days Remaining',
      accessor: 'daysRemaining',
      type: 'custom',
      sortable: true,
      width: '150px',
      format: (value: number) => {
        if (value < 0) {
          return <span style={{ color: 'var(--danger)' }}>Expired</span>;
        }
        if (value <= 7) {
          return <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{value} days</span>;
        }
        if (value <= 30) {
          return <span style={{ color: 'var(--warning)', fontWeight: 600 }}>{value} days</span>;
        }
        return <span style={{ color: 'var(--success)' }}>{value} days</span>;
      },
    },
    {
      id: 'lastCheckedAt',
      header: 'Last Checked',
      accessor: 'lastCheckedAt',
      type: 'date',
      sortable: true,
      width: '180px',
    },
  ],
  searchable: true,
  exportable: true,
  refreshable: true,
  pagination: {
    enabled: true,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

function SSLPage() {
  const [sslChecks, setSSLChecks] = useState<SSLCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { error: showError, info, warning } = useToast();

  const token = localStorage.getItem('accessToken') || '';

  const loadSSLChecks = async () => {
    setLoading(true);
    try {
      const servicesResponse = await servicesService.getAll(token);
      if (!servicesResponse.success || !servicesResponse.data) {
        showError('Failed to load services');
        setLoading(false);
        return;
      }

      // Filter HTTPS services by URL
      const httpsServices = servicesResponse.data.filter(s => s.url.startsWith('https://'));

      if (httpsServices.length === 0) {
        info('No HTTPS services found. Add HTTPS services to monitor SSL certificates.');
        setSSLChecks([]);
        setLoading(false);
        return;
      }

      const allSSLChecks: SSLCheck[] = [];
      let expiringCount = 0;
      let expiredCount = 0;

      for (const service of httpsServices) {
        try {
          const sslResponse = await servicesService.getSSLCertificate(service.serviceId, token);
          if (sslResponse.success && sslResponse.data) {
            allSSLChecks.push(sslResponse.data);
            const days = sslResponse.data.daysRemaining || 0;
            if (days < 0) {
              expiredCount++;
            } else if (days <= 30) {
              expiringCount++;
            }
          }
        } catch (err) {
          // SSL check not found is expected if checks haven't run yet
          const errorMsg = err instanceof Error ? err.message : String(err);
          if (!errorMsg.includes('404')) {
            console.error(`Error loading SSL check for service ${service.serviceId}:`, err);
          }
        }
      }

      setSSLChecks(allSSLChecks);
      
      if (expiredCount > 0) {
        warning(`${expiredCount} SSL certificate(s) have expired!`);
      } else if (expiringCount > 0) {
        warning(`${expiringCount} SSL certificate(s) expiring soon!`);
      }

      if (allSSLChecks.length === 0) {
        info('No SSL certificate data available yet. Checks will run automatically.');
      }
    } catch (err) {
      showError('Failed to load SSL certificates');
      console.error('Error loading SSL checks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSSLChecks();
  }, []);

  const handleRefresh = () => {
    info('Refreshing SSL certificates...');
    loadSSLChecks();
  };

  // Helper function to get status
  const getStatus = (check: SSLCheck) => {
    if (!check.isValid) return 'INVALID';
    const days = check.daysRemaining || 0;
    if (days < 0) return 'EXPIRED';
    if (days <= 30) return 'EXPIRING';
    return 'VALID';
  };

  // Filter SSL checks based on status
  const filteredSSLChecks = filterStatus === 'all' 
    ? sslChecks 
    : sslChecks.filter(check => getStatus(check) === filterStatus);

  // Calculate summary stats
  const stats = {
    total: sslChecks.length,
    valid: sslChecks.filter(c => getStatus(c) === 'VALID').length,
    expiring: sslChecks.filter(c => getStatus(c) === 'EXPIRING').length,
    expired: sslChecks.filter(c => getStatus(c) === 'EXPIRED').length,
    invalid: sslChecks.filter(c => getStatus(c) === 'INVALID').length,
  };

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          opacity: filterStatus === 'all' ? 1 : 0.7,
        }}
        onClick={() => setFilterStatus('all')}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Total Certificates
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats.total}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          opacity: filterStatus === 'VALID' ? 1 : 0.7,
        }}
        onClick={() => setFilterStatus('VALID')}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Valid
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--success)' }}>
            {stats.valid}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          opacity: filterStatus === 'EXPIRING' ? 1 : 0.7,
        }}
        onClick={() => setFilterStatus('EXPIRING')}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Expiring Soon
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--warning)' }}>
            {stats.expiring}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          cursor: 'pointer',
          opacity: filterStatus === 'EXPIRED' ? 1 : 0.7,
        }}
        onClick={() => setFilterStatus('EXPIRED')}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Expired
          </h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'var(--danger)' }}>
            {stats.expired}
          </p>
        </div>
      </div>

      {/* Filter indicator */}
      {filterStatus !== 'all' && (
        <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing <strong>{filterStatus}</strong> certificates ({filteredSSLChecks.length})
          </span>
          <button className="btn btn-secondary" onClick={() => setFilterStatus('all')} style={{ padding: '6px 12px', fontSize: '14px' }}>
            Clear Filter
          </button>
        </div>
      )}

      <TableEngine
        schema={{
          ...sslTableSchema,
          onRefresh: handleRefresh,
        }}
        data={filteredSSLChecks}
        loading={loading}
        primaryColor="#ff6b35"
      />
    </div>
  );
}

export const Route = createFileRoute('/ssl/')({
  component: SSLPage,
});
