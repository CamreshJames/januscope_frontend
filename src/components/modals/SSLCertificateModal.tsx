import { Modal } from '../Modal';

interface SSLCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName?: string;
  sslData: any;
  loading: boolean;
}

export function SSLCertificateModal({ isOpen, onClose, serviceName, sslData, loading }: SSLCertificateModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`SSL Certificate${serviceName ? ` - ${serviceName}` : ''}`}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading SSL certificate...</p>
        </div>
      ) : sslData ? (
        <div style={{ padding: '8px' }}>
          <div style={{ 
            display: 'grid', 
            gap: '20px',
            background: 'var(--bg-tertiary)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>Domain</label>
              <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                {sslData.domain || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>Valid From</label>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {sslData.validFrom ? new Date(sslData.validFrom).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>Valid To</label>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {sslData.validTo ? new Date(sslData.validTo).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>Days Remaining</label>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 700,
                color: sslData.daysRemaining > 30 ? 'var(--success)' : 
                       sslData.daysRemaining > 7 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {sslData.daysRemaining !== undefined ? `${sslData.daysRemaining} days` : 'N/A'}
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}>Issuer</label>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {sslData.issuer || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>Self-Signed</label>
                <div>
                  <span className={`badge ${sslData.selfSigned ? 'badge-warning' : 'badge-success'}`}>
                    {sslData.selfSigned ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 600, 
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}>Valid</label>
                <div>
                  <span className={`badge ${sslData.valid ? 'badge-success' : 'badge-danger'}`}>
                    {sslData.valid ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No SSL certificate data available for this service.</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>
            SSL certificates are checked automatically. Please wait for the next check cycle.
          </p>
        </div>
      )}
    </Modal>
  );
}
