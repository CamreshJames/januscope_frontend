import type { TableSchema } from './types';
import { EditIcon, TrashIcon } from '../../utils/icons';

// Roles Table Schema
export const rolesTableSchema: TableSchema = {
  id: 'roles-table',
  meta: {
    title: 'Roles',
    subtitle: 'Manage user roles and permissions',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'roleId',
      header: 'ID',
      accessor: 'roleId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'roleName',
      header: 'Role Name',
      accessor: 'roleName',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'description',
      header: 'Description',
      accessor: 'description',
      type: 'text',
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'date',
      sortable: true,
      width: '120px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'roleId',
      type: 'actions',
      width: '150px',
      actions: [],
    },
  ],
  searchable: true,
  refreshable: true,
};

// Countries Table Schema
export const countriesTableSchema: TableSchema = {
  id: 'countries-table',
  meta: {
    title: 'Countries',
    subtitle: 'Manage country reference data',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'countryCode',
      header: 'Code',
      accessor: 'countryCode',
      type: 'text',
      sortable: true,
      width: '100px',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      type: 'date',
      sortable: true,
      width: '120px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'countryCode',
      type: 'actions',
      width: '150px',
      actions: [],
    },
  ],
  searchable: true,
  refreshable: true,
};

// Branches Table Schema
export const branchesTableSchema: TableSchema = {
  id: 'branches-table',
  meta: {
    title: 'Branches',
    subtitle: 'Manage organizational branches',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'branchId',
      header: 'ID',
      accessor: 'branchId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'code',
      header: 'Code',
      accessor: 'code',
      type: 'text',
      sortable: true,
      width: '100px',
    },
    {
      id: 'countryName',
      header: 'Country',
      accessor: 'countryName',
      type: 'text',
      sortable: true,
    },
    {
      id: 'locationName',
      header: 'Location',
      accessor: 'locationName',
      type: 'text',
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive',
      type: 'badge',
      sortable: true,
      badge: {
        true: { label: 'Active', color: 'success' },
        false: { label: 'Inactive', color: 'default' },
      },
      width: '100px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'branchId',
      type: 'actions',
      width: '150px',
      actions: [],
    },
  ],
  searchable: true,
  refreshable: true,
};

// Locations Table Schema
export const locationsTableSchema: TableSchema = {
  id: 'locations-table',
  meta: {
    title: 'Locations',
    subtitle: 'Manage hierarchical locations',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'locationId',
      header: 'ID',
      accessor: 'locationId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'locationType',
      header: 'Type',
      accessor: 'locationType',
      type: 'badge',
      sortable: true,
      badge: {
        country: { label: 'Country', color: 'info' },
        county: { label: 'County', color: 'success' },
        city: { label: 'City', color: 'warning' },
        site: { label: 'Site', color: 'default' },
      },
      width: '120px',
    },
    {
      id: 'parentName',
      header: 'Parent',
      accessor: 'parentName',
      type: 'text',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'locationId',
      type: 'actions',
      width: '150px',
      actions: [],
    },
  ],
  searchable: true,
  refreshable: true,
};

// Notification Templates Table Schema
export const templatesTableSchema: TableSchema = {
  id: 'templates-table',
  meta: {
    title: 'Notification Templates',
    subtitle: 'Manage email and notification templates',
    theme: {
      primaryColor: '#ff6b35',
      stripedRows: true,
      hoverRows: true,
    },
  },
  columns: [
    {
      id: 'templateId',
      header: 'ID',
      accessor: 'templateId',
      type: 'number',
      sortable: true,
      width: '80px',
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      type: 'text',
      sortable: true,
      filterable: true,
    },
    {
      id: 'eventType',
      header: 'Event Type',
      accessor: 'eventType',
      type: 'badge',
      sortable: true,
      badge: {
        SERVICE_DOWN: { label: 'Service Down', color: 'danger' },
        SERVICE_RECOVERED: { label: 'Service Recovered', color: 'success' },
        SSL_EXPIRY_30: { label: 'SSL 30 Days', color: 'warning' },
        SSL_EXPIRY_14: { label: 'SSL 14 Days', color: 'warning' },
        SSL_EXPIRY_7: { label: 'SSL 7 Days', color: 'danger' },
        SSL_EXPIRY_3: { label: 'SSL 3 Days', color: 'danger' },
      },
      width: '150px',
    },
    {
      id: 'channel',
      header: 'Channel',
      accessor: 'channel',
      type: 'badge',
      sortable: true,
      badge: {
        email: { label: 'Email', color: 'info' },
        telegram: { label: 'Telegram', color: 'info' },
        sms: { label: 'SMS', color: 'info' },
      },
      width: '100px',
    },
    {
      id: 'isActive',
      header: 'Status',
      accessor: 'isActive',
      type: 'badge',
      sortable: true,
      badge: {
        true: { label: 'Active', color: 'success' },
        false: { label: 'Inactive', color: 'default' },
      },
      width: '100px',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'templateId',
      type: 'actions',
      width: '150px',
      actions: [],
    },
  ],
  searchable: true,
  refreshable: true,
};
