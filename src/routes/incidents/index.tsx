import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TableEngine } from '../../components/table-engine';
import { incidentsTableSchema } from '../../components/table-engine/examples';
import { useToast } from '../../hooks/useToast';
import { servicesService, incidentsService } from '../../services/januscope.service';
import type { Incident } from '../../types/januscope.types';

function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError, info } = useToast();

  const token = localStorage.getItem('accessToken') || '';

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const servicesResponse = await servicesService.getAll(token);
      if (!servicesResponse.success || !servicesResponse.data) {
        showError('Failed to load services');
        setLoading(false);
        return;
      }

      const allIncidents: Incident[] = [];
      for (const service of servicesResponse.data) {
        try {
          const incidentsResponse = await incidentsService.getByService(service.serviceId, token);
          if (incidentsResponse.success && incidentsResponse.data) {
            allIncidents.push(...incidentsResponse.data);
          }
        } catch (err) {
          console.error(`Error loading incidents for service ${service.serviceId}:`, err);
        }
      }

      setIncidents(allIncidents);
    } catch (err) {
      showError('Failed to load incidents');
      console.error('Error loading incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleRefresh = () => {
    info('Refreshing incidents...');
    loadIncidents();
  };

  const handleResolve = (row: Incident) => {
    info(`Resolving incident #${row.id}...`);
    setTimeout(() => {
      success(`Incident #${row.id} has been marked as resolved!`);
      loadIncidents();
    }, 1000);
  };

  return (
    <TableEngine
      schema={{
        ...incidentsTableSchema,
        onRefresh: handleRefresh,
        columns: incidentsTableSchema.columns.map((col) => {
          if (col.id === 'actions') {
            return {
              ...col,
              actions: [
                {
                  label: 'Resolve',
                  onClick: handleResolve,
                  variant: 'primary' as const,
                  hidden: (row: Incident) => row.status === 'RESOLVED',
                },
              ],
            };
          }
          return col;
        }),
      }}
      data={incidents}
      loading={loading}
      primaryColor="#ff6b35"
    />
  );
}

export const Route = createFileRoute('/incidents/')({
  component: IncidentsPage,
});
