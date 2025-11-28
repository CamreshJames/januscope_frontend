import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { servicesService, contactsService } from '../../services/januscope.service';
import { getTokens } from '../../utils/tokenManager';
import { useToast } from '../../contexts/ToastContext';
import type { Service, SSLCheck, ContactGroup } from '../../types/januscope.types';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function ChartsPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [sslChecks, setSslChecks] = useState<SSLCheck[]>([]);
  const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
  const { error: showError } = useToast();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { accessToken } = getTokens();
      if (!accessToken) return;

      // Load services and contact groups
      const [servicesRes, contactsRes] = await Promise.all([
        servicesService.getAll(accessToken),
        contactsService.getAll(accessToken),
      ]);

      const allServices = servicesRes.data || [];
      setServices(allServices);
      setContactGroups(contactsRes.data || []);

      // Load SSL certificates for HTTPS services
      const httpsServices = allServices.filter(s => s.url.startsWith('https://'));
      const sslPromises = httpsServices.map(service => 
        servicesService.getSSLCertificate(service.serviceId, accessToken)
          .then(res => res.success && res.data ? res.data : null)
          .catch(() => null)
      );

      const sslResults = await Promise.all(sslPromises);
      const validSSLChecks = sslResults.filter((ssl): ssl is SSLCheck => ssl !== null);
      setSslChecks(validSSLChecks);
    } catch (err: any) {
      showError(err.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Calculate metrics
  const downServices = services.filter(s => s.active && s.currentStatus === 'DOWN');
  const activeServices = services.filter(s => s.active && !s.deleted);
  const upServices = services.filter(s => s.currentStatus === 'UP');
  const sslExpiringSoon = sslChecks.filter(s => {
    const days = s.daysRemaining || 0;
    return days <= 30 && days > 0;
  });
  const sslExpired = sslChecks.filter(s => (s.daysRemaining || 0) <= 0);
  const sslCritical = [...sslExpiringSoon, ...sslExpired];
  const uptimePercentage = activeServices.length > 0 
    ? ((upServices.length / activeServices.length) * 100).toFixed(1) 
    : '0.0';

  // Services Status Chart Data
  const servicesStatusData = {
    labels: ['Active', 'Inactive', 'Up', 'Down'],
    datasets: [{
      label: 'Services',
      data: [
        services.filter(s => s.active && !s.deleted).length,
        services.filter(s => !s.active || s.deleted).length,
        services.filter(s => s.currentStatus === 'UP').length,
        services.filter(s => s.currentStatus === 'DOWN').length,
      ],
      backgroundColor: ['#10b981', '#6b7280', '#3b82f6', '#ef4444'],
      borderWidth: 0,
    }],
  };

  // SSL Certificates Status
  const sslStatusData = {
    labels: ['Valid', 'Expiring Soon (<30d)', 'Expired', 'Invalid'],
    datasets: [{
      label: 'SSL Certificates',
      data: [
        sslChecks.filter(s => {
          const valid = (s as any).valid !== undefined ? (s as any).valid : s.isValid;
          return valid && (s.daysRemaining || 0) > 30;
        }).length,
        sslChecks.filter(s => {
          const valid = (s as any).valid !== undefined ? (s as any).valid : s.isValid;
          return valid && (s.daysRemaining || 0) <= 30 && (s.daysRemaining || 0) > 0;
        }).length,
        sslChecks.filter(s => (s.daysRemaining || 0) <= 0).length,
        sslChecks.filter(s => {
          const valid = (s as any).valid !== undefined ? (s as any).valid : s.isValid;
          return !valid && (s.daysRemaining || 0) > 0;
        }).length,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6b7280'],
      borderWidth: 0,
    }],
  };

  // Service Response Times (Bar Chart)
  const responseTimeData = {
    labels: services.slice(0, 10).map(s => s.name.length > 15 ? s.name.substring(0, 15) + '...' : s.name),
    datasets: [{
      label: 'Avg Response Time (ms)',
      data: services.slice(0, 10).map(() => Math.floor(Math.random() * 500) + 50), // Mock data - replace with real stats
      backgroundColor: '#3b82f6',
      borderRadius: 4,
    }],
  };

  // SSL Expiry Timeline - Show ALL services with SSL checks
  const sslExpiryData = {
    labels: sslChecks.map(s => {
      const name = s.domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      return name.length > 25 ? name.substring(0, 25) + '...' : name;
    }),
    datasets: [{
      label: 'Days Until Expiry',
      data: sslChecks.map(s => s.daysRemaining || 0),
      backgroundColor: sslChecks.map(s => {
        const days = s.daysRemaining || 0;
        if (days <= 0) return '#ef4444';
        if (days <= 30) return '#f59e0b';
        if (days <= 60) return '#fb923c';
        return '#10b981';
      }),
      borderRadius: 4,
    }],
  };

  // Contact Groups Distribution
  const contactGroupsData = {
    labels: contactGroups.map(g => g.name),
    datasets: [{
      label: 'Contact Groups',
      data: contactGroups.map(() => Math.floor(Math.random() * 20) + 1), // Mock member count
      backgroundColor: [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
      ],
      borderWidth: 0,
    }],
  };

  // Service Uptime Trend (Line Chart)
  const uptimeTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Average Uptime %',
      data: [99.2, 99.5, 98.8, 99.9, 99.1, 99.7, 99.4],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--text-primary)',
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: 'var(--bg-secondary)',
        titleColor: 'var(--text-primary)',
        bodyColor: 'var(--text-secondary)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'var(--border-color)' },
        ticks: { color: 'var(--text-secondary)' },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--text-secondary)' },
      },
    },
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: isFullscreen ? '0' : '24px',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 9999 : 'auto',
      background: 'var(--bg-primary)',
      overflow: isFullscreen ? 'auto' : 'visible',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px', 
        padding: isFullscreen ? '24px 24px 0' : '0' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0' }}>Analytics Dashboard</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time monitoring and insights
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={toggleFullscreen}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* Alert Banner for Down Services */}
      {downServices.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          border: '2px solid #b91c1c',
          borderRadius: 'var(--border-radius-lg)',
          padding: '16px 20px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          margin: isFullscreen ? '0 24px 16px' : '0 0 16px',
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#fff',
            animation: 'blink 1s ease-in-out infinite',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              ALERT: {downServices.length} Service{downServices.length > 1 ? 's' : ''} Down
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.9)' }}>
              {downServices.map(s => s.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '20px',
        padding: isFullscreen ? '0 24px' : '0',
      }}>
        {/* Total Services */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}>
            S
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{services.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Total Services</div>
          </div>
        </div>

        {/* Services Up */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: '#10b981' }}>{upServices.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Services Up</div>
          </div>
        </div>

        {/* Services Down */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>
            ✕
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: '#ef4444' }}>{downServices.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Services Down</div>
          </div>
        </div>

        {/* Uptime % */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}>
            %
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{uptimePercentage}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Uptime</div>
          </div>
        </div>

        {/* SSL Certificates */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}>
            SSL
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{sslChecks.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>SSL Certs</div>
          </div>
        </div>

        {/* SSL Critical */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.5rem',
          }}>
            !
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, color: '#f59e0b' }}>{sslCritical.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>SSL Expiring</div>
          </div>
        </div>

        {/* Contact Groups */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.125rem',
          }}>
            CG
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{contactGroups.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Contact Groups</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isFullscreen ? 'repeat(auto-fit, minmax(450px, 1fr))' : 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        padding: isFullscreen ? '0 24px 24px' : '0'
      }}>
        {/* Services Status Chart */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Services Status</h3>
          <div style={{ height: '280px' }}>
            <Pie data={servicesStatusData} options={chartOptions} />
          </div>
        </div>

        {/* SSL Certificates Status */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>SSL Certificates Status</h3>
          <div style={{ height: '280px' }}>
            <Pie data={sslStatusData} options={chartOptions} />
          </div>
        </div>

        {/* SSL Expiry Timeline - Full Width */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
          gridColumn: isFullscreen ? 'span 2' : 'span 1',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>
            SSL Certificate Expiry Timeline ({sslChecks.length} certificates)
          </h3>
          <div style={{ height: '320px', overflowX: 'auto' }}>
            {sslChecks.length > 0 ? (
              <Bar data={sslExpiryData} options={{
                ...barChartOptions,
                indexAxis: 'y' as const,
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: { color: 'var(--border-color)' },
                    ticks: { color: 'var(--text-secondary)' },
                    title: {
                      display: true,
                      text: 'Days Until Expiry',
                      color: 'var(--text-primary)',
                    },
                  },
                  y: {
                    grid: { display: false },
                    ticks: { color: 'var(--text-secondary)', font: { size: 10 } },
                  },
                },
              }} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No SSL certificates to display
              </div>
            )}
          </div>
        </div>

        {/* Service Uptime Trend */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Weekly Uptime Trend</h3>
          <div style={{ height: '280px' }}>
            <Line data={uptimeTrendData} options={barChartOptions} />
          </div>
        </div>

        {/* Response Times */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Response Times (Top 10)</h3>
          <div style={{ height: '280px' }}>
            <Bar data={responseTimeData} options={barChartOptions} />
          </div>
        </div>

        {/* Contact Groups Distribution */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600 }}>Contact Groups</h3>
          <div style={{ height: '280px' }}>
            {contactGroups.length > 0 ? (
              <Pie data={contactGroupsData} options={chartOptions} />
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No contact groups available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

export const Route = createFileRoute('/charts/' as any)({
  component: ChartsPage,
});

