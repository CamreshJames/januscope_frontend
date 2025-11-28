/**
 * Export utilities for table data
 */

/**
 * Export data as CSV
 */
export const exportAsCSV = (data: any[], filename: string, columns?: { key: string; header: string }[]) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // If columns not provided, use all keys from first object
  const headers = columns 
    ? columns.map(col => col.header)
    : Object.keys(data[0]);
  
  const keys = columns 
    ? columns.map(col => col.key)
    : Object.keys(data[0]);

  const rows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      
      // Handle different data types
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (value instanceof Date) return value.toLocaleDateString();
      
      // Escape CSV special characters
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    });
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

/**
 * Export data as JSON
 */
export const exportAsJSON = (data: any[], filename: string) => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, `${filename}.json`, 'application/json');
};

/**
 * Export data using backend endpoint
 */
export const exportViaBackend = async (
  endpoint: string,
  format: 'csv' | 'json' | 'excel',
  filename: string,
  token: string
) => {
  try {
    const response = await fetch(`${endpoint}?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const extension = format === 'excel' ? '.xlsx' : format === 'json' ? '.json' : '.csv';
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `${filename}-${timestamp}${extension}`;
    
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

/**
 * Helper to download file
 */
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Generate filename with timestamp
 */
export const generateExportFilename = (baseName: string, format: 'csv' | 'json' | 'excel'): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'excel' ? '.xlsx' : format === 'json' ? '.json' : '.csv';
  return `${baseName}-export-${timestamp}${extension}`;
};
