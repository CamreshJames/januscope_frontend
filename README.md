# Januscope Frontend

Modern React-based frontend for the Januscope monitoring system. Built with TypeScript, TanStack Router, and custom reusable components.

## Architecture Overview

### Component-Based Design

The frontend follows a modular component architecture with reusable engines and utilities:

- **Form Engine**: Dynamic form generation from schema definitions
- **Table Engine**: Configurable data tables with sorting, filtering, and pagination
- **Toast System**: Global notification management via React Context
- **API Client**: Centralized HTTP client with encryption support
- **Token Manager**: JWT token storage and refresh logic

### Key Features

- File-based routing with TanStack Router
- Type-safe API calls with TypeScript
- Reusable form and table engines
- Real-time dashboard with Chart.js
- Bulk import/export with CSV and Excel support
- Role-based access control
- Responsive design with custom CSS
- Optional API encryption (AES-256-GCM)

## Project Structure

```
januscope_frontend/
├── src/
│   ├── assets/              # Static assets (images, icons)
│   ├── components/          # Reusable components
│   │   ├── form-engine/     # Dynamic form generation
│   │   ├── table-engine/    # Data table component
│   │   ├── modals/          # Modal dialogs
│   │   ├── Sidebar/         # Navigation sidebar
│   │   ├── Toast/           # Toast notifications
│   │   └── BulkImport/      # Bulk import component
│   ├── config/              # Configuration files
│   │   ├── api.config.ts    # API endpoints
│   │   └── encryption.config.ts  # Encryption settings
│   ├── contexts/            # React contexts
│   │   └── ToastContext.tsx # Global toast state
│   ├── hooks/               # Custom React hooks
│   │   └── useToast.ts      # Toast hook
│   ├── routes/              # File-based routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard page
│   │   ├── services/        # Service management
│   │   ├── contacts/        # Contact groups
│   │   ├── users/           # User management
│   │   ├── system/          # System admin
│   │   ├── charts/          # Analytics
│   │   ├── ssl/             # SSL certificates
│   │   ├── incidents/       # Incidents
│   │   ├── profile/         # User profile
│   │   └── settings/        # Settings
│   ├── services/            # API service layer
│   │   └── januscope.service.ts
│   ├── types/               # TypeScript types
│   │   └── januscope.types.ts
│   ├── utils/               # Utility functions
│   │   ├── api.ts           # HTTP client
│   │   ├── encryption.ts    # Encryption utilities
│   │   ├── tokenManager.ts  # JWT management
│   │   ├── permissions.ts   # Access control
│   │   ├── csvHelpers.ts    # CSV processing
│   │   └── exportHelpers.ts # Export utilities
│   ├── main.tsx             # Application entry
│   └── index.css            # Global styles
├── public/
│   └── samples/             # Sample CSV files
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Technology Stack

- **React 18**: UI library with hooks
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **TanStack Router**: File-based routing with type safety
- **TanStack Query**: Data fetching and caching
- **Chart.js**: Analytics and charts
- **CryptoJS**: Client-side encryption
- **React Hook Form**: Form state management

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:9876
VITE_API_VERSION=v1

# Encryption (optional)
VITE_ENCRYPTION_ENABLED=false
VITE_ENCRYPTION_KEY=your-base64-encryption-key
```

### API Configuration

Edit `src/config/api.config.ts`:

```typescript
export const API_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9876',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  API_BASE_PATH: '/api/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    SERVICES: {
      LIST: '/services',
      CREATE: '/services',
      GET: (id: number) => `/services/${id}`,
      UPDATE: (id: number) => `/services/${id}`,
      DELETE: (id: number) => `/services/${id}`,
      UPTIME: (id: number) => `/services/${id}/uptime`,
      SSL: (id: number) => `/services/${id}/ssl`,
    },
    // ... more endpoints
  },
};
```

### Encryption Configuration

Edit `src/config/encryption.config.ts`:

```typescript
export const ENCRYPTION_CONFIG = {
  enabled: import.meta.env.VITE_ENCRYPTION_ENABLED === 'true',
  key: import.meta.env.VITE_ENCRYPTION_KEY || '',
  algorithm: 'AES-256-GCM',
};
```

## Development

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) or npm

### Install Dependencies

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

The application will start on `http://localhost:5173`

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

## Custom Components

### Form Engine

Dynamic form generation from schema:

```typescript
import { FormEngine } from './components/form-engine/FormEngine';
import type { FormSchema } from './components/form-engine/types';

const schema: FormSchema = {
  id: 'my-form',
  fields: {
    name: {
      id: 'name',
      renderer: 'text',
      label: 'Name',
      rules: { required: 'Name is required' },
    },
    email: {
      id: 'email',
      renderer: 'text',
      inputType: 'email',
      label: 'Email',
      rules: { required: 'Email is required' },
    },
  },
  layout: [
    { kind: 'field', fieldId: 'name' },
    { kind: 'field', fieldId: 'email' },
  ],
};

function MyForm() {
  const handleSubmit = (values: any) => {
    console.log(values);
  };

  return <FormEngine schema={schema} onSubmit={handleSubmit} />;
}
```

### Table Engine

Configurable data tables:

```typescript
import { TableEngine } from './components/table-engine/TableEngine';
import type { TableConfig } from './components/table-engine/types';

const config: TableConfig<Service> = {
  columns: [
    { key: 'name', label: 'Service Name', sortable: true },
    { key: 'url', label: 'URL', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ],
  actions: [
    { label: 'Edit', onClick: (row) => console.log('Edit', row) },
    { label: 'Delete', onClick: (row) => console.log('Delete', row) },
  ],
};

function ServiceTable({ data }: { data: Service[] }) {
  return <TableEngine data={data} config={config} />;
}
```

### Toast Notifications

Global toast system:

```typescript
import { useToast } from './hooks/useToast';

function MyComponent() {
  const { success, error, info, warning } = useToast();

  const handleAction = () => {
    success('Operation completed successfully');
    error('Something went wrong');
    info('Information message');
    warning('Warning message');
  };

  return <button onClick={handleAction}>Show Toast</button>;
}
```

## Routing

File-based routing with TanStack Router. Routes are automatically generated from the `src/routes/` directory structure:

- `/auth/login` → `src/routes/auth/login.tsx`
- `/dashboard` → `src/routes/dashboard/index.tsx`
- `/services` → `src/routes/services/index.tsx`
- `/services/bulk-import` → `src/routes/services/bulk-import.tsx`

## API Integration

Centralized API client with automatic token management:

```typescript
import { authService, servicesService } from './services/januscope.service';

// Login
const response = await authService.login({
  identifier: 'user@example.com',
  password: 'password',
});

// Get services (token automatically included)
const services = await servicesService.getAll(token);

// Create service
const newService = await servicesService.create(data, token);
```

## Bulk Import/Export

Support for multiple file formats:

- JSON
- XML
- CSV
- Excel (XLSX)

Sample CSV files are provided in `public/samples/`:
- `services-sample.csv`
- `contact-groups-sample.csv`
- `countries-sample.csv`
- `branches-sample.csv`
- `locations-sample.csv`

## Authentication Flow

1. User registers (pending admin approval)
2. Admin approves and system generates credentials
3. User receives welcome email with username/password
4. User logs in with credentials
5. JWT tokens stored in localStorage
6. Automatic token refresh on expiry
7. Forgot password flow with email reset link

## Security Features

- JWT-based authentication
- Automatic token refresh
- Optional API request/response encryption
- Role-based access control
- Secure password reset flow
- XSS protection
- CSRF protection via tokens

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright 2025 Sky World Limited. All rights reserved.
