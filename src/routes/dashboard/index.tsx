import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { getUserRole, hasPermission } from '../../utils/permissions';
import { servicesService, systemService } from '../../services/januscope.service';

function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();

  const token = localStorage.getItem('accessToken') || '';
  const userRole = getUserRole();
  const canViewUsers = hasPermission('canViewUsers');
  const canViewSettings = hasPermission('canViewSettings');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [servicesResponse, statsResponse] = await Promise.all([
        servicesService.getAll(token),
        systemService.getStats(token),
      ]);

      if (servicesResponse.success && servicesResponse.data) {
        const services = servicesResponse.data;
        const activeServices = services.filter(s => s.active).length;
        const totalServices = services.length;

        setStats({
          totalServices,
          activeServices,
          inactiveServices: totalServices - activeServices,
          systemStats: statsResponse.data,
        });
      }
    } catch (err) {
      showError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Dashboard</h1>
        <span style={{
          padding: '6px 12px',
          borderRadius: '12px',
          background: userRole === 'admin' ? 'var(--primary-light)' : 'var(--bg-tertiary)',
          color: userRole === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
          fontSize: '14px',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {userRole}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div style={{
          background: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
            Total Services
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {stats?.totalServices || 0}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
            Active Services
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--success)' }}>
            {stats?.activeServices || 0}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-secondary)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>
            Inactive Services
          </h3>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: 'var(--text-muted)' }}>
            {stats?.inactiveServices || 0}
          </p>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>Welcome to Januscope</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Monitor your services, track SSL certificates, and receive instant alerts when issues occur.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="/services" className="btn btn-primary">
            View Services
          </a>
          <a href="/incidents" className="btn btn-secondary">
            View Incidents
          </a>
          <a href="/ssl" className="btn btn-secondary">
            SSL Certificates
          </a>
          {canViewUsers && (
            <a href="/users" className="btn btn-secondary">
              Manage Users
            </a>
          )}
          {canViewSettings && (
            <a href="/settings" className="btn btn-secondary">
              Settings
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
});
