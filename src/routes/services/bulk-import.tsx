import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../components/BulkImport/BulkImportPage';

function ServicesBulkImportPage() {
  return (
    <BulkImportPage
      title="Bulk Import Services"
      subtitle="Import multiple monitored services from a file"
      backPath="/services"
      backLabel="Back to Services"
      apiEndpoint="/bulk/services/import"
      sampleFiles={[
        { filename: 'services-sample.csv', label: 'Services Sample CSV' },
      ]}
    />
  );
}

export const Route = createFileRoute('/services/bulk-import')({
  component: ServicesBulkImportPage,
});
