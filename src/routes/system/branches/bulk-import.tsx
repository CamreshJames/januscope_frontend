import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../../components/BulkImport/BulkImportPage';

function BranchesBulkImportPage() {
  return (
    <BulkImportPage
      title="Bulk Import Branches"
      subtitle="Import multiple branches at once using CSV, Excel, JSON, or XML format"
      backPath="/system/branches"
      backLabel="Back to Branches"
      apiEndpoint="/system/branches/bulk-import"
      sampleFiles={[
        { filename: 'branches-sample.csv', label: 'Branches Sample CSV' },
      ]}
    />
  );
}

export const Route = createFileRoute('/system/branches/bulk-import')({
  component: BranchesBulkImportPage,
});
