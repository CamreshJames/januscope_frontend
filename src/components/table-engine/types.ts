// Table Engine Types

export type ColumnType =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'badge'
  | 'actions'
  | 'custom';

export type SortDirection = 'asc' | 'desc' | null;

export type FilterOperator = 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'between';

export interface ColumnFilter {
  operator: FilterOperator;
  value: any;
}

export interface BadgeConfig {
  [key: string]: {
    label: string;
    color: 'success' | 'warning' | 'danger' | 'info' | 'default';
  };
}

export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: (row: any) => boolean;
  hidden?: (row: any) => boolean;
}

export interface Column<T = any> {
  id: string;
  header: string;
  accessor: string | ((row: T) => any);
  type?: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row: T) => string | React.ReactNode;
  badge?: BadgeConfig;
  actions?: ActionButton[];
  hidden?: boolean;
  sticky?: 'left' | 'right';
}

export interface PaginationConfig {
  enabled: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  showTotal?: boolean;
  showPageSize?: boolean;
}

export interface SelectionConfig {
  enabled: boolean;
  mode?: 'single' | 'multiple';
  onSelectionChange?: (selectedRows: any[]) => void;
}

export interface TableMeta {
  title?: string;
  subtitle?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    stripedRows?: boolean;
    hoverRows?: boolean;
    bordered?: boolean;
    compact?: boolean;
  };
}

export interface TableSchema<T = any> {
  id: string;
  meta: TableMeta;
  columns: Column<T>[];
  pagination?: PaginationConfig;
  selection?: SelectionConfig;
  searchable?: boolean;
  exportable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  onExport?: (format: 'csv' | 'json' | 'excel', data: T[]) => void;
}

export interface TableState {
  page: number;
  pageSize: number;
  sortColumn: string | null;
  sortDirection: SortDirection;
  filters: Record<string, ColumnFilter>;
  searchQuery: string;
  selectedRows: any[];
}

export interface TableActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (column: string, direction: SortDirection) => void;
  setFilter: (column: string, filter: ColumnFilter | null) => void;
  setSearch: (query: string) => void;
  setSelectedRows: (rows: any[]) => void;
  clearFilters: () => void;
  clearSelection: () => void;
}
