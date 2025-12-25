import { useQuery } from '@tanstack/react-query';
import type { DevPersonasResponse } from '@lome-chat/shared';

const API_URL = import.meta.env['VITE_API_URL'] as string;

export const devPersonaKeys = {
  all: ['dev-personas'] as const,
  list: () => [...devPersonaKeys.all, 'list'] as const,
};

export function useDevPersonas(): ReturnType<typeof useQuery<DevPersonasResponse, Error>> {
  return useQuery({
    queryKey: devPersonaKeys.list(),
    queryFn: async (): Promise<DevPersonasResponse> => {
      const response = await fetch(`${API_URL}/dev/personas`);
      if (!response.ok) {
        throw new Error('Failed to fetch dev personas');
      }
      return response.json() as Promise<DevPersonasResponse>;
    },
    enabled: import.meta.env.DEV,
  });
}
