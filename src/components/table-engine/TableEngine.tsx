import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type {
  TableSchema,
  TableState,
  Column,
  SortDirection,
  ColumnFilter,
} from './types';
import { SearchIcon, SortIcon, RefreshIcon } from '../../utils/icons';
import './TableEngine.css';

interface Props<T = any> {
  schema: TableSchema<T>;
  data: T[];
  loading?: boolean;
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// Helper to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper to apply filters
const applyFilters = (data: any[], filters: Record<string, ColumnFilter>, columns: Column[]): any[] => {
  return data.filter((row) => {
    return Object.entries(filters).every(([columnId, filter]) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column) return true;

      const value =
        typeof column.accessor === 'function'
          ? column.accessor(row)
          : getNestedValue(row, column.accessor);

      const filterValue = filter.value;

      switch (filter.operator) {
        case 'equals':
          return value === filterValue;
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
        case 'gt':
          return Number(value) > Number(filterValue);
        case 'lt':
          return Number(value) < Number(filterValue);
        default:
          return true;
      }
    });
  });
};

// Helper to apply search
const applySearch = (data: any[], query: string, columns: Column[]): any[] => {
  if (!query.trim()) return data;

  const lowerQuery = query.toLowerCase();
  return data.filter((row) => {
    return columns.some((column) => {
      if (column.type === 'actions') return false;

      const value =
        typeof column.accessor === 'function'
          ? column.accessor(row)
          : getNestedValue(row, column.accessor);

      return String(value).toLowerCase().includes(lowerQuery);
    });
  });
};

// Helper to apply sorting
const applySort = (data: any[], sortColumn: string | null, sortDirection: SortDirection, columns: Column[]): any[] => {
  if (!sortColumn || !sortDirection) return data;

  const column = columns.find((col) => col.id === sortColumn);
  if (!column) return data;

  return [...data].sort((a, b) => {
    const aValue =
      typeof column.accessor === 'function' ? column.accessor(a) : getNestedValue(a, column.accessor);
    const bValue =
      typeof column.accessor === 'function' ? column.accessor(b) : getNestedValue(b, column.accessor);

    if (aValue === bValue) return 0;

    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });
};

export const TableEngine = <T extends Record<string, any>>({
  schema,
  data,
  loading = false,
  className = '',
  primaryColor,
  secondaryColor,
}: Props<T>) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // State
  const [state, setState] = useState<TableState>({
    page: 1,
    pageSize: schema.pagination?.pageSize || 10,
    sortColumn: null,
    sortDirection: null,
    filters: {},
    searchQuery: '',
    selectedRows: [],
  });

  // Visible columns
  const visibleColumns = useMemo(() => {
    return schema.columns.filter((col) => !col.hidden);
  }, [schema.columns]);

  // Process data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (state.searchQuery && schema.searchable) {
      result = applySearch(result, state.searchQuery, visibleColumns);
    }

    // Apply filters
    result = applyFilters(result, state.filters, visibleColumns);

    // Apply sorting
    result = applySort(result, state.sortColumn, state.sortDirection, visibleColumns);

    return result;
  }, [data, state.searchQuery, state.filters, state.sortColumn, state.sortDirection, visibleColumns, schema.searchable]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!schema.pagination?.enabled) return processedData;

    const start = (state.page - 1) * state.pageSize;
    const end = start + state.pageSize;
    return processedData.slice(start, end);
  }, [processedData, state.page, state.pageSize, schema.pagination]);

  const totalPages = Math.ceil(processedData.length / state.pageSize);

  // Actions
  const handleSort = useCallback((columnId: string) => {
    setState((prev) => {
      if (prev.sortColumn === columnId) {
        const newDirection = prev.sortDirection === 'asc' ? 'desc' : prev.sortDirection === 'desc' ? null : 'asc';
        return {
          ...prev,
          sortColumn: newDirection ? columnId : null,
          sortDirection: newDirection,
        };
      }
      return {
        ...prev,
        sortColumn: columnId,
        sortDirection: 'asc',
      };
    });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setState((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query, page: 1 }));
  }, []);

  const handleRowSelect = useCallback(
    (row: T) => {
      if (!schema.selection?.enabled) return;

      setState((prev) => {
        const isSelected = prev.selectedRows.some((r) => r === row);

        if (schema.selection?.mode === 'single') {
          const newSelection = isSelected ? [] : [row];
          schema.selection?.onSelectionChange?.(newSelection);
          return { ...prev, selectedRows: newSelection };
        }

        const newSelection = isSelected
          ? prev.selectedRows.filter((r) => r !== row)
          : [...prev.selectedRows, row];
        schema.selection?.onSelectionChange?.(newSelection);
        return { ...prev, selectedRows: newSelection };
      });
    },
    [schema.selection]
  );

  const handleSelectAll = useCallback(() => {
    if (!schema.selection?.enabled || schema.selection.mode === 'single') return;

    setState((prev) => {
      const allSelected = prev.selectedRows.length === paginatedData.length;
      const newSelection = allSelected ? [] : [...paginatedData];
      schema.selection?.onSelectionChange?.(newSelection);
      return { ...prev, selectedRows: newSelection };
    });
  }, [schema.selection, paginatedData]);

  const handleExport = useCallback((format: 'csv' | 'json' | 'excel') => {
    // If custom export handler is provided, use it
    if (schema.onExport) {
      schema.onExport(format, processedData);
      return;
    }

    // Otherwise, export the current table data
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${schema.id}-export-${timestamp}`;

    if (format === 'json') {
      // Export as JSON
      const jsonStr = JSON.stringify(processedData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (format === 'csv') {
      // Export as CSV
      const headers = visibleColumns
        .filter(col => col.type !== 'actions')
        .map(col => col.header);
      
      const rows = processedData.map(row => {
        return visibleColumns
          .filter(col => col.type !== 'actions')
          .map(col => {
            const value = typeof col.accessor === 'function' 
              ? col.accessor(row) 
              : getNestedValue(row, col.accessor);
            
            // Handle different data types
            if (value === null || value === undefined) return '';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            if (col.type === 'date' && value) {
              return new Date(value).toLocaleDateString();
            }
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

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else if (format === 'excel') {
      // For Excel, try to use backend if available, otherwise fall back to CSV
      const token = localStorage.getItem('accessToken') || '';
      const url = `/api/v1/bulk/export?format=excel`;
      
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => {
          if (!response.ok) throw new Error('Backend export not available');
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(() => {
          // Fallback to CSV if Excel export fails
          alert('Excel export not available. Downloading as CSV instead.');
          handleExport('csv');
        });
    }
  }, [schema, processedData, visibleColumns]);

  // Apply theming
  useEffect(() => {
    if (!tableRef.current) return;

    const tableElement = tableRef.current;
    const schemaPrimary = schema.meta.theme?.primaryColor;
    const schemaSecondary = schema.meta.theme?.secondaryColor;
    const finalPrimary = primaryColor || schemaPrimary;
    const finalSecondary = secondaryColor || schemaSecondary;

    tableElement.classList.remove('table-themed');

    if (finalPrimary || finalSecondary) {
      tableElement.classList.add('table-themed');

      if (finalPrimary) {
        tableElement.style.setProperty('--table-primary', finalPrimary);
      }
      if (finalSecondary) {
        tableElement.style.setProperty('--table-secondary', finalSecondary);
      }
    }

    return () => {
      if (tableElement) {
        tableElement.classList.remove('table-themed');
        tableElement.style.removeProperty('--table-primary');
        tableElement.style.removeProperty('--table-secondary');
      }
    };
  }, [primaryColor, secondaryColor, schema.meta.theme]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.export-dropdown-menu') as HTMLElement;
      const button = document.querySelector('.table-export-dropdown button') as HTMLElement;
      
      if (dropdown && dropdown.style.display === 'block') {
        if (!dropdown.contains(event.target as Node) && !button?.contains(event.target as Node)) {
          dropdown.style.display = 'none';
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render cell content
  const renderCell = (column: Column<T>, row: T) => {
    const value = typeof column.accessor === 'function' ? column.accessor(row) : getNestedValue(row, column.accessor);

    if (column.format) {
      return column.format(value, row);
    }

    switch (column.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      case 'badge':
        if (column.badge && column.badge[value]) {
          const badgeConfig = column.badge[value];
          return <span className={`table-badge badge-${badgeConfig.color}`}>{badgeConfig.label}</span>;
        }
        return value;
      case 'actions':
        return (
          <div className="table-actions">
            {column.actions?.map((action, idx) => {
              if (action.hidden?.(row)) return null;
              return (
                <button
                  key={idx}
                  className={`table-action-btn btn-${action.variant || 'ghost'}`}
                  onClick={() => action.onClick(row)}
                  disabled={action.disabled?.(row)}
                  title={action.label}
                >
                  {action.icon}
                  {action.label}
                </button>
              );
            })}
          </div>
        );
      default:
        return value ?? '-';
    }
  };

  const isRowSelected = (row: T) => state.selectedRows.includes(row);
  const allSelected = paginatedData.length > 0 && state.selectedRows.length === paginatedData.length;

  return (
    <div
      ref={tableRef}
      className={`table-engine ${className} ${schema.meta.theme?.compact ? 'compact' : ''} ${
        schema.meta.theme?.bordered ? 'bordered' : ''
      }`}
    >
      {/* Header */}
      {(schema.meta.title || schema.searchable || schema.refreshable || schema.exportable) && (
        <div className="table-header">
          <div className="table-header-left">
            {schema.meta.title && (
              <div className="table-title-section">
                <h3 className="table-title">{schema.meta.title}</h3>
                {schema.meta.subtitle && <p className="table-subtitle">{schema.meta.subtitle}</p>}
              </div>
            )}
          </div>
          <div className="table-header-right">
            {schema.searchable && (
              <div className="table-search">
                <SearchIcon className="search-icon" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={state.searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input"
                />
              </div>
            )}
            {schema.exportable && (
              <div className="table-export-dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                <button 
                  className="table-btn btn-secondary" 
                  onClick={(e) => {
                    const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                    if (dropdown) {
                      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    }
                  }}
                  title="Export"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                </button>
                <div 
                  className="export-dropdown-menu"
                  style={{
                    display: 'none',
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    minWidth: '150px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      handleExport('csv');
                      (document.querySelector('.export-dropdown-menu') as HTMLElement).style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      handleExport('excel');
                      (document.querySelector('.export-dropdown-menu') as HTMLElement).style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => {
                      handleExport('json');
                      (document.querySelector('.export-dropdown-menu') as HTMLElement).style.display = 'none';
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      borderTop: '1px solid var(--border-color)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
            {schema.refreshable && (
              <button className="table-btn btn-secondary" onClick={schema.onRefresh} title="Refresh">
                <RefreshIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="table-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <table
            className={`table ${schema.meta.theme?.stripedRows ? 'striped' : ''} ${
              schema.meta.theme?.hoverRows ? 'hover' : ''
            }`}
          >
            <thead>
              <tr>
                {schema.selection?.enabled && (
                  <th className="table-cell-checkbox">
                    {schema.selection.mode === 'multiple' && (
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    )}
                  </th>
                )}
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    className={`table-header-cell ${column.sortable ? 'sortable' : ''} ${
                      column.sticky ? `sticky-${column.sticky}` : ''
                    }`}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth,
                      maxWidth: column.maxWidth,
                      textAlign: column.align || 'left',
                    }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="header-content">
                      <span>{column.header}</span>
                      {column.sortable && (
                        <span className="sort-indicator">
                          {state.sortColumn === column.id && state.sortDirection === 'asc' && '↑'}
                          {state.sortColumn === column.id && state.sortDirection === 'desc' && '↓'}
                          {state.sortColumn !== column.id && <SortIcon className="sort-icon" />}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + (schema.selection?.enabled ? 1 : 0)} className="table-empty">
                    No data available
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`${isRowSelected(row) ? 'selected' : ''} ${
                      schema.selection?.enabled ? 'selectable' : ''
                    }`}
                  >
                    {schema.selection?.enabled && (
                      <td className="table-cell-checkbox">
                        <input
                          type={schema.selection.mode === 'single' ? 'radio' : 'checkbox'}
                          checked={isRowSelected(row)}
                          onChange={() => handleRowSelect(row)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className={`table-cell ${column.sticky ? `sticky-${column.sticky}` : ''}`}
                        style={{ textAlign: column.align || 'left' }}
                      >
                        {renderCell(column, row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {schema.pagination?.enabled && !loading && processedData.length > 0 && (
        <div className="table-pagination">
          <div className="pagination-info">
            {schema.pagination.showTotal && (
              <span className="pagination-total">
                Showing {(state.page - 1) * state.pageSize + 1} to{' '}
                {Math.min(state.page * state.pageSize, processedData.length)} of {processedData.length} entries
              </span>
            )}
          </div>
          <div className="pagination-controls">
            {schema.pagination.showPageSize && (
              <select
                value={state.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="page-size-select"
              >
                {(schema.pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(state.page - 1)}
                disabled={state.page === 1}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (state.page <= 3) {
                  pageNum = i + 1;
                } else if (state.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = state.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${state.page === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(state.page + 1)}
                disabled={state.page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
