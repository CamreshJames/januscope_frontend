import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '../../contexts/ToastContext';
import { downloadSample } from '../../utils/csvHelpers';
import { CloseIcon } from '../../utils/icons';
import { API_CONFIG } from '../../config/api.config';
import '../../routes/bulk-import.css';

const SUPPORTED_FORMATS = [
  { value: '.csv', label: 'CSV' },
  { value: '.xlsx', label: 'Excel (.xlsx)' },
  { value: '.xls', label: 'Excel (.xls)' },
  { value: '.json', label: 'JSON' },
  { value: '.xml', label: 'XML' },
];

interface BulkImportPageProps {
  title: string;
  subtitle: string;
  backPath: string;
  backLabel: string;
  apiEndpoint: string;
  sampleFiles: Array<{ filename: string; label: string }>;
}

export function BulkImportPage({
  title,
  subtitle,
  backPath,
  backLabel,
  apiEndpoint,
  sampleFiles,
}: BulkImportPageProps) {
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const token = localStorage.getItem('accessToken') || '';

  const handleFileSelect = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isSupported = SUPPORTED_FORMATS.some(format => format.value === extension);
    
    if (!isSupported) {
      showError(`Unsupported file format. Please use: ${SUPPORTED_FORMATS.map(f => f.label).join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showError('Please select a file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Build full URL with backend base URL
      const fullUrl = apiEndpoint.startsWith('http') 
        ? apiEndpoint 
        : `${API_CONFIG.API_BASE_PATH}${apiEndpoint}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (response.status === 404) {
          showError('Import endpoint not found. This feature may not be implemented yet.');
        } else {
          showError(`Server error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setImportResult(data.data);
        
        if (data.data.failureCount === 0) {
          success(`Successfully imported ${data.data.successCount} records`);
        } else {
          info(`Imported ${data.data.successCount} records with ${data.data.failureCount} failures`);
        }
      } else {
        showError(data.error || data.message || 'Import failed');
      }
    } catch (err: any) {
      showError(err.message || 'Import failed. Please check your file and try again.');
      console.error('Import error:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadSample = (filename: string) => {
    downloadSample(filename);
    info(`Sample file downloaded`);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
  };

  const handleGoBack = () => {
    navigate({ to: backPath });
  };

  return (
    <div className="bulk-import-container">
      <div className="bulk-import-header">
        <button onClick={handleGoBack} className="btn btn-ghost bulk-import-back-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLabel}
        </button>
        <h1 className="bulk-import-title">{title}</h1>
        <p className="bulk-import-subtitle">{subtitle}</p>
      </div>

      <div className="bulk-import-info-grid">
        <div className="bulk-import-section">
          <h3 className="bulk-import-section-title">Download Sample Templates</h3>
          <p className="bulk-import-section-subtitle">
            Download sample files to see the required format for bulk import
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
            {sampleFiles.map(({ filename, label }) => (
              <button 
                key={filename}
                className="btn btn-secondary" 
                onClick={() => handleDownloadSample(filename)}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bulk-import-formats">
          <h4 className="bulk-import-formats-title">Supported File Formats</h4>
          <div className="bulk-import-format-badges">
            {SUPPORTED_FORMATS.map(format => (
              <span key={format.value} className="bulk-import-format-badge">
                {format.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bulk-import-section">
        <h3 className="bulk-import-section-title">Upload File</h3>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`bulk-import-dropzone ${dragActive ? 'active' : ''}`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <svg 
            width="48" 
            height="48" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            className="bulk-import-dropzone-icon"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="bulk-import-dropzone-title">
            {dragActive ? 'Drop file here' : 'Drag and drop your file here'}
          </p>
          <p className="bulk-import-dropzone-subtitle">or click to browse</p>
          <input
            id="file-input"
            type="file"
            accept={SUPPORTED_FORMATS.map(f => f.value).join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </div>

        {selectedFile && (
          <div className="bulk-import-file-display">
            <div className="bulk-import-file-info">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <div className="bulk-import-file-name">{selectedFile.name}</div>
                <div className="bulk-import-file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </div>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={handleReset}
              disabled={importing}
              style={{ color: 'var(--danger)' }}
            >
              <CloseIcon width="16" height="16" />
            </button>
          </div>
        )}

        <div className="bulk-import-actions">
          <button className="btn btn-secondary" onClick={handleGoBack} disabled={importing}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!selectedFile || importing}
            style={{ minWidth: '120px' }}
          >
            {importing ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px' }} />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </button>
        </div>
      </div>

      {importResult && (
        <div className={`bulk-import-results ${importResult.failureCount === 0 ? 'success' : 'warning'}`}>
          <h3 className="bulk-import-results-title">Import Results</h3>
          
          <div className="bulk-import-stats">
            <div>
              <div className="bulk-import-stat-label">Total Records</div>
              <div className="bulk-import-stat-value">{importResult.totalRecords}</div>
            </div>
            <div>
              <div className="bulk-import-stat-label">Successful</div>
              <div className="bulk-import-stat-value success">{importResult.successCount}</div>
            </div>
            <div>
              <div className="bulk-import-stat-label">Failed</div>
              <div className={`bulk-import-stat-value ${importResult.failureCount > 0 ? 'warning' : ''}`}>
                {importResult.failureCount}
              </div>
            </div>
            <div>
              <div className="bulk-import-stat-label">Processing Time</div>
              <div className="bulk-import-stat-value">{importResult.processingTimeMs}ms</div>
            </div>
          </div>

          {importResult.errors && importResult.errors.length > 0 && (
            <div className="bulk-import-errors">
              <h4 className="bulk-import-errors-title">Errors:</h4>
              <div className="bulk-import-errors-list">
                {importResult.errors.map((error: string, idx: number) => (
                  <div key={idx} className="bulk-import-error-item">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bulk-import-results-actions">
            <button className="btn btn-primary" onClick={handleGoBack}>
              View {backLabel}
            </button>
            <button className="btn btn-secondary" onClick={handleReset}>
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
