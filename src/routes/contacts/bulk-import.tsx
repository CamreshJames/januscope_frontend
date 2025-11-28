import { createFileRoute } from '@tanstack/react-router';
import { BulkImportPage } from '../../components/BulkImport/BulkImportPage';

function ContactsBulkImportPage() {
  return (
    <BulkImportPage
      title="Bulk Import Contact Groups"
      subtitle="Import multiple contact groups and members from a file"
      backPath="/contacts"
      backLabel="Back to Contacts"
      apiEndpoint="/bulk/import"
      sampleFiles={[
        { filename: 'contact-groups-sample.csv', label: 'Contact Groups Sample' },
      ]}
    />
  );
}

export const Route = createFileRoute('/contacts/bulk-import')({
  component: ContactsBulkImportPage,
});
