# Table Engine Documentation

## Overview

The Table Engine is a powerful, config-driven table component that follows the same pattern as the Form Engine. It provides a declarative way to create feature-rich data tables with sorting, filtering, pagination, selection, and custom actions.

## Features

- Config-driven schema
- Sorting (single column)
- Search/filtering
- Pagination with customizable page sizes
- Row selection (single or multiple)
- Custom cell renderers
- Badge support for status indicators
- Action buttons per row
- Sticky columns
- Responsive design
- Loading states
- Empty states
- Theming support
- Export functionality (planned)

## Basic Usage

```typescript
import { TableEngine } from './components/table-engine';
import type { TableSchema } from './components/table-engine';

const schema: TableSchema = {
  id: 'my-table',
  meta: {
    title: 'My Data Table',
    subtitle: 'Manage your data',
  },
  columns: [
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
    },
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
    },
  ],
  pagination: {
    enabled: true,
    pageSize: 10,
  },
  searchable: true,
};

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <TableEngine
      schema={schema}
      data={data}
      loading={loading}
    />
  );
}
```

## Schema Structure

### TableSchema

```typescript
interface TableSchema {
  id: string;                    // Unique identifier
  meta: TableMeta;               // Table metadata
  columns: Column[];             // Column definitions
  pagination?: PaginationConfig; // Pagination settings
  selection?: SelectionConfig;   // Row selection settings
  searchable?: boolean;          // Enable search
  exportable?: boolean;          // Enable export
  refreshable?: boolean;         // Show refresh button
  onRefresh?: () => void;        // Refresh callback
  onExport?: (format) => void;   // Export callback
}
```

### TableMeta

```typescript
interface TableMeta {
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
```

### Column

```typescript
interface Column {
  id: string;                           // Unique column ID
  header: string;                       // Column header text
  accessor: string | ((row) => any);    // Data accessor
  type?: ColumnType;                    // Column type
  sortable?: boolean;                   // Enable sorting
  filterable?: boolean;                 // Enable filtering
  width?: string | number;              // Column width
  minWidth?: string | number;           // Minimum width
  maxWidth?: string | number;           // Maximum width
  align?: 'left' | 'center' | 'right'; // Text alignment
  format?: (value, row) => any;         // Custom formatter
  badge?: BadgeConfig;                  // Badge configuration
  actions?: ActionButton[];             // Action buttons
  hidden?: boolean;                     // Hide column
  sticky?: 'left' | 'right';           // Sticky positioning
}
```

## Column Types

### Text
```typescript
{
  id: 'name',
  header: 'Name',
  accessor: 'name',
  type: 'text',
  sortable: true,
}
```

### Number
```typescript
{
  id: 'age',
  header: 'Age',
  accessor: 'age',
  type: 'number',
  sortable: true,
  format: (value) => `${value} years`,
}
```

### Date
```typescript
{
  id: 'createdAt',
  header: 'Created',
  accessor: 'createdAt',
  type: 'date',
  sortable: true,
}
```

### Boolean
```typescript
{
  id: 'active',
  header: 'Active',
  accessor: 'active',
  type: 'boolean',
}
```

### Badge
```typescript
{
  id: 'status',
  header: 'Status',
  accessor: 'status',
  type: 'badge',
  badge: {
    active: { label: 'Active', color: 'success' },
    inactive: { label: 'Inactive', color: 'danger' },
    pending: { label: 'Pending', color: 'warning' },
  },
}
```

Badge colors: `success`, `warning`, `danger`, `info`, `default`

### Actions
```typescript
{
  id: 'actions',
  header: 'Actions',
  accessor: 'id',
  type: 'actions',
  actions: [
    {
      label: 'Edit',
      icon: <EditIcon />,
      onClick: (row) => handleEdit(row),
      variant: 'ghost',
    },
    {
      label: 'Delete',
      icon: <TrashIcon />,
      onClick: (row) => handleDelete(row),
      variant: 'danger',
      disabled: (row) => row.protected,
    },
  ],
}
```

Action variants: `primary`, `secondary`, `danger`, `ghost`

### Custom
```typescript
{
  id: 'custom',
  header: 'Custom',
  accessor: 'data',
  type: 'custom',
  format: (value, row) => (
    <div className="custom-cell">
      <img src={row.avatar} alt={row.name} />
      <span>{row.name}</span>
    </div>
  ),
}
```

## Advanced Features

### Nested Accessors
```typescript
{
  id: 'userEmail',
  header: 'User Email',
  accessor: 'user.email',  // Nested property
}
```

### Function Accessors
```typescript
{
  id: 'fullName',
  header: 'Full Name',
  accessor: (row) => `${row.firstName} ${row.lastName}`,
}
```

### Custom Formatters
```typescript
{
  id: 'price',
  header: 'Price',
  accessor: 'price',
  format: (value) => `$${value.toFixed(2)}`,
}
```

### Conditional Actions
```typescript
{
  id: 'actions',
  header: 'Actions',
  accessor: 'id',
  type: 'actions',
  actions: [
    {
      label: 'Approve',
      onClick: (row) => approve(row),
      variant: 'primary',
      hidden: (row) => row.approved,  // Hide if already approved
    },
    {
      label: 'Delete',
      onClick: (row) => deleteRow(row),
      variant: 'danger',
      disabled: (row) => row.protected,  // Disable if protected
    },
  ],
}
```

### Sticky Columns
```typescript
{
  id: 'name',
  header: 'Name',
  accessor: 'name',
  sticky: 'left',  // Stick to left side
}
```

## Pagination

```typescript
pagination: {
  enabled: true,
  pageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  showTotal: true,
  showPageSize: true,
}
```

## Selection

### Multiple Selection
```typescript
selection: {
  enabled: true,
  mode: 'multiple',
  onSelectionChange: (selectedRows) => {
    console.log('Selected:', selectedRows);
  },
}
```

### Single Selection
```typescript
selection: {
  enabled: true,
  mode: 'single',
  onSelectionChange: (selectedRows) => {
    console.log('Selected:', selectedRows[0]);
  },
}
```

## Theming

### Via Schema
```typescript
meta: {
  theme: {
    primaryColor: '#ff6b35',
    secondaryColor: '#6b7280',
    stripedRows: true,
    hoverRows: true,
    bordered: false,
    compact: false,
  },
}
```

### Via Props
```typescript
<TableEngine
  schema={schema}
  data={data}
  primaryColor="#ff6b35"
  secondaryColor="#6b7280"
/>
```

## Complete Example

```typescript
import { TableEngine } from './components/table-engine';
import { EditIcon, TrashIcon } from './utils/icons';

const servicesSchema: TableSchema = {
  id: 'services-table',
  meta: {
    title: 'Services',
    subtitle: 'Monitor your services',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'name',
      header: 'Service Name',
      accessor: 'name',
      sortable: true,
      width: '200px',
    },
    {
      id: 'url',
      header: 'URL',
      accessor: 'url',
      width: '300px',
    },
    {
      id: 'type',
      header: 'Type',
      accessor: 'type',
      type: 'badge',
      badge: {
        HTTP: { label: 'HTTP', color: 'info' },
        HTTPS: { label: 'HTTPS', color: 'success' },
      },
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'active',
      type: 'badge',
      badge: {
        true: { label: 'Active', color: 'success' },
        false: { label: 'Inactive', color: 'danger' },
      },
    },
    {
      id: 'checkInterval',
      header: 'Interval',
      accessor: 'checkInterval',
      format: (value) => `${value}s`,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      type: 'actions',
      actions: [
        {
          label: 'Edit',
          icon: <EditIcon />,
          onClick: (row) => handleEdit(row),
          variant: 'ghost',
        },
        {
          label: 'Delete',
          icon: <TrashIcon />,
          onClick: (row) => handleDelete(row),
          variant: 'danger',
        },
      ],
    },
  ],
  pagination: {
    enabled: true,
    pageSize: 10,
    pageSizeOptions: [10, 25, 50],
    showTotal: true,
    showPageSize: true,
  },
  selection: {
    enabled: true,
    mode: 'multiple',
    onSelectionChange: (rows) => setSelectedServices(rows),
  },
  searchable: true,
  refreshable: true,
  onRefresh: () => fetchServices(),
};

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    const data = await servicesService.getAll(token);
    setServices(data);
    setLoading(false);
  };

  const handleEdit = (service) => {
    // Edit logic
  };

  const handleDelete = (service) => {
    // Delete logic
  };

  return (
    <div className="page">
      <TableEngine
        schema={servicesSchema}
        data={services}
        loading={loading}
      />
    </div>
  );
}
```

## Mobile Responsive

The table is fully responsive:
- Horizontal scroll on mobile
- Stacked pagination controls
- Touch-friendly buttons
- Optimized spacing

## Accessibility

- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Performance

- Memoized data processing
- Efficient sorting and filtering
- Virtual scrolling (planned)
- Lazy loading support (planned)

## Best Practices

1. **Use meaningful column IDs**: Make them descriptive and unique
2. **Provide proper accessors**: Use nested paths or functions for complex data
3. **Format data appropriately**: Use formatters for dates, numbers, currency
4. **Handle loading states**: Always show loading indicator during data fetch
5. **Implement error handling**: Show error messages when data fails to load
6. **Use badges wisely**: Don't overuse colors, keep it consistent
7. **Limit actions**: 2-3 actions per row is optimal
8. **Enable pagination**: For large datasets (>50 rows)
9. **Make columns sortable**: When it makes sense for the data
10. **Test on mobile**: Ensure horizontal scroll works smoothly

---

**Version:** 1.0  
**Last Updated:** November 17, 2025  
**Pattern:** Config-driven, following Form Engine approach
