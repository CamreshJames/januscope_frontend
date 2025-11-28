import { createFileRoute, Link } from '@tanstack/react-router';

function SystemIndex() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>System Administration</h1>
      <p style={{ marginBottom: '32px', color: 'var(--text-secondary)' }}>
        Manage system reference data and configuration
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        <Link to="/system/roles" className="system-card" {...({} as any)}>
          <h3>Roles</h3>
          <p>Manage user roles and permissions</p>
        </Link>

        <Link to="/system/countries" className="system-card" {...({} as any)}>
          <h3>Countries</h3>
          <p>Manage country reference data</p>
        </Link>

        <Link to="/system/branches" className="system-card" {...({} as any)}>
          <h3>Branches</h3>
          <p>Manage organizational branches</p>
        </Link>

        <Link to="/system/locations" className="system-card" {...({} as any)}>
          <h3>Locations</h3>
          <p>Manage hierarchical locations</p>
        </Link>

        <Link to="/system/templates" className="system-card" {...({} as any)}>
          <h3>Notification Templates</h3>
          <p>Manage email and notification templates</p>
        </Link>
      </div>

      <style>{`
        .system-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          padding: 24px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .system-card:hover {
          border-color: var(--primary-orange);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .system-card h3 {
          margin: 0 0 8px 0;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .system-card p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}

export const Route = createFileRoute('/system/' as any)({
  component: SystemIndex,
});
