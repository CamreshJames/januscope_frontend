import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../../components/BulkImport/BulkImportPage';

function LocationsBulkImportPage() {
  return (
    <BulkImportPage
      title="Bulk Import Locations"
      subtitle="Import multiple locations at once using CSV, Excel, JSON, or XML format"
      backPath="/system/locations"
      backLabel="Back to Locations"
      apiEndpoint="/api/v1/system/locations/bulk-import"
      sampleFiles={[
        { filename: 'locations-sample.csv', label: 'Download CSV Sample' },
      ]}
    />
  );
}

export const Route = createFileRoute('/system/locations/bulk-import')({
  component: LocationsBulkImportPage,
});
