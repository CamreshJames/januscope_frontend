import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { servicesService, usersService } from '../services/januscope.service';

interface DashboardStats {
  activeServices: number;
  totalServices: number;
  openIncidents: number;
  approvedUsers: number;
}

// Landing page for non-logged-in users
function LandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-orange) 0%, #ff8c5a 100%)',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '600px',
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: 'var(--primary-orange)',
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>
          Januscope
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)',
          marginBottom: '32px'
        }}>
          Uptime & SSL Monitoring System
        </p>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Features
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--primary-orange)', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>Real-time service monitoring</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--primary-orange)', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>SSL certificate tracking</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--primary-orange)', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>Instant notifications</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--primary-orange)', fontSize: '1.25rem' }}>✓</span>
              <span style={{ color: 'var(--text-secondary)' }}>Comprehensive analytics</span>
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/auth/login" 
            className="btn btn-primary"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'var(--primary-orange)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Sign In
          </Link>
          <Link 
            to="/auth/register" 
            className="btn btn-secondary"
            style={{
              padding: '14px 32px',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px',
              background: 'white',
              color: 'var(--primary-orange)',
              border: '2px solid var(--primary-orange)',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Request Access
          </Link>
        </div>

        <p style={{ 
          marginTop: '24px', 
          fontSize: '0.875rem', 
          color: 'var(--text-muted)' 
        }}>
          New users require admin approval
        </p>
      </div>
    </div>
  );
}

// Dashboard for logged-in users
function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeServices: 0,
    totalServices: 0,
    openIncidents: 0,
    approvedUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        const isAdmin = user.role === 'admin' || user.roleName === 'admin';

        // Fetch services (all users can see)
        const servicesRes = await servicesService.getAll(token);
        
        // Only admins can fetch users
        let usersRes = null;
        if (isAdmin) {
          usersRes = await usersService.getAll(token);
        }

        if (servicesRes.success) {
          const services = servicesRes.data || [];
          const users = usersRes?.data || [];

          setStats({
            activeServices: services.filter((s: any) => s.active || s.isActive).length,
            totalServices: services.length,
            openIncidents: 0, // Will be calculated from services
            approvedUsers: isAdmin ? users.filter((u: any) => u.approved || u.isApproved).length : 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Monitor your services and infrastructure</p>
      </div>

      <div className="card">
        <div className="card-header">Welcome to Januscope</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Your uptime and SSL monitoring system. Navigate using the sidebar or quick links below.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/services" className="btn btn-primary">
            View Services
          </Link>
          <Link to="/users" className="btn btn-secondary">
            View Users
          </Link>
          <Link to="/incidents" className="btn btn-secondary">
            View Incidents
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">Quick Stats</div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading dashboard data...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginTop: '16px',
              }}
            >
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: 'var(--primary-orange)' }}>
                  {stats.activeServices}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Active Services
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#ef4444' }}>
                  {stats.openIncidents}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Open Incidents
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#10b981' }}>
                  {stats.approvedUsers}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Approved Users
                </div>
              </div>
              <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
                  {stats.totalServices}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Total Services
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main component that decides which view to show
function IndexPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!(token && user));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  return isLoggedIn ? <Dashboard /> : <LandingPage />;
}

export const Route = createFileRoute('/')({
  component: IndexPage,
});
