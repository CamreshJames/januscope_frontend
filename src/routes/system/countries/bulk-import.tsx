import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../../components/BulkImport/BulkImportPage';

function CountriesBulkImportPage() {
  return (
    <BulkImportPage
      title="Bulk Import Countries"
      subtitle="Import multiple countries at once using CSV, Excel, JSON, or XML format"
      backPath="/system/countries"
      backLabel="Back to Countries"
      apiEndpoint="/api/v1/system/countries/bulk-import"
      sampleFiles={[
        { filename: 'countries-sample.csv', label: 'Download CSV Sample' },
      ]}
    />
  );
}

export const Route = createFileRoute('/system/countries/bulk-import')({
  component: CountriesBulkImportPage,
});
