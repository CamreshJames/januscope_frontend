import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../../components/BulkImport/BulkImportPage';

function LocationsBulkImportsPage() {
  return (
    <BulkImportPage
      title="Bulk Import Locations"
      subtitle="Import multiple locations at once using CSV, Excel, JSON, or XML format"
      backPath="/system/locations"
      backLabel="Back to Locations"
      apiEndpoint="/system/locations/bulk-import"
      sampleFiles={[
        { filename: 'locations-sample.csv', label: 'Locations Sample CSV' },
      ]}
    />
  );
}

export const Route = createFileRoute('/system/locations/bulk-imports')({
  component: LocationsBulkImportsPage,
});
