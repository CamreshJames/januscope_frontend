import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../../components/BulkImport/BulkImportPage';

function CountriesBulkImportsPage() {
  return (
    <BulkImportPage
      title="Bulk Import Countries"
      subtitle="Import multiple countries at once using CSV, Excel, JSON, or XML format"
      backPath="/system/countries"
      backLabel="Back to Countries"
      apiEndpoint="/system/countries/bulk-import"
      sampleFiles={[
        { filename: 'countries-sample.csv', label: 'Countries Sample CSV' },
      ]}
    />
  );
}

export const Route = createFileRoute('/system/countries/bulk-imports')({
  component: CountriesBulkImportsPage,
});
