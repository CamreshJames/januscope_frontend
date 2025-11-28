import { useState, useEffect, useCallback } from 'react';
import { createApiClient, type ApiResponse } from './api';

interface ApiHookConfig {
  baseUrl?: string;
  token?: string;
  defaultMethod?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  skip?: boolean;
  cacheTime?: number;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache: Record<string, CacheEntry> = {};

function getCachedData(key: string, cacheTime: number = 2000): any | null {
  const entry = cache[key];
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > cacheTime;
  if (isExpired) {
    delete cache[key];
    return null;
  }

  return entry.data;
}

function setCachedData(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  };
}

export function useFetch<T>(endpoint: string, config: ApiHookConfig = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!config.skip);
  const [error, setError] = useState<string | null>(null);
  const apiClient = createApiClient(config.baseUrl || '');
  const cacheTime = config.cacheTime || 2000;

  const fetchData = useCallback(
    async (skipCache = false) => {
      if (config.skip) return;

      const cacheKey = `${endpoint}:${config.token || ''}`;

      if (!skipCache) {
        const cachedData = getCachedData(cacheKey, cacheTime);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get<T>(endpoint, { token: config.token });

        if (response.success) {
          setCachedData(cacheKey, response.data);
          setData(response.data);
        } else {
          setError(response.error || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
      }

      setLoading(false);
    },
    [endpoint, config.token, config.skip, apiClient, cacheTime]
  );

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

export function useMutate<T>(endpoint: string, config: ApiHookConfig = {}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const apiClient = createApiClient(config.baseUrl || '');

  const mutate = useCallback(
    async (data: Partial<T>, method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE') => {
      setLoading(true);
      setError(null);

      const effectiveMethod = method || config.defaultMethod || 'PUT';
      let response: ApiResponse<T>;

      try {
        switch (effectiveMethod) {
          case 'POST':
            response = await apiClient.post<T>(endpoint, data, { token: config.token });
            break;
          case 'PUT':
            response = await apiClient.put<T>(endpoint, data, { token: config.token });
            break;
          case 'PATCH':
            response = await apiClient.patch<T>(endpoint, data, { token: config.token });
            break;
          case 'DELETE':
            response = await apiClient.delete<T>(endpoint, { token: config.token });
            break;
          default:
            response = await apiClient.put<T>(endpoint, data, { token: config.token });
        }

        if (!response.success) {
          setError(response.error || 'Mutation failed');
          setLoading(false);
          return false;
        }

        Object.keys(cache).forEach((key) => {
          if (key.includes(endpoint.split('?')[0])) {
            delete cache[key];
          }
        });

        setLoading(false);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error');
        setLoading(false);
        return false;
      }
    },
    [endpoint, config.token, config.defaultMethod, apiClient]
  );

  return { mutate, loading, error };
}
